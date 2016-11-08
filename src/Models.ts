import * as vscode from 'vscode';

export interface Resource {
    name : string,
    url : string,
    kind? : string,
    id : string,
    _object : any
}

export interface QuickListItemWithId extends vscode.QuickPickItem {
    id : any
}