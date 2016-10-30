/****************************************************
 *          Azure Tools for VS code                 *
 ****************************************************/
'use strict';
import * as vscode from 'vscode';
import * as strings from './strings';
import { AzureState } from './AzureState';
import { AzureService } from './AzureService';
import { CommandHandler } from './CommandHandler';

var msRestAzure = require('ms-rest-azure');
var getUrls = require('get-urls');
var open = require('open');

var _state: AzureState = null;

export function activate(context: vscode.ExtensionContext) {

    // instantiate the azure state with this particular instance as well
    _state = {};

    // create the instance of the Azure service we'll be using
    let azureService = new AzureService(_state);
    let commandHandler = new CommandHandler(azureService);

    console.log('Azure Tools are now active.');

    internalRegisterCommand(context, 'hello', () => commandHandler.performLogin());
    
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

function performLogin() {
    var options = {
        userCodeResponseLogger: null
    };

    options.userCodeResponseLogger = function (message) {
        // extract the code to be copied to the clipboard from the message
        console.log(message);


        open(getUrls(message)[0]);
    }

    msRestAzure.interactiveLogin(options, function (err, credentials) {
        if (err) return console.log(err);
        console.log("something happened, not sure if ok");
    });
}


