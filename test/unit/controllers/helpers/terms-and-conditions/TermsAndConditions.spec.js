'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/helpers/terms-and-conditions/TermsAndConditions.js', () => {

  describe('getLatestTermsAndConditions', () => {

    it('successfully returns the Terms and Conditions document (null input - user)', () => {

      const termsAndConditionsHelperController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');

      return termsAndConditionsHelperController.getLatestTermsAndConditions().then(result => {
        expect(result).to.have.property('title');
        expect(result).to.have.property('body');
        expect(result).to.have.property('version');
      });

    });

    it('successfully returns the Terms and Conditions document (user)', () => {

      const termsAndConditionsHelperController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');

      return termsAndConditionsHelperController.getLatestTermsAndConditions('user').then(result => {
        expect(result).to.have.property('title');
        expect(result).to.have.property('body');
        expect(result).to.have.property('version');
      });

    });

    it('successfully returns the Terms and Conditions document (owner)', () => {

      const termsAndConditionsHelperController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');

      return termsAndConditionsHelperController.getLatestTermsAndConditions('owner').then(result => {
        expect(result).to.have.property('title');
        expect(result).to.have.property('body');
        expect(result).to.have.property('version');
      });

    });

  });

});
