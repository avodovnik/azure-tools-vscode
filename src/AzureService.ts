import { AzureState, AzureStateSubscription } from './AzureState';

var msRestAzure = require('ms-rest-azure');
var getUrls = require('get-urls');
var cp = require('copy-paste');

export class AzureService {
    _state: AzureState;

    constructor(state: AzureState) {
        console.log("Azure Service created.");
        this._state = state;
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

                // fill some information into the state
                state.username = credentials.username;
                state.credentials = credentials;

                // re-initialize the subscriptions array
                state.subscriptions = new Array<AzureStateSubscription>(subscriptions.length);

                for (let i = 0; i < subscriptions.length; i++) {
                    let sub = subscriptions[i];
                    state.subscriptions.push({
                        id: sub.id,
                        name: sub.name,
                        environmentName: sub.environmentName,
                        tenantId: sub.tenantId
                    });
                }

                console.log(credentials);

                resolve();
            });
        });

    }
}