"use strict";var cognitoSyncClient={},cognitoTestApp={updater:function(a,b){b.synchronize(cognitoTestApp.syncCallbacks),a&&$("#test").html(a),$("#test").focus(function(){$(this).data("initialText",$(this).html())}).blur(function(){$(this).data("initialText")!==$(this).html()&&(console.log("New data when content change."),console.log($(this).html()),b.put("MyKey",$(this).html(),function(a,b){console.log("record"),console.log(b)}),b.synchronize(cognitoTestApp.syncCallbacks))})},syncCallbacks:{onSuccess:function(a,b){console.log("data saved to the cloud and newRecords received."),console.log(a,b)},onFailure:function(a){console.log("Error while synchronizing data to the cloud: "+a)},onConflict:function(a,b,c){for(var d=[],e=0;e<b.length;e++)d.push(b[e].resolveWithRemoteRecord());a.resolve(d,function(a){a||c(!0)})},onDatasetDeleted:function(a,b,c){return c(!0)},onDatasetMerged:function(a,b,c){return c(!1)}}};hello.on("auth.login",function(a){$("#login").hide(),hello(a.network).api("/me").then(function(a){$("#user_info").html('<img src="'+a.thumbnail+'" /> Hey '+a.name)}),AWS.config.region="us-east-1",AWS.config.credentials=new AWS.CognitoIdentityCredentials({IdentityPoolId:"us-east-1:2229d0aa-09c2-450d-90da-9cae70b8260f",Logins:{"accounts.google.com":a.authResponse.id_token}}),AWS.config.credentials.get(function(a){a?console.log("credentials.get: ".red+a,a.stack):(cognitoSyncClient=new AWS.CognitoSyncManager,cognitoSyncClient.openOrCreateDataset("MYDataset",function(a,b){a||b.get("MyKey",function(a,c){a||cognitoTestApp.updater(c,b)})}))})}),jQuery(document).ready(function(a){a("#login").click(function(){hello("google").login({response_type:"code"})})}),hello.init({google:"593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com"},{redirect_uri:window.location.href});