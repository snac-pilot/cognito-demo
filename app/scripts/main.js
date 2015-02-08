'use strict';

/* global AWS */
/* global hello */
/* global jQuery */
/* jshint camelcase: false */


// a global variable for the sync client
var cognitoSyncClient = {};

var cognitoTestApp = {
  // cognitoTestApp.syncCallbacks
  syncCallbacks: { /* jshint unused: false */
    onSuccess: function(dataset, newRecords) {
      console.log(dataset, newRecords);
      console.log('data saved to the cloud and newRecords received');
    },
    onFailure: function(err) {
      console.log('Error while synchronizing data to the cloud: ' + err);
    },
    onConflict: function(dataset, conflicts, callback) {
      var resolved = [];
      for (var i=0; i < conflicts.length; i++) {
        // Take remote version.
        resolved.push(conflicts[i].resolveWithRemoteRecord());
      }
      dataset.resolve(resolved, function(err) {
        if ( !err ) { callback(true); }
      });
    },
    onDatasetDeleted: function(dataset, datasetName, callback) {
      return callback(true);
    },
    onDatasetMerged: function(dataset, datasetNames, callback) {
      // Return false to handle dataset merges outside the synchroniziation callback.
      return callback(false);
    }
  },
  // cognitoTestApp.testSetup
  testSetup: function(value, dataset) {
    // apply any saved updates
    if (value) {
      $('#test').html(value);
    }
    // trigger an event when contenteditable is changed
    // http://stackoverflow.com/a/20699971/1763984
    $('#test').focus(function() {
        $(this).data('initialText', $(this).html());
    }).blur(function() {
      // ...if content is different...
      if ($(this).data('initialText') !== $(this).html()) {
        // ... do something.
        console.log('New data when content change.');
        dataset.put('MyKey', JSON.stringify($(this).html()), function(err, record) {
          // if there were no errors we can synchronize this data
          // to push it to the cloud sync store
          if ( !err ) {
            // do stuff
            dataset.synchronize(cognitoTestApp.syncCallbacks);
          }
        });
      }
    });
  }
};


var loginFinished = function(auth) {
if (auth) {

  $('#login').hide();

  hello( auth.network ).api( '/me' ).then( function(r){
    $('#user_info').html('<img src="'+ r.thumbnail +'" /> Hey '+r.name);
  });

  AWS.config.region = 'us-east-1';
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:2229d0aa-09c2-450d-90da-9cae70b8260f',
    Logins: { 'accounts.google.com': auth.authResponse.id_token }
  });

  AWS.config.credentials.get(function(err) {
    if (err) { console.log('credentials.get: '.red + err, err.stack); }
    else {
      console.log('Cognito Identity Id: ' + AWS.config.credentials.identityId);
      // once we have the credentials we can initialize the
      // Cognito sync client
      cognitoSyncClient = new AWS.CognitoSyncManager();

      // first we use the sync client to open a Dataset

      cognitoSyncClient.openOrCreateDataset('MYDataset', function(err, dataset) {
        if (! err) {
          // now that we have a dataset we can read and write
          // key/value pairs from it
          console.log(dataset);
          dataset.get('MyKey', function(err, value) {
            if (! err) {
              cognitoTestApp.testSetup(value, dataset);
            }
          });
        }
      });
    }
  });

}}; // end login finished

jQuery( document ).ready(function( $ ) {
  $('#login').click(function(){
    hello( 'google' ).login({
      response_type : 'code'
    });
  });
});

hello.init({
  google   : '593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com'
},{
  redirect_uri: window.location.href
});

hello.on('auth.login', function(auth){
  loginFinished(auth);
});


