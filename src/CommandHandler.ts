import { AzureService } from './AzureService';
import { AzureState } from './AzureState';
import { UIService } from './UIService';
import * as constants from './strings';
import * as Models from './Models';

// TODO: this is sort of cheating...
import * as vscode from 'vscode';


var open = require('open');

export class CommandHandler {
    _azureService: AzureService;
    _uiService: UIService;

    constructor(azureService: AzureService, uiService: UIService) {
        this._azureService = azureService;
        this._uiService = uiService;
    }

    /** 
     * Checks to see if we have an active session.
     * Displays an error message if not.
     */
    checkActiveState() : boolean {
        if(this._azureService._state.credentials) return true;

        vscode.window.showErrorMessage(constants.uiResource.login.noValidLogin);
        return false;
    }

    /** Starts the interactive login process, copying the code to the clipboard
     * and opening the browser, to start the process for the user.
     */
    performLogin() {

        let ui = this._uiService;
        // notify the UI
        let updateMessage = vscode.window.setStatusBarMessage(constants.uiResource.login.begin);

        this._azureService.interactiveLogin((token, url) => {
            // show the user a message
            // TODO: think about moving this to UI service
            vscode.window.showInformationMessage(constants.uiResource.login.startMessage.replace("{0}", token), {
                title: constants.uiResource.login.elements.signInButton
            }).then(function (btn) {
                if (!btn) {
                    vscode.window.setStatusBarMessage("Sign In Aborted...");
                    return;
                }

                if (btn.title === constants.uiResource.login.elements.signInButton) {
                    // launch the URL to sign the user in
                    open(url);
                }
            });
        }).then((state: AzureState) => {

            // we need to update the UI to reflect new state
            ui.renderState(state);

            vscode.window.showInformationMessage(constants.uiResource.login.success.replace("{0}", state.username));

            // clear the status bar message
            updateMessage.dispose();

        }, (reason) => {

            let error = "There was an error signing you in.";
            if (reason) {
                error = error + ' ' + reason;
            }
            vscode.window.showErrorMessage(error);

            // remember to clear the message, otherwsie it just stays stuck there
            updateMessage.dispose();
        });
    }

    selectSubscription() {
        if(!this.checkActiveState()) return;

        let status = vscode.window.setStatusBarMessage(constants.uiResource.subscriptionSelection.status);
        // map all subscriptions into ui item, and render into quick pick
        var items = this._azureService.getActiveSubscriptions().map(sub => {
            let item: vscode.QuickPickItem = {
                label: sub.name,
                description: sub.id
            };

            return item;
        });

        let ui = this._uiService;
        vscode.window.showQuickPick(items).then(selected => {
            if (!selected) { status.dispose(); return; }

            this._azureService.setActiveSubscription(selected.label, selected.description)
                .then((state => {
                    vscode.window.showInformationMessage(constants.uiResource.subscriptionSelection.finish.replace('{0}', (state as AzureState).selectedSubscription.name));
                    // re-render the state
                    ui.renderState(state as AzureState);
                    // clean up UI status
                    status.dispose();
                }), (reason => {
                    vscode.window.showErrorMessage("There was a problem selecting the subscription: " + reason);
                    status.dispose();
                }))
        });
    }

    browseInPortal() {
        if(!this.checkActiveState()) return;
        
        let status = vscode.window.setStatusBarMessage("Opening portal...");

        this._azureService.getFullResourceList().then((items) => {
            var quickPickItems = items.map(x => {
                return <Models.QuickListItemWithId>
                    {
                        label: x.name,
                        description: x.kind,
                        id: x.id
                    };
            });

            vscode.window.showQuickPick(quickPickItems).then(selected => {
                status.dispose();
                if (!selected) { return; }

                open(constants.config.portalUrl + selected.id);
            });


        }, (reason) => {
            vscode.window.showErrorMessage("There was a problem listing all resources: " + reason);
            status.dispose();
        });


    }

}