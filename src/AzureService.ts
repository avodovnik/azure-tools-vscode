import {AzureState} from './AzureState'

export class AzureService
{
    _state : AzureState;

    constructor(state : AzureState) {
        console.log("Azure Service created.");
        this._state = state;
    } 

    
}