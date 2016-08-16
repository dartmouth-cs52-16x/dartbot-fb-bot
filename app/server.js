import botkit from 'botkit';
import dotenv from 'dotenv';


// import { getLocations } from './api';
// import mongoStorage from 'botkit-storage-mongo';

// this is es6 syntax for importing libraries
// in older js this would be: var botkit = require('botkit')

dotenv.config({ silent: true });
console.log('starting bot');

const wit = require('botkit-middleware-witai')({
  token: process.env.WIT_AI_TOKEN,
});

// botkit controller
const controller = botkit.facebookbot({
  access_token: process.env.FB_BOT_ACCESS_TOKEN,
  verify_token: process.env.FB_BOT_VERIFY_TOKEN,
//  storage: mongoStorage = new mongoStorage({monogUri: process.env.MONGODB_URI}),
});

// initialize slackbot
const fbbot = controller.spawn({
});
console.log(process.env.PORT);
controller.setupWebserver(process.env.PORT || 3000, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, fbbot, () => {
    console.log('HI!');
  });
});

controller.middleware.receive.use(wit.receive);

// user said hello
controller.hears(['hello'], 'message_received', (bot, message) => {
  bot.reply(message, 'Hey there.');
});

controller.hears(['hello'], 'message_received', wit.hears, (bot, message) => {
  console.log(message.intents.outcomes.entities);
});


// this is triggered when a user clicks the send-to-messenger plugin
controller.on('facebook_optin', (bot, message) => {
  bot.reply(message, 'Welcome to my app!');
});

controller.hears(['tour'], 'message_received', wit.hears, (bot, message) => {
  console.log(message.intents.outcomes.entities);
  if (message.intents.outcomes.entities.tour_prompt && message.intents.outcomes.tour_prompt[0].confidence > 0.6) {
    const topRatedMessage = {
      'quick_replies': [
        {
          'content_type': 'text',
          'title': 'Red',
          'payload': 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
        },
        {
          'content_type': 'text',
          'title': 'Green',
          'payload': 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN',
        },
      ],
    };

    bot.reply(topRatedMessage);
  }
});
