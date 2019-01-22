
require('@6crm/sixcrmcore');
const random = require('@6crm/sixcrmcore/lib/util/random').default;
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

let stringset = 'abcdefghijklmnopqrstuvwzxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_-+={[]}<,>.?/|\\';
let randompassword = random.createRandomString(20, stringset, null);

du.info(randompassword);
