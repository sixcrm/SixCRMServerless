const pg = require('pg');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const parseDate = require('pg').types.getTypeParser(1114);
const RedshiftConnection = require('@adexchange/aeg-redshift').RedshiftConnection;

pg.types.setTypeParser(1114, (stringValue) => {

  return timestamp.convertToISO8601(parseDate(stringValue));

});

class RedshiftQueryUtilities extends RedshiftConnection {

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

module.exports = new RedshiftQueryUtilities(global.SixCRM.configuration.site_config.redshift);
