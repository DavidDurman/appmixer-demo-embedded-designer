const QUERY_PARAMS = new URLSearchParams(window.location.search);

// This should have the pattern https://api.YOUR_TENANT.appmixer.cloud';
let APPMIXER_API_URL = QUERY_PARAMS.get('apiUrl');
if (!APPMIXER_API_URL) {
    APPMIXER_API_URL = prompt('Please provide your Appmixer API URL (https://api.YOUR_TENANT.appmixer.cloud).');
}

let APPMIXER_VIRTUAL_USER_USERNAME = QUERY_PARAMS.get('username');
let APPMIXER_VIRTUAL_USER_TOKEN;
let DOMAIN_FILTER = QUERY_PARAMS.get('domainFilter');

if (APPMIXER_VIRTUAL_USER_USERNAME) {
    // If username is provided in the query string of this demo, password must be provided as well.
    APPMIXER_VIRTUAL_USER_TOKEN = QUERY_PARAMS.get('token');
} else {
    // Hardcode one. Normally, you would generate this and store in your application code and pass it to the Appmixer SDK.
    // Note that Appmixer username can be any, even non-existing, email address. We're using a user ID
    // together with a fictional domain name. Appmixer does not send anything to these email addresses.
    // They are just used as a virtual user credentials pair. Moreover, the email domain
    // allows us to easily share integration templates with a specific group of users
    // (An alternative to this is to use the user scopes.)
    APPMIXER_VIRTUAL_USER_USERNAME = 'embed-demo-1234@appmixer-embed-integrations.com';
    APPMIXER_VIRTUAL_USER_TOKEN = '4efaa8ec-ddc5-4852-b6cc-cb3039fe17b1';
}

if (typeof Appmixer === 'undefined') {
    alert('Appmixer SDK not loaded. Are you sure you pointed to the right appmixer.js SDK location?');
}

// Appmixer SDK instance.
const appmixer = new Appmixer({
    baseUrl: APPMIXER_API_URL,
    theme: {
        variables: { colors: { surface: '#f5f5f5' } }
    }
});

const widgets = {
    integrations: null,
    wizard: null
};

// Learn more about Appmixer virtual users at https://docs.appmixer.com/appmixer/tutorials/appmixer-virtual-users.
async function ensureAppmixerVirtualUser(username, token) {
    let auth;
    try {
        auth = await appmixer.api.authenticateUser(username, token);
        appmixer.set('accessToken', auth.token);
    } catch (err) {
        if (err.response && err.response.status === 403) {
            // Virtual user not yet created in Appmixer. Create one.
            try {
                auth = await appmixer.api.signupUser(username, token);
                appmixer.set('accessToken', auth.token);
            } catch (err) {
                alert('Something went wrong creating a virtual user. ' + err.message);
            }
        } else {
            alert('Something went wrong authenticating a virtual user.');
        }
    }
}

function createWidgets() {
    // Create Integrations Page widget.
    widgets.integrations = appmixer.ui.Integrations({
        el: '#appmixer-integrations-marketplace',
        options: {
            showHeader: true,
            customFilter: [{
                // Show only integration templates shared with users in this demo app.
                ...(DOMAIN_FILTER && { 'sharedWith.0.domain': DOMAIN_FILTER }),
                type: 'integration-template'
            }, {
                userId: appmixer.get('user').id,
                type: 'integration-instance'
            }]
        }
    });
    widgets.integrations.on('integration:create', templateId => {
        widgets.wizard.close();
        widgets.wizard.set('flowId', templateId);
        widgets.wizard.open();
    });
    widgets.integrations.on('integration:edit', integrationId => {
        widgets.wizard.close();
        widgets.wizard.set('flowId', integrationId);
        widgets.wizard.open();
    });
    widgets.wizard = appmixer.ui.Wizard();
    widgets.wizard.on('flow:start-after', () => widgets.integrations.reload());
    widgets.wizard.on('flow:remove-after', () => {
        widgets.integrations.reload();
        widgets.wizard.close();
    });
}

async function main() {
    await ensureAppmixerVirtualUser(APPMIXER_VIRTUAL_USER_USERNAME, APPMIXER_VIRTUAL_USER_TOKEN);
    createWidgets();
    widgets.integrations.open();

    document.querySelector('.app-event-form').addEventListener('submit', (evt) => {
        evt.preventDefault();
        appmixer.api.sendAppEvent(document.querySelector('.app-event-event').value, JSON.parse(document.querySelector('.app-event-data').value));
    });
}

main();
