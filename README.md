# Cognito Sync Demo

## Setup

Install http://bower.io for web dev package magic

requires https://npmjs.org and http://nodejs.org

```
npm install -g bower
```

Install front end dependencies.

```
bower install
npm install .
```

## Development

```
grunt serve
```

http://localhost:9000/ will now live update when changes happen in `/apps/` directory

## Ready to push to gh-pages
```
grunt build gh-pages
```

## Technology Credits

### AWS SDK for JavaScript in the browser and Node.js
 * https://github.com/aws/aws-sdk-js
 * https://www.youtube.com/watch?feature=player_detailpage&v=fpaEA6FM8K0#t=1510

### Amazon Cognito Sync Manager for JavaScript 
 * http://aws.amazon.com/cognito
 * https://github.com/aws/amazon-cognito-js

### Hello (client side oauth)
 * http://adodson.com/hello.js/

### Zocial (social icons)
 * http://zocial.smcllns.com

### Web Stack
 * http://yeoman.io/
 * https://www.npmjs.com/package/grunt-gh-pages
