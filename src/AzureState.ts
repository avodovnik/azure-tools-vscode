import * as vscode from 'vscode';

// we'll pass this along the various services, so best
// to declare as interface
export interface AzureState {
    tenantId?: string, // loaded from config
    credentials?: string,
    accessToken?: string,
    subscriptions?: Array<AzureStateSubscription>,
    selectedSubscription?: AzureStateSubscription,
    username?: string
}

export interface AzureStateSubscription {
    name: string,
    id: string,
    tenantId: string,
    environmentName: string
}

// tries to load the (existing) state from config (e.g. tenantId)
export function LoadStateFromConfig(state: AzureState) {
    var f = vscode.workspace.getConfiguration('azure');
    if (!f) return;

    if (f.has('tenantId')) {
        let tenantId = f.get<string>('tenantId');
        state.tenantId = tenantId;
        console.log("TenantId: " + tenantId);
    }

    console.log("Finished loading state from config.");
}