'use strict';

/* global hello */
/* global AWS */
/* jshint camelcase: false */

hello.on('auth.login', function(auth){

  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:2229d0aa-09c2-450d-90da-9cae70b8260f',
    Logins: { // optional tokens, used for authenticated login
      'accounts.google.com': auth.authResponse.access_token
    }
  });
  console.log('You are now logged in.');
});


hello.init({
  google   : '593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com'
},{redirect_uri:'http://snac-pilot.github.io/cognito-demo/'});
