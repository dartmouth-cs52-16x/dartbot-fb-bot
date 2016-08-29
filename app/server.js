import botkit from 'botkit';
import dotenv from 'dotenv';
// import { getLocations } from './api';
import axios from 'axios';

const ROOT_URL = 'http://dartmouthbot.herokuapp.com/api';


// import { getLocations } from './api';
// import mongoStorage from 'botkit-storage-mongo';

// this is es6 syntax for importing libraries
// in older js this would be: var botkit = require('botkit')

dotenv.config({ silent: true });

const wit = require('botkit-middleware-witai')({
  token: process.env.WIT_AI_TOKEN,
});


// botkit controller
const controller = botkit.facebookbot({
  access_token: process.env.FB_BOT_ACCESS_TOKEN,
  verify_token: process.env.FB_BOT_VERIFY_TOKEN,
//  storage: mongoStorage = new mongoStorage({monogUri: process.env.MONGODB_URI}),
});

controller.middleware.receive.use(wit.receive);

// initialize slackbot
const fbbot = controller.spawn({
});

controller.setupWebserver(process.env.PORT || 3000, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, fbbot, () => {
  });
});

controller.on('message_received', (bot, message) => {
  console.log(message);
  if (message.attachments && message.attachments[0] && message.attachments[0].payload) {
    if (message.attachments[0].payload.coordinates) {
      console.log("long" + message.attachments[0].payload.coordinates.long);
			/* eslint-disable */
			returnNearestLocation(bot, message, message.attachments[0].payload.coordinates.long);
			/* eslint-enable */
    }
  }
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
/* eslint-disable */

function returnNearestLocation(bot, message, coordinates) {

  //bot.reply(message, 'Beep boop. Finding your nearest tour location...');
	const fields = { lat: coordinates.lat, long: coordinates.long };
	axios.put(`${ROOT_URL}/data/closest`, fields)
		.then(response => {
	    const locLat = response.data.gps.lat;
	    const locLong = response.data.gps.long;
	    bot.reply(message, {
	      'attachment': {
			  'type': 'template',
			  'payload': {
			    'template_type': 'generic',
			    'elements': {
			      'element': {
			        'title': response.data.title,
			        'image_url': 'https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center=' + locLat + ',' + locLong + '&zoom=25&markers=' + locLat + ',' + locLong,
			        'item_url': 'http:\/\/maps.apple.com\/maps?q=' + locLat + ',' + locLong + '&z=16',
			      },
			    },
			  },
			},
});
      bot.reply(message, response.data.content);
    	// bot.reply(message, `It was: ${response.data.hits}`)
  	}).catch(error => {
			                                                                                                                        bot.reply(message, 'Something went wrong! I was unable to find the closest location. Im sorry!');
  });
}


// user said hello
controller.hears(['hello', 'hi', 'hey'], 'message_received', (bot, message) => {
  bot.reply(message, 'Hey there!');
});

controller.hears(['financial aid'], 'message_received', (bot, message) => {
    if (message.intents.length > 0 && message.intents[0].entities && message.intents[0].entities.financial_aid_query && message.intents[0].entities.financial_aid_query[0].confidence > 0.6) {
      let intent;
      if (message.intents[0].entities.financial_aid_query[0].value === 'generic') {
        intent = 'gen_fin_aid';
			}
	    else if (message.intents[0].entities.financial_aid_query[0].value === 'student_count') {
	      intent = 'count_fin_aid';
			}
			else {
        bot.reply(message, 'Dartmouth takes pride in its great financial aid. Would you like to learn about it? Say something like \'Can you tell about financial aid at Dartmouth?\' or ask something like \'How many students at Dartmouth recieve financial aid?\'');
        return;
			}
      const fields = { query: intent };
			console.log("intent is: " + intent)
      axios.put(`${ROOT_URL}/intent`, fields)
	  		.then(response => {
          bot.reply(message, {
	          'attachment': {
	              'type': 'template',
	              'payload': {
	                  'template_type': 'generic',
	                  'elements': {
	                      'element': {
	                          'title': 'Financial Aid',
	                          'image_url': 'http:\/\/diplomaclassics.com\/images\/Entities\/campus_photo\/v2\/DartBakerLibrary222435_original.png',
	                          'item_url': 'http:\/\/admissions.dartmouth.edu\/financial-aid\/',
		                    },
		                },
		            },
		        	},
	    			});
						bot.reply(message, response.data.response)

	  			}).catch(error => {
				  	bot.reply(message, 'Something went wrong, I can\'t tell you about financial aid right now!');
	  			});
			}
});

controller.hears(['where is', 'where', 'find'], 'message_received', (bot, message) => {

});


controller.hears(['tour'], 'message_received', (bot, message) => {
  function askFirstQuestion(resp, conv) {
		const tourRatingText = 'On a scale from 1 to 5, how did the tour help improve your understanding of Dartmouth?'
    const tourRatingMessage = {
      'text': tourRatingText,
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
			let response = 0;
			switch (scoreResponse.text) {
        case '1':
          // save to db
					axios.put(`${ROOT_URL}/survey`, {question: tourRatingText, response: 1})

          convo.next();
          break;
        case '2':
          // save to db
					axios.put(`${ROOT_URL}/survey`, {question: tourRatingText, response: 2})
          convo.next();
          break;
        case '3':
          // save to db
					axios.put(`${ROOT_URL}/survey`, {question: tourRatingText, response: 3})
          convo.next();
          break;
        case '4':
          // save to db
					axios.put(`${ROOT_URL}/survey`, {question: tourRatingText, response: 4})
          convo.next();
          break;
        case '5':
          // save to db
					axios.put(`${ROOT_URL}/data/closest`, {question: tourRatingText, response: 5})
          convo.next();
          break;
        default:
          convo.repeat();

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
  if (message.intents.length > 0 && message.intents[0].entities && message.intents[0].entities.tour_prompt && message.intents[0].entities.tour_prompt[0].confidence > 0.6) {
    bot.startConversation(message, confirmTour);
  }
});

controller.hears(['update menu'], 'message_received', (bot, message) => {
    const menuFields = {
    'setting_type': 'call_to_actions',
    'thread_state': 'existing_thread',
    'call_to_actions': [
        {
          'type': 'web_url',
          'title': 'View Website',
          'url': 'http://google.com/',
        },
			],
		};
    axios.post(`https://graph.facebook.com/v2.6/me/thread_settings?access_token=${process.env.FB_BOT_ACCESS_TOKEN}`, menuFields);
});
