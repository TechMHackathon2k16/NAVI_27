'use strict';

const config = require('config/config');
const request = require('request');
const debug = require('debug')('main:facebook.middleware');

function sendTextMessage(sender,text,cb){
    let messageData = {
        text:text
    };
    
    request({
        url: config.url,
        qs: {access_token:config.access_token},
        method: 'POST',
        json: {
              recipient: {id:sender},
              message: messageData,
            }
        }, function(error, response, body) {
            if (error) {
              debug('Error sending message: ', error);
            } else if (response.body.error) {
              debug('Error: ', response.body.error);
            }
            if(cb){
                cb();
            }
        }   
    );
}

function getTextMessage(req,res,cb){
     
     let messaging_events = req.body.entry[0].messaging;
      for (var i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;
        
        if(req.body.entry[0].messaging[0].message.sticker_id){
         return cb(null,'_sticker',sender,null);
        };
        if (event.message && event.message.text) {
          let text = event.message.text;
          return cb(null,text,sender,null);
        }
        
        if (event.postback) {
            let text = event.postback.payload;
            return cb(null,text,sender,true);
            //continue
          }
      
      }
      return cb(null);
    
}

function sendGenericMessage(sender,text) {
    let messageData = text;
    
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:config.access_token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    });
}


function sendGenericQuestionMessage(sender,question){
    let messageData = {
     "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                "title":question.question,
                "buttons":[
                  {
                    "type":"postback",
                    "title": question.options["A"],
                    "payload":"A"
                  },
                  {
                    "type":"postback",
                    "title":question.options["B"],
                    "payload":"B"
                  },
                  {
                    "type":"postback",
                    "title":question.options["C"],
                    "payload":"C"
                  }
                ]
              }
              ]
            }
        }
    };
    
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:config.access_token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    });
}

module.exports = {
 sendMessage: sendTextMessage,
 getMessage: getTextMessage,
 sendGenericMessage : sendGenericMessage,
 sendGenericQuestionMessage:sendGenericQuestionMessage
};

