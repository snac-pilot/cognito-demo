'use strict';

/* global hello */
/* global AWS */
/* jshint camelcase: false */

// a global variable for the sync client
var cognitoSyncClient = {};

var cognitoTestApp = {
  callbacks: { /* jshint unused: false */
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
    console.log(value, dataset);
    console.log($('#test'));

    // apply any saved updates
    if (value) {
      $('#test').html(value);
    }
    //
    // http://stackoverflow.com/a/20699971/1763984
    $('#test').focus(function() {
        $(this).data('initialText', $(this).html());
    }).blur(function() {
      // ...if content is different...
      if ($(this).data('initialText') !== $(this).html()) {
        // ... do something.
        console.log('New data when content change.');
        dataset.put('MyKey', JSON.stringify($(this).html()), function(err, record) {
          console.log(err, record);
          // if there were no errors we can synchronize this data
          // to push it to the cloud sync store
          if ( !err ) {
            // do stuff
            console.log(cognitoTestApp.callbacks);
            dataset.synchronize(cognitoTestApp.callbacks);
          }
        });
      }
    });
  }
};

hello.on('auth.login', function(auth){

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

  AWS.config.region = 'us-east-1';

  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:2229d0aa-09c2-450d-90da-9cae70b8260f',
    Logins: { // optional tokens, used for authenticated login
      // 'accounts.google.com': auth.authResponse.access_token
      'accounts.google.com': auth.authResponse.id_token
    }
  });

  AWS.config.credentials.get(function(err) {
    if (err) { console.log('credentials.get: '.red + err, err.stack); }
    else {
    console.log('Cognito Identity Id: ' + AWS.config.credentials.identityId);
    // once we have the credentials we can initialize the
    // Cognito sync client
    cognitoSyncClient = new AWS.CognitoSyncManager();

    // first we use the sync client to open a Dataset
    cognitoSyncClient.openOrCreateDataset('MyDataset', function(err, dataset) {
      // now that we have a dataset we can read and write
      // key/value pairs from it
      dataset.get('MyKey', function(err, value) {
        console.log(err, value);
        if (! err) {
          cognitoTestApp.testSetup(value, dataset);
        }
      });

    });
  }});

});


hello.init({
  google   : '593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com'
},{redirect_uri:'http://snac-pilot.github.io/cognito-demo/'});
