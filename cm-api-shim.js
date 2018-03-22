// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This file includes polyfills for recent features added to the Credential
// Management API.

(function() {
  // Return early if CM API is not available or the new features are already
  // present.
  if (!navigator.credentials || navigator.credentials.preventSilentAccess)
    return;

  // Polyfill for navigator.credentials.preventSilentAccess.
  navigator.credentials.preventSilentAccess =
      navigator.credentials.requireUserMediation;

  // Polyfill for navigator.credentials.get supporting a mediation enum.
  var oldGet = navigator.credentials.get.bind(navigator.credentials);
  navigator.credentials.get = function(options) {
    // If mediation is specified, check whether it contains a valid value and
    // raise a TypeError otherwise.
    var validOptions = ['silent', 'optional', 'required'];
    if (options['mediation'] &&
        validOptions.indexOf(options['mediation']) === -1) {
      throw new TypeError(
          "The provided value '" + options['mediation'] +
          "' is not a valid enum value.");
    }

    // mediation: 'required' can not be supported in older browsers, so fall
    // back to 'optional' and issue a warning.
    if (options['mediation'] === 'required') {
      console.warn(
          "mediation: 'required' can not be supported in older browsers, " +
          "using mediation: 'optional' instead.");
    }

    options['unmediated'] = options['mediation'] === 'silent';
    return oldGet(options);
  }

  // Polyfill for Credential Management API's navigator.credentials.create.
  // Other APIs might define this method already, in which case we need to cache
  // the original version.
  if (navigator.credentials.create) {
    var oldCreate = navigator.credentials.create.bind(navigator.credentials);
  }

  navigator.credentials.create = function(options) {
    // Check whether exactly one option is specified, reject the Promise
    // otherwise.
    if (Object.keys(options).length !== 1) {
      return Promise.reject('NotSupportedError: Only exactly one credential ' +
          'option is currently supported.');
    }


    // Dispatch to the appropriate constructors for 'password' and
    // 'federated' if applicable.
    if ('password' in options && window.PasswordCredential) {
      return new Promise(function(resolve, reject) {
        try {
          resolve(new PasswordCredential(options['password']));
        } catch (e) {
          reject(e);
        }
      });
    }

    if ('federated' in options && window.FederatedCredential) {
      return new Promise(function(resolve, reject) {
        try {
          resolve(new FederatedCredential(options['federated']));
        } catch (e) {
          reject(e);
        }
      });
    }

    // Dispatch to old create if possible, otherwise reject anything else.
    if (oldCreate) {
      return oldCreate(options);
    }

    return Promise.reject('NotSupportedError: No valid credential option ' +
        'was specified.');
  };
}());
