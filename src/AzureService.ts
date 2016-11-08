import { AzureState, AzureStateSubscription } from './AzureState';
import * as AzureModels from './Models';

var resourceManager = require('azure-arm-resource');

var msRestAzure = require('ms-rest-azure');
var getUrls = require('get-urls');
var cp = require('copy-paste');

export class AzureService {
    _state: AzureState;
    _stateChangeHandlers: Array<{ (state: AzureState): void }> = [];

    constructor(state: AzureState) {
        console.log("Azure Service created.");
        this._state = state;
    }

    onStateChange(handler: { (state: AzureState): void }) {
        this._stateChangeHandlers.push(handler);
    }

    offStateChange(handler: { (state: AzureState): void }) {
        this._stateChangeHandlers = this._stateChangeHandlers.filter(h => h !== handler);
    }

    getActiveSubscriptions(): Array<AzureStateSubscription> {
        return this._state.subscriptions;
    }

    getAvailableRegionsForActiveSubscription(): Thenable<AzureModels.Region[]> {
        return new Promise((resolve, reject) => {
            // "special" client
            let client = new resourceManager.SubscriptionClient(this._state.credentials);

            client.subscriptions.listLocations(this._state.selectedSubscription.id, function (err, result) {
                if (err) reject(err);

                let items: AzureModels.Region[] = result.map(item => {
                    return <AzureModels.Region>
                        {
                            name: item.displayName,
                            id: item.id
                        };
                });

                resolve(items);
            });
        });
    }

    setActiveSubscription(name: string, id: string): Thenable<any> {
        return new Promise((resolve, reject) => {
            var activeSubscription = this._state.subscriptions.find(item => { return item.name == name && item.id === id });
            if (!activeSubscription) {
                reject("Could not find the subscription, something went wrong.");
            }

            this._state.selectedSubscription = activeSubscription;
            console.log("Active subscription has been set to " + activeSubscription);
            resolve(this._state);
        });
    }

    createNewResourceGroup(name: string): Thenable<any> {
        return new Promise((resolve, reject) => {
            var client = _createArmClient(this._state);
        });
    }

    interactiveLogin(callbackOnToken: { (token: string, url: string): void; }): Thenable<any> {
        // TODO: assert callback is a function
        var state = this._state;

        var options = {
            userCodeResponseLogger: function (message) {
                // TODO: find a better way to do this, if possible
                let enterCodeString: string = 'Enter the code ';
                // extract the code to be copied to the clipboard from the message
                var codeCopied = message.substring(message.indexOf(enterCodeString)
                    + enterCodeString.length).replace(' to authenticate.', '');

                let urls = getUrls(message);
                // copy to clipboard, extract URL and pass to callback
                cp.copy(codeCopied);

                callbackOnToken(codeCopied, urls[0]);
            }
        };

        return new Promise((resolve, reject) => {
            msRestAzure.interactiveLogin(options, function (err, credentials, subscriptions) {
                if (err) {
                    console.log("There was an error: " + err);
                    reject(err);
                }

                if (!subscriptions || !(subscriptions.length > 0)) {
                    reject("There are no subscriptions associated with the login.");
                    return;
                }

                // fill some information into the state
                state.username = credentials.username;
                state.credentials = credentials;

                // re-initialize the subscriptions array
                state.subscriptions = [];

                for (let i = 0; i < subscriptions.length; i++) {
                    let sub = subscriptions[i];
                    state.subscriptions.push({
                        id: sub.id,
                        name: sub.name,
                        environmentName: sub.environmentName,
                        tenantId: sub.tenantId
                    });
                }

                // default selection to first subscription
                // TODO: this should be a config option, to default to a sub id
                state.selectedSubscription = state.subscriptions[0];

                credentials.retrieveTokenFromCache(function (notUsed, tokenType, accessToken) {
                    // update the access token, as well
                    state.accessToken = accessToken;

                    resolve(state);
                });
            });
        });

    }

    getFullResourceList(): Thenable<AzureModels.Resource[]> {
        return new Promise((resolve, reject) => {
            let client = _createArmClient(this._state);

            client.resources.list(function (err, result) {
                if (err) {
                    reject(err);
                }

                var final = result.map((item) => {
                    let x: AzureModels.Resource = {
                        _object: item,
                        id: item.id,
                        url: '',
                        name: item.name
                    };

                    // a bit hackish, but we have to do it this way
                    if (item.kind) {
                        x.kind = item.kind
                    }

                    return x;
                });

                resolve(final);
            });
        });
    }
}

function _createArmClient(state: AzureState): any {
    return new resourceManager.ResourceManagementClient(state.credentials, state.selectedSubscription.id);
}