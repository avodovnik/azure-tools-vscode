export const uiResource = {
    login: {
        begin: 'Logging into Azure and getting your list of subscriptions...',
        startMessage: 'The code {0} has been copied to your clipboard. Click Sign In and paste in the code to authenticate.',
        success: 'You are now signed in as {0}.',
        elements: {
            signInButton: "Sign In"
        },
        noValidLogin: 'You are not currently logged in. Please login first, then try again.'
    },
    subscriptionSelection: {
        status: 'Selecting Azure Subscription...',
        finish: 'Azure Subscription ({0}) was success.'
    },
    statusBarElements: {
        subscription: {
            tooltip: "Selected subscription: {0}. Click to change."
        },
        region: {
            tooltip: "Selected region: {0}. Click to change.",
            noRegionTooltip: "No region selected. Click to select."
        }
    }
};

export const config = {
    portalUrl: 'https://portal.azure.com/#resource'
}