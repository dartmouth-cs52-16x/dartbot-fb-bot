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


// controller.hears(['.*'], 'message_received', (bot, message) => {
//   console.log('hello');
//   const wit = witbot.process(message.text, bot, message);
//   console.log(wit);
//   wit.hears('tour_prompt', 0.65, (wbot, wmessage, outcome) => {
//     console.log('here');
//     bot.reply(message, 'I heard tour!');
//   });
// });


controller.middleware.receive.use(wit.receive);

// user said hello
controller.hears(['hello'], 'message_received', (bot, message) => {
  console.log('in hello');
  console.log(message.intents[0]);
  bot.reply(message, 'Hey there.');
});

controller.hears(['hello'], 'message_received', (bot, message) => {

});
//
//
// // this is triggered when a user clicks the send-to-messenger plugin
// controller.on('facebook_optin', (bot, message) => {
//   bot.reply(message, 'Welcome to my app!');
// });
//
controller.hears(['tour'], 'message_received', (bot, message) => {
  // function confirmSurveyTaking(response, convo) {
  //   const topRatedMessage = {
  //     'text': 'You went on the Dartmouth tour? Would you like to give us some quick feedback to help improve it?',
  //     'quick_replies': [
  //       {
  //         'content_type': 'text',
  //         'title': 'Yes',
  //         'payload': 'YES_FEEDBACK',
  //       },
  //       {
  //         'content_type': 'text',
  //         'title': 'No',
  //         'payload': 'NO_FEEDBACK',
  //       },
  //     ],
  //   };
  //
  //   // bot.reply(message, topRatedMessage);
  //   convo.ask(topRatedMessage, [
  //     {
  //       pattern: bot.utterances.yes,
  //       callback(resp, conv) {
  //         convo.say('Well I would probably use Google');
  //         // getFoodType(resp, conv);
  //         // convo.next();
  //       },
  //     },
  //     {
  //       pattern: bot.utterances.no,
  //       callback(resp, conv) {
  //         convo.say('No? Well ask me anytime, I\'ll be around here somewhere!');
  //         convo.next();
  //       },
  //     },
  //     {
  //       default: true,
  //       callback(resp, conv) {
  //         convo.say('I\'ll take that as a no? Well, ask anytime!');
  //         convo.next();
  //       },
  //     },
  //   ]);
  // }
  console.log('out here');
  console.log(message.intents[0]);
  console.log(message.intents[0].outcomes);
  console.log(message.intents);
  if (message.outcomes) {
    console.log('here');
    console.log(message.intents.outcomes[0].entities.tour_prompt[0].confidence);
  }
  // check if this sentence with tour in it is above our Wit.ai ML algorithm's 65% confidence threshhold for being related to finishing the tour
  if (message.intents.outcomes && /* message.intents.outcomes[0] && message.intents.outcomes[0].entities.tour_prompt &&*/ message.intents.outcomes[0].entities.tour_prompt[0].confidence > 0.6) {
    const topRatedMessage = {
      'text': 'You went on the Dartmouth tour? Would you like to give us some quick feedback to help improve it?',
      'quick_replies': [
        {
          'content_type': 'text',
          'title': 'Yes',
          'payload': 'YES_FEEDBACK',
        },
        {
          'content_type': 'text',
          'title': 'No',
          'payload': 'NO_FEEDBACK',
        },
      ],
    };

    bot.reply(message, topRatedMessage);
  }
});
