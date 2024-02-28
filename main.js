const QUERY_PARAMS = new URLSearchParams(window.location.search);

// This should have the pattern https://api.YOUR_TENANT.appmixer.cloud';
let APPMIXER_API_URL = QUERY_PARAMS.get('apiUrl');
if (!APPMIXER_API_URL) {
    APPMIXER_API_URL = prompt('Please provide your Appmixer API URL (https://api.YOUR_TENANT.appmixer.cloud).');
}

let APPMIXER_VIRTUAL_USER_USERNAME = QUERY_PARAMS.get('username');
let APPMIXER_VIRTUAL_USER_TOKEN;

if (APPMIXER_VIRTUAL_USER_USERNAME) {
    // If username is provided in the query string of this demo, password must be provided as well.
    APPMIXER_VIRTUAL_USER_TOKEN = QUERY_PARAMS.get('token');
} else {
    // Hardcode one. Normally, you would generate this and store in your application code and pass it to the Appmixer SDK.
    // Note that Appmixer username can be any, even non-existing, email address. We're using a user ID
    // together with a fictional domain name. Appmixer does not send anything to these email addresses.
    // They are just used as a virtual user credentials pair. Moreover, the email domain
    // allows us to easily share automations with a specific group of users
    // (An alternative to this is to use the user scopes.)
    APPMIXER_VIRTUAL_USER_USERNAME = 'embed-demo-1234@appmixer-embed-designer.com';
    APPMIXER_VIRTUAL_USER_TOKEN = '4efaa8ec-ddc5-4852-b6cc-cb3039fe17b1';
}

if (typeof Appmixer === 'undefined') {
    alert('Appmixer SDK not loaded. Are you sure you pointed to the right appmixer.js SDK location?');
}

// Appmixer SDK instance.
const appmixer = new Appmixer({
    baseUrl: APPMIXER_API_URL
});

const widgets = {
    automations: null,
    designer: null
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
    widgets.automations = appmixer.ui.FlowManager({
        el: '#automations-placeholder',
        options: {
            customFilter: {
                'customFields.tag': 'appmixer-demo-embedded-designer'
            },
            menu: [
                { event: 'flow:remove', label: 'Remove' }
            ]
        }
    });
    widgets.designer = appmixer.ui.Designer({
        el: '#designer-placeholder',
        options: {
            showButtonHome: true,
            menu: [
                { event: 'flow:rename', label: 'Rename' }
            ],
            toolbar: [
                ['undo', 'redo'],
                ['zoom-to-fit', 'zoom-in', 'zoom-out'],
                ['logs']
            ]
        }
    });

    widgets.automations.on('flow:create', async () => {
        const flowId = await appmixer.api.createFlow('New Flow', {}, { customFields: { tag: 'appmixer-demo-embedded-designer' } });
        widgets.designer.close();
        widgets.designer.set('flowId', flowId);
        widgets.automations.close();
        widgets.designer.open();
    });

    widgets.automations.on('flow:open', flowId => {
        widgets.designer.close();
        widgets.designer.set('flowId', flowId);
        widgets.designer.open();
        widgets.automations.close();
    });
    widgets.designer.on('navigate:flows', () => {
        widgets.designer.close();
        widgets.automations.open();
    });
}

async function main() {
    await ensureAppmixerVirtualUser(APPMIXER_VIRTUAL_USER_USERNAME, APPMIXER_VIRTUAL_USER_TOKEN);
    createWidgets();
    widgets.automations.open();

    document.querySelector('.app-event-form').addEventListener('submit', (evt) => {
        evt.preventDefault();
        appmixer.api.sendAppEvent(document.querySelector('.app-event-event').value, JSON.parse(document.querySelector('.app-event-data').value));
    });
}

main();
