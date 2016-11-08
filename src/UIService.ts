import * as vscode from 'vscode';
import { AzureState } from './AzureState';
import * as constants from './strings';

// TODO: support for proper long-running actions and status updates
export class UIService {
    _uiInitialized: boolean = false;

    _btnSubscription: vscode.StatusBarItem = null;
    _btnRegion: vscode.StatusBarItem = null;

    renderState(state: AzureState) {
        if (!this._uiInitialized) { this.initUi(state); }

        // update the buttons
        this._btnSubscription.tooltip = constants.uiResource.statusBarElements.subscription.tooltip.replace("{0}", state.selectedSubscription.name);
        this._btnRegion.tooltip = state.selectedRegion ? 
            constants.uiResource.statusBarElements.region.tooltip.replace('{0}', state.selectedRegion.name)
            : constants.uiResource.statusBarElements.region.noRegionTooltip;
    }

    private initUi(state: AzureState) {

        if (!state.selectedSubscription) {
            console.log("Cannot render UI, as no subscription is active.");
            return;
        }

        // we need two status bar buttons
        this._btnSubscription = this.createStatusBarButton({
            text: "$(cloud-upload)",
            command: "azure.selectSubscription",
            tooltip: constants.uiResource.statusBarElements.subscription.tooltip.replace("{0}", state.selectedSubscription.name)
        });

        this._btnRegion = this.createStatusBarButton({
            text: "$(globe)",
            command: "azure.selectRegion",
            tooltip: constants.uiResource.statusBarElements.region.noRegionTooltip
        });

        this._uiInitialized = true;
    }

    private createStatusBarButton(specs: StatusBarButton): vscode.StatusBarItem {
        let btn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);

        btn.command = specs.command;
        btn.text = specs.text;
        btn.tooltip = specs.tooltip;

        btn.show();

        return btn;
    }
}

interface StatusBarButton {
    text: string,
    command: string,
    tooltip: string
}