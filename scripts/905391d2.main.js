"use strict";hello.on("auth.login",function(a){AWS.config.credentials=new AWS.CognitoIdentityCredentials({IdentityPoolId:"us-east-1:2229d0aa-09c2-450d-90da-9cae70b8260f",Logins:{"accounts.google.com":a.authResponse.access_token}}),console.log("You are now logged in.")}),hello.init({google:"593494804152-2jt9r0j9c5qhi04das20f9am6tblh1rq.apps.googleusercontent.com"},{redirect_uri:"http://snac-pilot.github.io/cognito-demo/"});