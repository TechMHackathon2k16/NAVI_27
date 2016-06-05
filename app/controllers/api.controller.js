'use strict';
const redis = require('../model/redis.model')
const config = require('config/config');
const facebook = require('./facebook.controller');
const request = require('request');
const debug = require('debug')('main:base.route');
const async1 = require('async');
let state='';
let question
let score = 0;
let sub_state='';


const greetMessege = ['Oh hey there, I’m Edu4fun. Let’s have some fun, shall we?','Hi there, lets get going with some funny learning.'];


module.exports = {

    register: function(req, res) {

        if (req.query['hub.verify_token'] === 'i_love_windows_10') {
            return res.send(req.query['hub.challenge']);
        }
        return res.send('Error, wrong validation token');
    },
    
    message: function(req, res) {
        facebook.getMessage(req, res, function(err, text, sender,postback) {
            if (err) return debug('Error reading message from facebook');
          
            res.sendStatus(200);
            
            if(text === '_sticker'){
                return facebook.sendMessage(sender,"How about you cut the fanciness and talk to me in only text? Is it hard? NO!");
            }
            if(postback){
                if(text === 'edugame'){
                    state = 'edugame';
                    score =0;
                    question =  require('config/questions')[Math.floor(Math.random() * 8)];
                    console.log('hello',question);
                    return facebook.sendGenericQuestionMessage(sender,question);
                }else if(text === 'edufacts'){
                    //setKey('state','edufacts');
                    state = 'edufacts';
                    sub_state = 'random';
                    return facebook.sendMessage(sender, require('config/facts')[sub_state][Math.floor(Math.random() * 8)],
                        facebook.sendMessage(sender,'You can type next for other random facts or type biology, computers, space for specific facts.'));
                }else if(state === 'edugame'){
                    if(text === 'A' || text === 'B' || text === 'C'  ){
                        if(question.answer === text){
                            
                            let remarks=0;
                            if(score<3){
                                remarks = score;
                            }else{
                                remarks = 3;
                            }
                            score=score+1;
                            facebook.sendMessage(sender,config.right[remarks]);
                        }else{
                            facebook.sendMessage(sender,config.wrong[Math.floor(Math.random() * 4)]);
                        }
                    }
                }
            }
            else if(state === 'edugame'){
                if(text==='next' || text==='skip' || text==='other' || text==='next question' ){
                    question =  require('config/questions')[Math.floor(Math.random() * 8)];
                    return facebook.sendGenericQuestionMessage(sender,question);
                }else if(text === 'end' || text === 'no more facts' || text === 'change topic'){
                    state = '';
                    question={};
                    
                    return facebook.sendMessage(sender, 'Okay, so games over. You Scroed: '+ score,facebook.sendGenericMessage(sender,config.categories));
                    
                }else if(text==='help'){
                    return facebook.sendMessage(sender, 'Okay, so we were in the middle of this quiz game. Type next for next question or type end to over it.');                    
                }
                else{
                    return helpUser(req.body.entry[0].messaging[0].sender.id,sender,facebook.sendMessage);  
                }  

            }
            else if(state === 'edufacts'){
                if(text === 'next' || text === 'more' || text === 'next please') {
                    
                    return facebook.sendMessage(sender, require('config/facts')[sub_state][Math.floor(Math.random() * 8) ]);
                }else if (text === 'biology' || text === 'space' || text === 'computers' || text === 'random') {
                    sub_state = text;
                    return facebook.sendMessage(sender, require('config/facts')[sub_state][Math.floor(Math.random() * 8) ]);
                }
                else if(text === 'end' || text === 'no more facts' || text === 'change topic'){
                    state = '';
                    sub_state='';
                    return facebook.sendMessage(sender, 'Phew, those where some facts',facebook.sendGenericMessage(sender,config.categories));
                }else if(text==='help'){
                    return facebook.sendMessage(sender, 'Okay, so we were in the middle of some cool facts. Type next(more facts) or end');                    
                }
                else{
                    return helpUser(req.body.entry[0].messaging[0].sender.id,sender,facebook.sendMessage);  
                }  
                
            } 
            else{
                
                //greeting
                if(config.greetings.some((v,i)=>{
                   return text === v; 
                })){
                    return welcomeUser(req.body.entry[0].messaging[0].sender.id,sender,facebook.sendMessage);
                }
                //yes
                else if(config.yes.some((v,i)=>{
                   return text === v; 
                })){
                    return goAhead(req.body.entry[0].messaging[0].sender.id,sender,facebook.sendMessage);    
                }
                else if (text==='help'){
                    return facebook.sendMessage(sender, 'Seems you are lost.',facebook.sendGenericMessage(sender,config.lostCategories));
                }
                else{
                    return helpUser(req.body.entry[0].messaging[0].sender.id,sender,facebook.sendMessage);  
                }
            }
        });

    }
};

function welcomeUser(user_id,sender,cb){
    
    request({
        url: config.user_url+user_id,
        qs: {access_token:config.access_token,
            fields:"first_name,last_name,profile_pic,locale,timezone,gender"
        },
        method: 'GET',
        }, function(error, response, body) {
            if (error) {
              return debug('Error sending message: ', error);
            } else if (response.body.error) {
              return debug('Error: ', response.body.error);
            }
            let user = JSON.parse(response.body);
            
            cb(sender, 'Hi! '+user.first_name);
            
        }   
    );
    
}
function helpUser(user_id,sender,cb){
    request({
        url: config.user_url+user_id,
        qs: {access_token:config.access_token,
            fields:"first_name,last_name,profile_pic,locale,timezone,gender"
        },
        method: 'GET',
        }, function(error, response, body) {
            if (error) {
              return debug('Error sending message: ', error);
            } else if (response.body.error) {
              return debug('Error: ', response.body.error);
            }
            let user = JSON.parse(response.body);
            
            cb(sender, 'I’m sorry! '+user.first_name+' I’m not sure I understand. Try typing something else.',facebook.sendGenericMessage(sender,config.helpCategories));
            
            
        }   
    );
    
}


function goAhead(user_id,sender,cb){
    request({
        url: config.user_url+user_id,
        qs: {access_token:config.access_token,
            fields:"first_name,last_name,profile_pic,locale,timezone,gender"
        },
        method: 'GET',
        }, function(error, response, body) {
            if (error) {
              return debug('Error sending message: ', error);
            } else if (response.body.error) {
              return debug('Error: ', response.body.error);
            }
            let user = JSON.parse(response.body);
            
            cb(sender, 'That\'s great! '+user.first_name,facebook.sendGenericMessage(sender,config.categories));
            
            
        }   
    );
    
}

function getKey(key,cb){
    redis.getData(key,(err,result)=>{
        if(err){
           cb(err) 
        }else {
            cb(null,result);
        }
    });
}

function setKey(key,value){
    redis.setData(key,value,(err)=>{
                    if(err) return debug(err);
    });
}