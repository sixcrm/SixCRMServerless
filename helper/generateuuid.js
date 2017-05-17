'use strict'
const uuidV4 = require('uuid/v4');
const _ = require('underscore');

require('../routes.js');

const du = global.routes.include('lib','debug-utilities.js');

process.env.SIX_VERBOSE = 2;

let count = process.argv[2];

if(_.isUndefined(count)){
    count = 1;
}

for(var i = 0; i < count; i++){
    du.output(uuidV4());
}
