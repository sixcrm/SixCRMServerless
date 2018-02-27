'use strict'

const chai = require('chai');
const expect = chai.expect;
//const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');

describe('lib/rds-utilities', () => {

  describe('construct', () => {

    it('successfully constructs', () => {

      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      expect(objectutilities.getClassName(rdsutilities)).to.equal('RDSUtilities');

    });

  });

});
