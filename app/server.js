import axios from 'axios';
import botkit from 'botkit';
//import mongoStorage from 'botkit-storage-mongo';

// this is es6 syntax for importing libraries
// in older js this would be: var botkit = require('botkit')

console.log('starting bot');

// botkit controller
const controller = botkit.facebookbot({
  access_token: process.env.FB_BOT_ACCESS_TOKEN,
  verify_token: process.env.FB_BOT_VERIFY_TOKEN,
//  storage: mongoStorage = new mongoStorage({monogUri: process.env.MONGODB_URI}),
});

// initialize slackbot
const fbbot = controller.spawn({
});

controller.setupWebServer(process.env.prot, (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver, fbbot, () => {
    console.log('HI!');
  });
});
