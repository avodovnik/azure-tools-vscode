/****************************************************
 *          Azure Tools for VS code                 *
 ****************************************************/
'use strict';
import * as vscode from 'vscode';
import * as strings from './strings';
// import { AzureState } from './AzureState';
import * as azState from './AzureState';
import { AzureService } from './AzureService';
import { CommandHandler } from './CommandHandler';
import { UIService } from './UIService';

let _state: azState.AzureState = {};

export function activate(context: vscode.ExtensionContext) {

    // load the state from the config
    azState.LoadStateFromConfig(_state);

    // create the instance of the Azure service we'll be using
    let azureService = new AzureService(_state);
    let uiService = new UIService();
    let commandHandler = new CommandHandler(azureService, uiService);

    console.log('Azure Tools are now active.');

    internalRegisterCommand(context, 'login', () => commandHandler.performLogin());

    // internalRegisterCommand(context, 'sayHello', () => {
    //     vscode.window.showInformationMessage(strings.uiResource.helloWorldMessage);
    // });

    // let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
    //     vscode.window.showInformationMessage(strings.uiResource.helloWorldMessage);
    //     _state.accessToken = "This is a test.";
    // });

    // context.subscriptions.push(disposable);
}

function internalRegisterCommand(context: vscode.ExtensionContext,
    name: String, handler: (...args: any[]) => any) {

    let disposable = vscode.commands.registerCommand('azure.' + name, () => {
        console.log("Invoking command " + name);
        handler();
    });

    context.subscriptions.push(disposable);
    console.log("Command " + name + " has been registered.");
}


export function deactivate() {
    // we don't currently need any specific deactivation to happen
}
