'use strict'
require('../routes.js');

const du = global.routes.include('lib','debug-utilities.js');
const mungeutilities = global.routes.include('lib','munge-utilities.js');

let email = process.argv[2];

process.env.SIX_VERBOSE = 2;
du.output(mungeutilities.munge(email));
