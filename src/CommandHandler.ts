import { AzureService } from './AzureService';
import { UIService } from './UIService';
import * as constants from './strings';

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

    /** Starts the interactive login process, copying the code to the clipboard
     * and opening the browser, to start the process for the user.
     */
    performLogin() {
        // notify the UI
        vscode.window.setStatusBarMessage(constants.uiResource.login.begin);

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
        }).then(() => {
            vscode.window.showInformationMessage("Signed in.");
        }, () => {
            vscode.window.showErrorMessage("There was an error signing you in.");
        });
    }

}