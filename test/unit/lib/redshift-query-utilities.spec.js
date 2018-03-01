const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('lib/redshift-query-utilities', () => {

  describe('transformResult', () => {

    it('successfully transforms result', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      expect(redshiftQueryUtilities.transformResult([{a_result: 'any_data'}]))
        .to.deep.equal([{a_result: 'any_data'}]);
    });

    it('returns data from rows when result has rows property', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      //result has rows property
      expect(redshiftQueryUtilities.transformResult({rows: 'any_data'}))
        .to.equal('any_data');
    });

    it('throws error when rows property is not set', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      //result is missing rows property
      expect(redshiftQueryUtilities.transformResult({not_rows: 'any_data'})).to.be.rejectedWith('[500] Result does not have rows property');
    });

    it('throws error when result is unrecognized return type', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      //result is missing rows property
      expect(redshiftQueryUtilities.transformResult('any_data')).to.be.rejectedWith('[500] Unrecognized return type');
    });
  });

  describe('queryRaw', () => {

    it('throws error when redshift connection is not set', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      delete redshiftQueryUtilities.redshift_connection;

      return redshiftQueryUtilities.queryRaw().catch((error) => {
        expect(error.message).to.equal('[500] Unset db_client.');
      });
    });

    it('throws error when redshift query wasn\'t successfull', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      redshiftQueryUtilities.db_client = 'a_connection';

      return redshiftQueryUtilities.queryRaw().catch((error) => {
        expect(error.message).to.equal('[500] Unable to query redshift.');
      });
    });

    it('throws error from redshift connection query', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      redshiftQueryUtilities.db_client = {
        query: (query, params) => {
          return Promise.reject(new Error('fail'));
        }
      };

      return redshiftQueryUtilities.queryRaw('a_query', 'any_parameters').catch((error) => {
        expect(error.message).to.equal('fail');
      });
    });

    it('returns data from redshift connection query', () => {

      let data = [{a_result: 'any_data'}];

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      redshiftQueryUtilities.db_client = {
        query: (query, params) => {
          return Promise.resolve(data);
        }
      };

      return redshiftQueryUtilities.queryRaw('a_query', 'any_parameters').then((result) => {
        expect(result).to.deep.equal(data);
      });
    });
  });

  describe('getConnection', () => {

    it('throws error when redshift connection is not set', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      redshiftQueryUtilities.db_client = null;
      delete redshiftQueryUtilities.pg;

      return expect(redshiftQueryUtilities.getConnection()).to.be.rejectedWith('[500] Unset pg.');
    });

    it('throws error when redshift connection wasn\'t successfull', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      redshiftQueryUtilities.db_client = null;
      redshiftQueryUtilities.pg = {
        Client: function () {
        }
      };

      return expect(redshiftQueryUtilities.getConnection()).to.be.rejectedWith('[500] db.connect is not a function.');
    });

    it('throws error from redshift connection connect', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      redshiftQueryUtilities.db_client = null;
      redshiftQueryUtilities.pg = {
        Client: function () {
          this.connect = () => Promise.reject(new Error('Fail'));
        }
      };

      return expect(redshiftQueryUtilities.getConnection()).to.be.rejectedWith('Fail');
    });

    it('returns true when connected successfully', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      redshiftQueryUtilities.db_client = null;
      redshiftQueryUtilities.pg = {
        Client: function () {
          this.ok = 1;
          this.connect = () => Promise.resolve();
        }
      };

      return expect(redshiftQueryUtilities.getConnection()).eventually.to.have.property('ok');
    });
  });

  describe('closeConnection', () => {

    it('throws error when redshift connection is not set', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      delete redshiftQueryUtilities.db_client;

      return redshiftQueryUtilities.closeConnection().catch((error) => {
        expect(error.message).to.equal('[500] Unset db_client.');
      });
    });

    it('throws error when closing redshift connection wasn\'t successfull', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      redshiftQueryUtilities.db_client = 'a_connection';

      return redshiftQueryUtilities.closeConnection().catch((error) => {
        expect(error.message).to.equal('[500] db_client.end is not a function.');
      });
    });

    it('throws error from redshift connection end', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      redshiftQueryUtilities.db_client = {
        end: () => {
          return Promise.reject('fail');
        }
      };

      return expect(redshiftQueryUtilities.closeConnection()).to.be.rejectedWith('fail');
    });

    it('returns true when connection was closed successfully', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      redshiftQueryUtilities.db_client = {
        end: () => {
          return Promise.resolve(true);
        }
      };

      return expect(redshiftQueryUtilities.closeConnection()).eventually.to.be.equal(true);
    });
  });

  describe('getDBConfig', () => {

    it('throws error if redshift configuration parameter is missing', () => {

      const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      delete redshiftQueryUtilities.db_config;

      redshiftQueryUtilities.required_configuration = ['a_param'];

      expect(redshiftQueryUtilities.getDBConfig()).to.be.rejectedWith('[500] Redshift connection errors: Missing Redshift configuration parameter: a_param');
    });
  });
});
