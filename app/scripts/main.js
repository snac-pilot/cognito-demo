'use strict';
/* "imports" are managed with bower for now
 *    migrate to http://browserify.org ?
 */
/* global AWS */
/* global hello */
/* global jQuery */
/* global PNotify */
// aws API returns snake
/* jshint camelcase: false */

// a global variable for the sync client
var cognitoSyncClient = {};

// global for debug (move to app's global object)
var debugGlobal = {
  'dataset': null
};

/* cognitoTestApp.*
    namespace global object to hold some application logic
*/
var cognitoTestApp = {
  /* cognitoTestApp.syncBack(dataset)
   *  sync to cloud and copy back to div
   */
  syncBack: function(dataset){
    // sync up changes from the cloud
    dataset.synchronize({
      onSuccess: function(dataset) {
        var content = dataset.getAsync('MyKey').value();
        // apply any saved updates to the local editable area
        if (content) {
          $('#test').html(content);
        }
      },
      // add both together if there is a conflict
      onConflict: function(dataset, conflicts, callback) {
        var resolved = [];
        for (var i=0; i<conflicts.length; i++) {
          var remoteValue = conflicts[i].getRemoteRecord().value;
          var localValue = conflicts[i].getLocalRecord().value;
          if (remoteValue !== localValue) {
            resolved.push(conflicts[i].resolveWithValue(
              remoteValue + '\n---\n' + localValue
            ));
            new PNotify({
              title: 'Merge Conflict',
              text: 'remote and local have been combined'
            });
          } else {
            resolved.push(conflicts[i].resolveWithLocalRecord());
          }
        }
        dataset.resolve(resolved, function() {
          return callback(true);
        });
      }
    });
  },
  /* cognitoTestApp.setup(content, dataset)
   *  setup the edit area
   */
  setup: function(content, dataset) {
    // data from cognito
    console.log(content);

    cognitoTestApp.syncBack(dataset, content);
    new PNotify({
      title: 'Sync',
      text: 'loaded from the cloud'
    });

    // bind to the editable text area
    // trigger an event when contenteditable is changed
    // http://stackoverflow.com/a/20699971/1763984
    $('#test').focus(function() {
        $(this).data('initialText', $(this).html());
    }).blur(function() {
      // ...if user changed div content...
      if ($(this).data('initialText') !== $(this).html()) {
        // save user edits
        dataset.putAsync('MyKey', $(this).html()).then(function(record) {
          cognitoTestApp.syncBack(dataset, record.value);
          new PNotify({
            title: 'Sync',
            text: 'changes saved to the cloud'
          });
        }).done();
      }
    });
    debugGlobal.dataset = dataset;
  } // end cognitoTestApp.setup
}; // end cognitoTestApp


// bind to hello's auth.login event, fires when logged in okay
hello.on('auth.login', function(auth){
  // update the UI based on being logged in
  $('#login').hide();
  $('#logout').show();
  // lookup user profile info from the identity provider
  hello( auth.network ).api( '/me' ).then( function(r){
    // inject user info
    $('#user_info').html('<img src="'+ r.thumbnail +'" /> Hey '+r.name);
    new PNotify({
      title: 'Welcome',
      text: 'Thanks for logging in ' + r.name
    });
  });

  // AWS config
  AWS.config.region = 'us-east-1';
  AWS.config.logger = console;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:2229d0aa-09c2-450d-90da-9cae70b8260f',
    Logins: { 'accounts.google.com': auth.authResponse.id_token }
  });

  // get AWS credentials, so we can connect
  Promise.promisifyAll(AWS.config.credentials);
  AWS.config.credentials.getAsync().then(function() {
    // connect to cognito (localStorage/cloud hybrid)
    cognitoSyncClient = new AWS.CognitoSyncManager();
    Promise.promisifyAll(cognitoSyncClient);
    return cognitoSyncClient.openOrCreateDatasetAsync('MYDataset');
  }).then(function (dataset) {
    Promise.promisifyAll(dataset);
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
  $('#logout').click(function(){
    hello.logout();
    new PNotify({
      title: 'Goodbye',
      text: 'see ya soon'
    });
    window.setTimeout(function(){
      location.reload();
    }, 3000);
  });
});

hello.init({
  google   : '593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com'
},{
  redirect_uri: window.location.href
});
