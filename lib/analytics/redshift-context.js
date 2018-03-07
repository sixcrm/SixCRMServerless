const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const PostgresConnection = global.SixCRM.routes.include('lib', 'analytics/postgres-connection.js');

class RedshiftContext {

  constructor() {

    this._connection = null;

  }

  init() {

    return new Promise((resolve, reject) => {

      const config = global.SixCRM.configuration.site_config.redshift;

      if (!config.host) {

        global.SixCRM.configuration.getEnvironmentConfig('redshift.host')
          .then((host) => {

            config.host = host;

            this._connection = new PostgresConnection(config);

            resolve();

          })
          .catch((ex) => {

            reject(ex);

          });

      } else {

        this._connection = new PostgresConnection(config);

      }

    });

  }

  get connection() {

    if (!this._connection) {

      eu.throwError('server', 'Redshift connection not initialized');

    }

    return this._connection;

  }

}

const utilities = new RedshiftContext();

utilities.init()
  .then(() => {

    return du.debug('Redshift connection initialized');

  })
  .catch((ex) => {

    eu.throwError('server', `Failed to initialize redshift connection: ${ex.message}`, {innerError: ex});

  });

module.exports = utilities;
