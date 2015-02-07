'use strict';

/* global hello */
/* global AWS */
/* jshint camelcase: false */

// a global variable for the sync client
var cognitoSyncClient = {};

hello.on('auth.login', function(auth){

  AWS.config.region = 'us-east-1';

  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:2229d0aa-09c2-450d-90da-9cae70b8260f',
    Logins: { // optional tokens, used for authenticated login
      'accounts.google.com': auth.authResponse.access_token
    }
  });

  AWS.config.credentials.get(function() {
    // once we have the credentials we can initialize the
    // Cognito sync client
    cognitoSyncClient = new AWS.CognitoSyncManager();
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


  // first we use the sync client to open a Dataset
  cognitoSyncClient.openOrCreateDataset('MyDataset', function(err, dataset) {
    // now that we have a dataset we can read and write
    // key/value pairs from it
    dataset.get('MyKey', function(err, value) {
      console.log(err, value);
    });

    dataset.put('MyKey', JSON.stringify({'test': 'test'}), function(err, record) {
      console.log(err, record);
      // if there were no errors we can synchronize this data
      // to push it to the cloud sync store
      if ( !err ) {
        dataset.synchronize({
          /* jshint unused: false */
          onSuccess: function(dataset, newRecords) {
            console.log(dataset, newRecords);
            console.log('data saved to the cloud and newRecords received');
          },
          onFailure: function(err) {
            console.log('Error while synchronizing data to the cloud: ' + err);
          },
          onConflict: function(dataset, conflicts, callback) {

            // if there are conflicts during the synchronization
            // we can resolve them in this method
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
            // Return true to delete the local copy of the dataset.
            return callback(true);
          },
          onDatasetMerged: function(dataset, datasetNames, callback) {
            // Return false to handle dataset merges outside the synchroniziation callback.
            return callback(false);
          },

        });
      }
    });
  });

});


hello.init({
  google   : '593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com'
},{redirect_uri:'http://snac-pilot.github.io/cognito-demo/'});
