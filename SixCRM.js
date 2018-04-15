

const _ = require('underscore');
const SixCRMBase = require('./SixCRMBase');

class SixCRM extends SixCRMBase {

  clearState() {

    super.clearState();

    this.setConfigurationFile();

  }

}

if (!_.has(global, 'SixCRM')) {
  global.SixCRM = new SixCRM();
  global.SixCRM.instantiate();
  global.SixCRM.setConfigurationFile();
}
