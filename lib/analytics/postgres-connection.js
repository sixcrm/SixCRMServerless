const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const pg = require('pg');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const parseDate = require('pg').types.getTypeParser(1114);
const RedshiftConnection = require('@adexchange/aeg-redshift').RedshiftConnection;

pg.types.setTypeParser(1114, (stringValue) => {

  return timestamp.convertToISO8601(parseDate(stringValue));

});

module.exports = class PostgresConnection extends RedshiftConnection {

  query(q) {

    du.debug('RedshiftContext.query()', q);

    return new Promise((resolve, reject) => {

      super.query(q)
        .then((r) => {

          du.debug('RedshiftContext.query(): resolved', q);

          return resolve(r.rows);

        })
        .catch((ex) => {

          reject(ex);

        });

    });

  }

  queryWithArgs(q, a) {

    du.debug('RedshiftContext.queryWithArgs()', q);

    return new Promise((resolve, reject) => {

      super.queryWithArgs(q, a)
        .then((r) => {

          du.debug('RedshiftContext.queryWithArgs(): resolved', q);

          return resolve(r.rows);

        })
        .catch((ex) => {

          reject(ex);

        });

    });

  }

};
