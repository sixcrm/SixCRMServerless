
require('../SixCRM.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

let stringset = 'abcdefghijklmnopqrstuvwzxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_-+={[]}<,>.?/|\\';
let randompassword = random.createRandomString(20, stringset, null);

du.info(randompassword);
