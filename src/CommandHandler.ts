import { AzureService } from './AzureService';

export class CommandHandler {
    _azureService : AzureService;

    constructor(azureService: AzureService) {
        this._azureService = azureService;
    }

    /** Starts the interactive login process, copying the code to the clipboard
     * and opening the browser, to start the process for the user.
     */
    performLogin() {
        console.log("Hello, it's me. I was wondering if after all this years you'd like to meet?");    
    } 

}