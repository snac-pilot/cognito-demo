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

  // call user information, for the given network
  hello( auth.network ).api( '/me' ).then( function(r){
    // Inject it into the container
    var label = document.getElementById( 'profile_'+ auth.network );
    if(!label){
      label = document.createElement('div');
      label.id = 'profile_'+auth.network;
      document.getElementById('profile').appendChild(label);
    }
    label.innerHTML = '<img src="'+ r.thumbnail +'" /> Hey '+r.name;
  });

});


hello.init({
  google   : '593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com'
},{redirect_uri:'http://snac-pilot.github.io/cognito-demo/'});
