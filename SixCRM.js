

const _ = require('lodash');
const SixCRMBase = require('./SixCRMBase');

class SixCRM extends SixCRMBase {

}

if (!_.has(global, 'SixCRM')) {
	global.SixCRM = new SixCRM();
	global.SixCRM.instantiate();
}
