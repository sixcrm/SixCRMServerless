const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const pg = require('pg');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const parseDate = require('pg').types.getTypeParser(1114);
const RedshiftConnection = require('@adexchange/aeg-redshift').RedshiftConnection;

pg.types.setTypeParser(1114, (stringValue) => {

  return timestamp.convertToISO8601(parseDate(stringValue));

});

class SixRedshiftConnection extends RedshiftConnection {

  query(q) {

    return new Promise((resolve, reject) => {

      super.query(q)
        .then((r) => {

          return resolve(r.rows);

        })
        .catch((ex) => {

          reject(ex);

        });

    });

  }

  queryWithArgs(q, a) {

    return new Promise((resolve, reject) => {

      super.queryWithArgs(q, a)
        .then((r) => {

          return resolve(r.rows);

        })
        .catch((ex) => {

          reject(ex);

        });

    });

  }

}

class RedshiftQueryUtilities {

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

            this._connection = new SixRedshiftConnection(config);

            resolve();

          })
          .catch((ex) => {

            reject(ex);

          });

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

const utilities = new RedshiftQueryUtilities();

utilities.init()
  .then(() => {

    return du.debug('Redshift connection initialized');

  })
  .catch((ex) => {

    eu.throwError('server', `Failed to initialize redshift connection: ${ex.message}`, {innerError: ex});

  });

module.exports = utilities;
