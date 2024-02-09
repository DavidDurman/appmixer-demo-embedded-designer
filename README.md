# Appmixer Embedded Integrations Demo

Try live at:

```
https://demo-integrations.appmixer.com?apiUrl=https://api.YOUR_TENANT.appmixer.com&studioUrl=https://my.YOUR_TENANT.appmixer.com
```

The following query parameters are supported:

| Query Parameter  | Required | Description | Example |
| ------------- | ------------- | -------- | -------- |
| `apiUrl`  | ✅ | The Appmixer Tenant API URL that you were assigned at sign-up.  | `https://api.YOUR_TENANT.appmixer.com` |
| `studioUrl`  | ✅ | The Appmixer Tenant Studio URL that you were assigned at sign-up.  | `https://my.YOUR_TENANT.appmixer.com` |
| `username`  |  | An Appmixer Virtual User Username. If not defined, a virtual user with a the following username will be created `embed-demo-1234@appmixer-embed-integrations.com` (for demo purposes).  | `my-virtual-user123@myapp.com` |
| `token`  |  | An Appmixer Virtual User Token.  | `d17e3798-d754-4397-aff2-f06e71c5ae57` |
| `domainFilter`  |  | If specified, only integrations pubslihed to this specific domain will be displayed. Otherwise, integrations published to all users will be displayed.  | `myapp.com` |


![Screenshot](assets/screenshot.png?raw=true "Screenshot")
