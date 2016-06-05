'use strict';

const app = require('express')();
const debug = require('debug')('main:app');
const port = process.env.PORT || 3000;

require('./app/middleware/base.middleware')(app);
require('./app/routes/base.route')(app);

app.listen(port,(err)=>{
    if(err){ 
        debug('Error',err);
    }
    debug('Server running at: ',port);
});
