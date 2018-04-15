const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const ConfigurationUtilities = global.SixCRM.routes.include('controllers', 'core/ConfigurationUtilities.js');

module.exports = class Configuration extends ConfigurationUtilities {

  constructor(stage) {

    super();

    this.handleStage(stage);

    this.setConfigurationFiles();

  }

  handleStage(stage) {

    du.debug('Handle Stage');

    this.stage = this.resolveStage(stage);

    this.setEnvironmentVariable('stage', this.stage);

  }

  setConfigurationFiles() {

    du.debug('Set Configuration Files');

    this.serverless_config = this.getServerlessConfig();

    this.site_config = this.getSiteConfig();

  }

  getServerlessConfig() {

    du.debug('Get Serverless Config');

    return global.SixCRM.routes.include('root', 'serverless.yml');

  }

  getSiteConfig() {

    du.debug('Get Site Config');

    let config;

    try {
      config = global.SixCRM.routes.include('config', this.stage + '/site.yml');
    } catch (error) {
      eu.throwError('server', 'Configuration.getSiteConfig was unable to identify file ' + global.SixCRM.routes.path('config', this.stage + '/site.yml'));
    }

    return config;

  }

}
