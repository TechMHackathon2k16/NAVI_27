'use strict';
const bodyParser = require('body-parser');

module.exports = function(app){
    //throws 400 error to next, if JSON is not valid 
    app.use(bodyParser.json({
        strict:true,
        })); 
        
    //parses the url encoded strings    
    app.use(bodyParser.urlencoded({
        extended:true,
        }));
};