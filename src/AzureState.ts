// we'll pass this along the various services, so best
// to declare as interface
export interface AzureState {
    credentials?: string,
    accessToken?: string,
    subscriptions?: Array<AzureStateSubscription>,
    selectedSubscription?: AzureStateSubscription
}

export interface AzureStateSubscription {
    name: string,
    id: string
}