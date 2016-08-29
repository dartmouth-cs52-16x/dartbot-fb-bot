# DartBot-Tour Guide

Fb Bot for DartBot - The Virtual Tour Guide Bot
DartBot (Tour Guide) provides prospective students with a tour of Dartmouth by (1) providing information about various locations across campus and directions to the next stop of the tour and (2) answering questions they may have using a Facebook Messenger ChatBot.

This repo contains the code for the Facebook Messenger Bot portion of the project.

## Architecture

Our code is organized into three main repos: the API backend, the DartBot Tour Guide frontend and the Facebook Messenger bot using botkit.
This repo stores JavaScript for our Facebook Messenger bot created using botkit.


## Setup

Facebook requires a webhook for all communication; the bot server must therefore be running in an environment that can be accessed from the web. We chose to simply redeploy to heroku with every change; this was certainly not the best design decision, and looking back is something we would have done differently. However, to "run" the bot you must simply make any changes you wish and then push to heroku. It is always running therefore and can be messages on Facebook. No webhook is required to wake sleeping dynos, since everything is done through webhooks.


## Deployment

Server is deployed on Heroku. No persistent storage is set up because all data is sent to the seperate backend where it is stored. 
Currently plan to deploy the server on heroku with a free mongodb.

## Authors

Robin, Alma, Ian, Ahsan, Larissa

## Acknowledgments

Wit.ai, howdyai/Botkit on github
