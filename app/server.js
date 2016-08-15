import botkit from 'botkit';
import dotenv from 'dotenv';
// import { getLocations } from './api';
// import mongoStorage from 'botkit-storage-mongo';

// this is es6 syntax for importing libraries
// in older js this would be: var botkit = require('botkit')

const SERVER = 'https://dartbot-fbbot.herokuapp.com/';//  process.env.port;

dotenv.config({ silent: true });
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
console.log(process.env.port);
controller.setupWebserver(process.env.port || 3000, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, fbbot, () => {
    console.log('HI!');
  });
});

// controller.on('message_received', (bot, message) => {
//   if (message.attachements && message.attachements.type == 'location') {
//     console.log('hi');
//   }
// });
