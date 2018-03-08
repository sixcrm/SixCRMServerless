const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const PostgresConnection = global.SixCRM.routes.include('lib', 'analytics/postgres-connection.js');

class RedshiftContext {

  constructor() {

    this._connection = null;

  }

  init() {

    du.debug('RedshiftContext.init()');

    return new Promise((resolve, reject) => {

      if (this._connection) {

        return resolve();

      }

      const config = global.SixCRM.configuration.site_config.redshift;

      if (!config.host) {

        du.debug('RedshiftContext.init(): fetching host');

        global.SixCRM.configuration.getEnvironmentConfig('redshift.host')
          .then((host) => {

            du.debug('RedshiftContext.init(): host fetched', host);

            config.host = host;

            this._connection = new PostgresConnection(config);

            return resolve();

          })
          .catch((ex) => {

            reject(ex);

          });

      } else {

        this._connection = new PostgresConnection(config);

        resolve();

      }

    });

  }

  dispose() {

    du.debug('RedshiftContext.dispose()');

    this.connection.dispose();
    this._connection = null;
  }

  get connection() {

    if (!this._connection) {

      eu.throwError('server', 'Redshift connection not initialized');

    }

    return this._connection;

  }

}

module.exports = new RedshiftContext();
