const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const RedshiftConnection = require('@adexchange/aeg-redshift').RedshiftConnection;

class RedshiftContext {

  constructor() {

    this._connection = null;

  }

  init() {

    du.debug('RedshiftContext.init()');

    if (this._connection) {

      return Promise.resolve();

    }

    return this._resolveConfiguration()
      .then(config => {

        this._connection = new RedshiftConnection(config);

      });

  }

  dispose() {

    du.debug('RedshiftContext.dispose()');

    return this.connection.dispose().then(() => {

      return this._connection = null

    });

  }

  get connection() {

    if (!this._connection) {

      eu.throwError('server', 'Redshift connection not initialized');

    }

    return this._connection;

  }

  withConnection(delegate) {

    return this._resolveConfiguration()
      .then((config) => {

        return RedshiftConnection.withConnection(delegate, config);

      });

  }

  _resolveConfiguration() {

    return new Promise((resolve, reject) => {

      const config = global.SixCRM.configuration.site_config.redshift;

      if (!config.host) {

        du.debug('RedshiftContext._createConnection(): fetching host');

        global.SixCRM.configuration.getEnvironmentConfig('redshift.host')
          .then(host => {

            du.debug('RedshiftContext._createConnection(): host fetched', host);

            config.host = host;

            return resolve(config);

          })
          .catch((ex) => {

            reject(ex);

          });

      } else {

        resolve(config);

      }

    });

  }

}

module.exports = new RedshiftContext();
