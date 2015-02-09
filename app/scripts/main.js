'use strict';
/* global AWS */
/* global hello */
/* global jQuery */
/* jshint camelcase: false */

// a global variable for the sync client
var cognitoSyncClient = {};

// global for debug
var debugGlobal = {
  'dataset': null
};

/*namespace to hold some application logic
  cognitoTestApp.*
*/
var cognitoTestApp = {
  /* cognitoTestApp.syncBack(dataset, content)
   *  sync to cloud and copy back to div
   */
  syncBack: function(dataset, content){
    // sync up changes from the cloud
    // dataset.synchronize(cognitoTestApp.syncCallbacks);
    // do we need custom callbacks for the demo?
    dataset.synchronize();
    // apply any saved updates to the local editable area
    if (content) {
      $('#test').html(content);
    }
  },
  /* cognitoTestApp.setup(content, dataset)
   *  setup the edit area
   */
  setup: function(content, dataset) {
    // data from cognito
    console.log(content);

    cognitoTestApp.syncBack(dataset, content);

    // bind to the editable text area
    // trigger an event when contenteditable is changed
    // http://stackoverflow.com/a/20699971/1763984
    $('#test').focus(function() {
        $(this).data('initialText', $(this).html());
    }).blur(function() {
      // ...if user changed div content...
      if ($(this).data('initialText') !== $(this).html()) {
        // save user edits
        dataset.putAsync('MyKey', $(this).html()).then(function(err, record) {
          cognitoTestApp.syncBack(dataset, record.value);
        }).done();
      }
    });
    debugGlobal.dataset = dataset;
  }, // end cognitoTestApp.setup

  /* cognitoTestApp.syncCallbacks
   *   callbacks to pass to dataset.syncronize
   */
  syncCallbacks: { /* jshint unused: false */
    onSuccess: function(dataset, newRecords) {
      console.log('data saved to the cloud and newRecords received.');
      console.log(dataset, newRecords);
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
  }
};

// bind to hello's auth.login event, fires when logged in okay
hello.on('auth.login', function(auth){

  // update the UI based on being logged in
  $('#login').hide();
  // lookup user profile info from the identity provider
  hello( auth.network ).api( '/me' ).then( function(r){
    // inject user info
    $('#user_info').html('<img src="'+ r.thumbnail +'" /> Hey '+r.name);
  });

  // AWS config
  AWS.config.region = 'us-east-1';
  AWS.config.logger = console;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:2229d0aa-09c2-450d-90da-9cae70b8260f',
    Logins: { 'accounts.google.com': auth.authResponse.id_token }
  });

  // get AWS credentials, so we can connect
  Promise.promisifyAll(Object.getPrototypeOf(AWS.config.credentials));
  AWS.config.credentials.getAsync().then(function() {
    // connect to cognito
    cognitoSyncClient = new AWS.CognitoSyncManager();
    Promise.promisifyAll(Object.getPrototypeOf(cognitoSyncClient));
    return cognitoSyncClient.openOrCreateDatasetAsync('MYDataset');
  }).then(function (dataset) {
    Promise.promisifyAll(Object.getPrototypeOf(dataset));
    return {
      content: dataset.getAsync('MyKey'),
      dataset: dataset
    };
  }).then(function (params) {
      cognitoTestApp.setup(params.content.value(), params.dataset);
  }).done();
}); // end hello.on `auth.login`

// when the document is ready
jQuery( document ).ready(function( $ ) {
  // bind login action to login button
  $('#login').click(function(){
    hello('google').login({ response_type : 'code' });
  });
});

hello.init({
  google   : '593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com'
},{
  redirect_uri: window.location.href
});
