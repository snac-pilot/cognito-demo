"use strict";var cognitoSyncClient={},debugGlobal={dataset:null},cognitoTestApp={syncBack:function(a){a.synchronize({onSuccess:function(a){var b=a.getAsync("MyKey").value();console.log("bb"),console.log(b),b&&$("#test").html(b)},onConflict:function(a,b,c){for(var d=[],e=0;e<b.length;e++){var f=b[e].getRemoteRecord().value,g=b[e].getLocalRecord().value;d.push(f!==g?b[e].resolveWithValue(f+"\n---\n"+g):b[e].resolveWithLocalRecord())}a.resolve(d,function(){return c(!0)})}})},setup:function(a,b){console.log(a),cognitoTestApp.syncBack(b,a),$("#test").focus(function(){$(this).data("initialText",$(this).html())}).blur(function(){$(this).data("initialText")!==$(this).html()&&b.putAsync("MyKey",$(this).html()).then(function(a){cognitoTestApp.syncBack(b,a.value)}).done()}),debugGlobal.dataset=b}};hello.on("auth.login",function(a){$("#login").hide(),hello(a.network).api("/me").then(function(a){$("#user_info").html('<img src="'+a.thumbnail+'" /> Hey '+a.name)}),AWS.config.region="us-east-1",AWS.config.logger=console,AWS.config.credentials=new AWS.CognitoIdentityCredentials({IdentityPoolId:"us-east-1:2229d0aa-09c2-450d-90da-9cae70b8260f",Logins:{"accounts.google.com":a.authResponse.id_token}}),Promise.promisifyAll(AWS.config.credentials),AWS.config.credentials.getAsync().then(function(){return cognitoSyncClient=new AWS.CognitoSyncManager,Promise.promisifyAll(cognitoSyncClient),cognitoSyncClient.openOrCreateDatasetAsync("MYDataset")}).then(function(a){return Promise.promisifyAll(a),{content:a.getAsync("MyKey"),dataset:a}}).then(function(a){cognitoTestApp.setup(a.content.value(),a.dataset)}).done()}),jQuery(document).ready(function(a){a("#login").click(function(){hello("google").login({response_type:"code"})})}),hello.init({google:"593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com"},{redirect_uri:window.location.href});