const du = require('../lib/debug-utilities.js');
const mungeutilities = require('../lib/munge-utilities.js');
let email = process.argv[2];

du.output(mungeutilities.munge(email));