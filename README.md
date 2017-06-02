# Polyfills for the Credential Management API
The Credential Management API gained additional features that will be supported
by Google Chrome version 60 and onwards. This repository includes polyfills for
these features, so that developers can use the new API features while supporting
old and new browser versions.

## How to use
Simply include `cm-api-shim.js` in your project, for example in the following
way:
``` html
<script src="https://raw.githubusercontent.com/GoogleChrome/cm-api-shim/master/cm-api-shim.js"></script>
```

## Supported Features
The following features will be supported through the use of this library:

### `navigator.credentials.preventSilentAccess`
`navigator.credentials.requireUserMediation` has been renamed to
`navigator.credentials.preventSilentAccess`. Through the use of this library
developers can simply use `preventSilentAccess`, which will dispatch to
`requireUserMediation` for older browsers.

### A `mediation` enum argument to `navigator.credentials.get`
The boolean `unmediated` flag argument to `navigator.credentials.get` has been
replaced by a `mediation` enum, which takes the values `'silent'`, `'optional'`
and `'required'`. `mediation: 'silent'` and `mediation: 'optional'` directly map
to `unmediated: true` and `unmediated: false`. As before, `medation: 'optional'`
is the default value if nothing else is specified.

Note: `mediation: 'required'` is a completely novel option that can not be
polyfilled in older browsers. In this case the polyfill falls back to
`mediation: 'optional'` and warns the developers about doing so via a console
message.

### Asynchronous creation of `Credential` objects
It is now possible to create `Credential` objects asynchronously using
`navigator.credentials.create`. This returns a `Promise` which will resolve to a
`Credential` object if successful.

Currently, both `password` and `federated` are supported as keys, which will
try to create a `PasswordCredential` or `FederatedCredential`.

Example Use:
``` js
let cred = await navigator.credentials.create({password: {
  id: "Foo",
  password: "Bar",
}});
```

## Unsupported Features
While the Credential Management API provides access to the `password` property
of `PasswordCredential` for recent browser versions, this can not be polyfilled
and is not supported for older browsers.

For this use case it is suggested to detect whether access to passwords is
possible or not and dispatch accordingly.

Example Code:
``` js
let cred = await navigator.credentials.get({password: true});
if (PasswordCredential.prototype.password) {
  let body = {id: cred.id, password: cred.password};
  fetch('my_endpoint.html', {body : body}).then(result => {
      // Handle server response.
  });
} else {
  fetch('my_endpoint.html', {credentials: cred}).then(result => {
      // Handle server response.
  });
}
```
