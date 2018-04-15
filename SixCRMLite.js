

const _ = require('lodash');
const SixCRMBase = require('./SixCRMBase');

if (!_.has(global, 'SixCRM')) {
  global.SixCRM = new SixCRMBase();
  global.SixCRM.instantiate();
}
