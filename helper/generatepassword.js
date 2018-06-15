
require('@sixcrm/sixcrmcore');
const random = require('@sixcrm/sixcrmcore/util/random').default;
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

let stringset = 'abcdefghijklmnopqrstuvwzxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_-+={[]}<,>.?/|\\';
let randompassword = random.createRandomString(20, stringset, null);

du.info(randompassword);
