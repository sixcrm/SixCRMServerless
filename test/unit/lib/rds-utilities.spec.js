'use strict'

const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

describe('lib/rds-utilities', () => {

  describe('construct', () => {

    it('successfully constructs', () => {

      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      expect(objectutilities.getClassName(rdsutilities)).to.equal('RDSUtilities');

    });

  });

  describe('describeClusters', () => {

    it('successfully describes cluster with cluster identifier', () => {


      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      rdsutilities.rds = {
        describeDBClusters:(parameters, callback) => {
          let error = new Error('DBClusterNotFoundFault: DBCluster '+parameters.DBClusterIdentifier+' not found');

          error.statusCode = 404
          callback(error, null);
        }
      };

      let parameters = {
        DBClusterIdentifier:'sixcrm'
      };

      return rdsutilities.describeClusters(parameters).then(result => {
        expect(result).to.have.property('ResponseMetadata');
        expect(result).to.have.property('DBClusters');
      });

    });

    it('successfully describes clusters', () => {

      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      rdsutilities.rds = {
        describeDBClusters:(parameters, callback) => {
          callback(null, {ResponseMetadata:{}, DBClusters:[]});
        }
      };

      return rdsutilities.describeClusters({}).then(result => {
        expect(result).to.have.property('ResponseMetadata');
        expect(result).to.have.property('DBClusters');

      });

    });

  });

});
