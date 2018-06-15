
require('@sixcrm/sixcrmcore');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const mungeutilities = require('@sixcrm/sixcrmcore/util/munge-utilities').default;

let email = process.argv[2];

process.env.SIX_VERBOSE = 2;
du.info(mungeutilities.munge(email));
