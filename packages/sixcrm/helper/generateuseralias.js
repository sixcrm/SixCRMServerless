
require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const mungeutilities = require('@6crm/sixcrmcore/lib/util/munge-utilities').default;

let email = process.argv[2];

process.env.SIX_VERBOSE = 2;
du.info(mungeutilities.munge(email));
