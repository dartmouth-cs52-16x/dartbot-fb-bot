import botkit from 'botkit';
import dotenv from 'dotenv';
import { getLocations } from './api';
//import mongoStorage from 'botkit-storage-mongo';

// this is es6 syntax for importing libraries
// in older js this would be: var botkit = require('botkit')

const SERVER = process.env.port;

dotenv.config();
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

controller.setupWebServer(SERVER, (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver, fbbot, () => {
    console.log('HI!');
  });
});

controller.on('message_received', (bot, message) => {
  if (message.attachements && message.attachements.type == 'location') {

  }
});
