'use strict';

const facebook = require('../controllers/api.controller');
const debug = require('debug')('main:base.route');

module.exports = function(app){ 

    app.get('/', function (req, res) {
        res.send('Hello world, I am a Hodor bot.');
    });
    
    // for Facebook verification
    app.get('/webhook',facebook.register);
    
    app.post('/webhook/', facebook.message);
    
};