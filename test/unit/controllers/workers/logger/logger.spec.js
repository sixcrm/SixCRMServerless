const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

describe('controllers/workers/logger', () => {
  describe('constructor', () => {
    it('successfully constructs', () => {

      const LoggerController = global.SixCRM.routes.include('controllers', 'workers/logger.js');
      let loggerController = new LoggerController();

      expect(objectutilities.getClassName(loggerController)).to.equal('LoggerController');

    });
  });
});
