import axios from 'axios';
import Yelp from 'yelp';
import botkit from 'botkit';
//import mongoStorage from 'botkit-storage-mongo';

// this is es6 syntax for importing libraries
// in older js this would be: var botkit = require('botkit')

console.log('starting bot');

// botkit controller
const controller = botkit.slackbot({
  debug: false,
//  storage: mongoStorage = new mongoStorage({monogUri: process.env.MONGODB_URI}),
});

// initialize slackbot
const slackbot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
  // this grabs the slack token we exported earlier
}).startRTM(err => {
  // start the real time message client
  if (err) { throw new Error(err); }
});

// prepare webhook
// for now we won't use this but feel free to look up slack webhooks
controller.setupWebserver(process.env.PORT || 3001, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, slackbot, () => {
    if (err) { throw new Error(err); }
  });
});

const yelp = new Yelp({
  consumer_key: process.env.YELP_CONSUMER_KEY,
  consumer_secret: process.env.YELP_CONSUMER_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKEN_SECRET,
});

// example hello response
controller.hears(['hello', 'hi', 'howdy'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `Hello, ${res.user.real_name}!`);
    } else {
      bot.reply(message, 'Hello there!');
    }
  });
});

// I'm Bored conversation
controller.hears(['I\'m bored'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  function joke1(response, convo) {
    convo.ask('How many programmers does it take to change a lightbulb', (response, convo) => {
      convo.say('None, that\'s a hardware problem');
      joke2(response, convo);
      convo.next();
    });
  }
  function joke2(response, convo) {
    convo.ask('What did you think about that joke?', (response, convo) => {
      convo.say(`${response.text}? Okay how about this one:`);
      convo.ask('Why do java programmers wear glasses?', (response, convo) => {
        convo.say('Because they don\'t C#!');
        convo.say('Okay that\'s all I got.');
        convo.next();
      });
      convo.next();
    });
  }
  bot.startConversation(message, (response, convo) => {
    convo.ask('I have some jokes. Are you interested?', [
      {
        pattern: bot.utterances.yes,
        callback: (response, convo) => {
          convo.say('Okay I\'ll try my best');
          joke1(response, convo);
          convo.next();
        },
      },
      {
        default: true,
        callback: (response, convo) => {
          convo.say('WHAT! Too bad I\'m telling them anyway.');
          joke1(response, convo);
          convo.next();
        },
      },
    ]);
  });
});

// Restaurant query
controller.hears(['I\'m hungry'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  function foodRec(response, convo) {
    convo.say('Superb!');
    convo.ask('What type of food are you interested in?', (response, convo) => {
      const foodType = response.text;
      convo.ask('And where are you located?', (response, convo) => {
        const foodLoc = response.text;
        convo.say('Okay I\'m looking...');
        yelp.search({ term: foodType, location: foodLoc })
        .then((data) => {
          if (data == undefined || data.total == 0) {
            convo.say('Sorry I couldn\'t find anything. :( ');
          } else {
            const result = data.businesses[0];
            const restaurant = {
              'text': `Here\'s what I found (Yelp rated it ${result.rating} stars):`,
              'attachments': [{
                'title': result.name,
                'text': result.snippet_text,
                'title_link': result.url,
                'image_url': result.image_url,
              }],
            };
            convo.say(restaurant);
          }
        })
        .catch((err) => {
          console.log(err);
        });
        convo.next();
      });
      convo.next();
    });
    convo.next();
  }

  bot.startConversation(message, (response, convo) => {
    convo.ask('Do you want me to recommend food options near you?', [
      {
        pattern: bot.utterances.yes,
        callback: (response, convo) => {
          foodRec(response, convo);
          convo.next();
        },
      },
      {
        default: true,
        callback: (response, convo) => {
          convo.say('bummer.');
          convo.next();
        },
      },
    ]);
  });
});
controller.hears('weather', ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.startConversation(message, (response, convo) => {
    convo.ask('What zipcode do you want me to find the weather for?', (response, convo) => {
      convo.say(`Here's weather information:\n https://weather.com/weather/today/l/${response.text}`);
      /*axios(`http://api.wunderground.com/api/${process.env.WEATHER_UNDERGROUND_KEY}/forecast/q/${response.text}.json`)
      .then((data) => {
        const forecast = data.forecast.txt_forecast.forecastday[0];
        convo.say(forecast.title);
        const weatherUpdate = {
          'text': 'Here\'s a weather update:',
          'attachments': [{
            'title': forecast.title,
            'text': forecast.fcttext,
            'thumb_url': forecast.icon_url,
          }],
        };
        convo.say(weatherUpdate);
      }).catch((err) => {
        console.log(err);
      });*/
      convo.next();
    });
  });
});

// help response
controller.hears('help', ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  const helpMessage = 'I can reply Hello and respond to: \n' +
    'I love you:  a cute picture\n' +
    'I\'m hungry : restaurant query\n' +
    'alma_bot wake up! (if I\'m asleep): a woken up message\n' +
    'I\'m bored: a conversation and joke\n' +
    'weather: a zipcode based weather update!';
  bot.reply(message, helpMessage);
});

// attachement repsonse
controller.hears('I love you', ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  const loveAttachement = {
    'text': 'Love you too!',
    'attachments': [{
      'text': '',
      'image_url': 'http://i780.photobucket.com/albums/yy82/Cute_Stuff/Cartoon/LovePuppy.gif',
    }],
  };
  bot.reply(message, loveAttachement);
});

controller.on(['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'What are you even talking about?');
});


controller.on('outgoing_webhook', (bot, message) => {
  const sleepMessage = {
    'text': 'I promise I\'m awake',
    'attachments': [{
      'text': '',
      'image_url': 'http://3.bp.blogspot.com/_mTqs4fBFm50/SkU02dgiw-I/AAAAAAAAAVg/2xVwIWz_9a0/s400/sleepy.gif',
    }],
  };
  bot.replyPublic(message, sleepMessage);
});

/*
controller.on('user_typing', (bot, message) => {
  bot.reply(message, 'stop typing!');
});*/

controller.on('team_join', (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `Welcome to the channel, ${res.user.real_name}!`);
    } else {
      bot.reply(message, 'Hello there!');
    }
  });
});
