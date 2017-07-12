'use strict';
require('require-yaml');
require('../../routes.js');
const _ = require('underscore');
const AWS = require("aws-sdk");

const du = global.routes.include('lib', 'debug-utilities.js');

module.exports = class BaseDeployment {

  constructor(stage) {
    this.stage = stage;
    this.aws_config = this.getAwsConfig();
  }

  getAwsConfig() {
    let config = global.routes.include('config', `${this.stage}/site.yml`).aws;

    if (!config) {
      throw 'Unable to find aws config file.';
    }
    return config;
  }

}
