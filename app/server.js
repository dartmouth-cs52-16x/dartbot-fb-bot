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


controller.on('message_received', (bot, message) => {
  console.log('recieved in server.js m_r');
  // if (message.attachments && message.attachments[0] && message.attachments[0].payload) {
  //   if (message.attachments[0].payload.coordinates) {
  //     console.log(message.attachments[0].payload.coordinates.lat);
  //   }
  // }
    // carefully examine and
    // handle the message here!
    // Note: Platforms such as Slack send many kinds of messages, not all of which contain a text field!
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
controller.hears(['hello, hi, hey'], 'message_received', (bot, message) => {
  bot.reply(message, 'Hey there!');
});

controller.hears(['where is', 'where', 'find'], 'message_received', (bot, message) => {

});


controller.hears(['tour'], 'message_received', (bot, message) => {
  function askFirstQuestion(resp, conv) {
    const tourRatingMessage = {
      'text': 'On a scale from 1 to 5, how did the tour help improve your understanding of Dartmouth?',
      'quick_replies': [
        {
          'content_type': 'text',
          'title': '1',
          'payload': '1_SCORE',
        },
        {
          'content_type': 'text',
          'title': '2',
          'payload': '2_SCORE',
        },
        {
          'content_type': 'text',
          'title': '3',
          'payload': '3_SCORE',
        },
        {
          'content_type': 'text',
          'title': '4',
          'payload': '4_SCORE',
        },
        {
          'content_type': 'text',
          'title': '5',
          'payload': '5_SCORE',
        },
      ],
    };

    conv.ask(tourRatingMessage, (scoreResponse, convo) => {
      switch (scoreResponse.text) {
        case '1':
          // save to db
          convo.say('Bummer');
          convo.next();
          break;
        case '2':
          // save to db
          convo.say('Bummer');
          convo.next();
          break;
        case '3':
          // save to db
          convo.say('Bummer');
          convo.next();
          break;
        case '4':
          // save to db
          convo.say('Bummer');
          convo.next();
          break;
        case '5':
          // save to db
          convo.say('Bummer');
          convo.next();
          break;
        default:
          convo.say('Invalid');
      }
    });
  }
  function confirmTour(response, convo) {
    const tourYesNoMessage = {
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

    convo.ask(tourYesNoMessage, [
      {
        pattern: bot.utterances.yes,
        callback(resp, conv) {
          askFirstQuestion(resp, conv);
          convo.next();
        },
      },
      {
        pattern: bot.utterances.no,
        callback(resp, conv) {
          convo.say('That\'s okay! Enjoy your time at Dartmouth, and ask me any questions you have!');
          convo.next();
        },
      },
      {
        default: true,
        callback(resp, conv) {
          convo.say('I think that\'s a no? No worries, enjoy your time at Dartmouth, and ask me any questions you have!');
          convo.next();
        },
      },
    ]);
  }
  // check if this sentence with tour in it is above our Wit.ai ML algorithm's 65% confidence threshhold for being related to finishing the tour
  if (message.intents[0] && message.intents[0].entities && message.intents[0].entities.tour_prompt && message.intents[0].entities.tour_prompt[0].confidence > 0.6) {
    bot.startConversation(message, confirmTour);
  }
});
