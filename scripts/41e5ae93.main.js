"use strict";var cognitoSyncClient={},cognitoTestApp={callbacks:{onSuccess:function(a,b){console.log(a,b),console.log("data saved to the cloud and newRecords received")},onFailure:function(a){console.log("Error while synchronizing data to the cloud: "+a)},onConflict:function(a,b,c){for(var d=[],e=0;e<b.length;e++)d.push(b[e].resolveWithRemoteRecord());a.resolve(d,function(a){a||c(!0)})},onDatasetDeleted:function(a,b,c){return c(!0)},onDatasetMerged:function(a,b,c){return c(!1)}},testSetup:function(a,b){console.log(a,b),console.log($("#test")),a&&$("#test").html(a),$("#test").focus(function(){$(this).data("initialText",$(this).html())}).blur(function(){$(this).data("initialText")!==$(this).html()&&(console.log("New data when content change."),b.put("MyKey",JSON.stringify($(this).html()),function(a,c){console.log(a,c),a||(console.log(cognitoTestApp.callbacks),b.synchronize(cognitoTestApp.callbacks))}))})}};hello.on("auth.login",function(a){hello(a.network).api("/me").then(function(b){var c=document.getElementById("profile_"+a.network);c||(c=document.createElement("div"),c.id="profile_"+a.network,document.getElementById("profile").appendChild(c)),c.innerHTML='<img src="'+b.thumbnail+'" /> Hey '+b.name,AWS.config.region="us-east-1",AWS.config.credentials=new AWS.CognitoIdentityCredentials({IdentityPoolId:"us-east-1:2229d0aa-09c2-450d-90da-9cae70b8260f",Logins:{"accounts.google.com":b.id}}),AWS.config.credentials.get(function(a){a?console.log("credentials.get: ".red+a,a.stack):(console.log("Cognito Identity Id: "+AWS.config.credentials.identityId),cognitoSyncClient=new AWS.CognitoSyncManager,cognitoSyncClient.openOrCreateDataset("MyDataset",function(a,b){b.get("MyKey",function(a,c){console.log(a,c),a||cognitoTestApp.testSetup(c,b)})}))})})}),hello.init({google:"593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com"},{redirect_uri:"http://snac-pilot.github.io/cognito-demo/"});