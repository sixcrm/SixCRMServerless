const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const RedshiftConnection = require('@adexchange/aeg-redshift').RedshiftConnection;

class PostgresContext {

  constructor(configRoot) {

    this._connection = null;
    this._configRoot = configRoot;

  }

  init() {

    du.debug('PostgresContext.init()');

    if (this._connection) {

      return Promise.resolve();

    }

    return this._resolveConfiguration()
      .then(config => {

        this._connection = new RedshiftConnection(config);

      });

  }

  dispose() {

    du.debug('PostgresContext.dispose()');

    return this.connection.dispose().then(() => {

      return this._connection = null

    });

  }

  get connection() {

    if (!this._connection) {

      eu.throwError('server', 'Postgres connection not initialized');

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

      const config = global.SixCRM.configuration.site_config[this._configRoot];

      if (!config.host) {

        du.debug('PostgresContext._createConnection(): fetching host');

        global.SixCRM.configuration.getEnvironmentConfig(`${this._configRoot}.host`)
          .then(host => {

            du.debug('PostgresContext._createConnection(): host fetched', host);

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

module.exports = PostgresContext;
