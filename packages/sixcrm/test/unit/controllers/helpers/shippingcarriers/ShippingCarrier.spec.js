const _ = require('lodash');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
let expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

describe('/controllers/helpers/shippingcarriers/ShippingCarrier.js', () => {

  describe('constructor', () => {

    it('successfully constructs', () => {

      const ShippingCarrierHelperController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingCarrier.js');
      let shippingCarrierHelperController = new ShippingCarrierHelperController();

      expect(objectutilities.getClassName(shippingCarrierHelperController)).to.equal('ShippingCarrierHelperController');

    });

  });

  describe('determineCarrierFromTrackingNumber', () => {

    it('throws errors for inappropriate types', () => {

      const scenarios = [
        null,
        {},
        123456789,
        [],
        undefined
      ];

      const ShippingCarrierHelperController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingCarrier.js');
      let shippingCarrierHelperController = new ShippingCarrierHelperController();

      arrayutilities.map(scenarios, scenario => {
        try{
          shippingCarrierHelperController.determineCarrierFromTrackingNumber(scenario);
          expect(false).to.equal(true, 'Method should have thrown an error');
        }catch(error){
          expect(error.message).to.equal('[500] Expected tracking number to be a string.');
        }
      });

    });

    it('determines carriers from tracking numbers', () => {

      const scenarios = [
        {
          carrier: ['Unknown'],
          id: ''
        },
        {
          carrier: ['USPS'],
          id: '9400 1000 0000 0000 0000 00'
        },
        {
          carrier: ['USPS'],
          id: '9205 5000 0000 0000 0000 00'
        },
        {
          carrier: ['USPS'],
          id: '9407 3000 0000 0000 0000 00'
        },
        {
          carrier: ['USPS','DHL'],
          id: '82 000 000 00'
        },
        {
          carrier:['FedEx','UPS'],
          id: '9999 9999 9999'
        },
        {
          carrier:['FedEx'],
          id: '9999 9999 9999 99'
        },
        {
          carrier: ['UPS'],
          id: '1Z9999999999999999'
        },
        {
          carrier: ['FedEx','UPS'],
          id: '999999999999'
        },
        {
          carrier: ['UPS'],
          id: 'T9999999999'
        },
        {
          carrier: ['UPS'],
          id: '999999999'
        },
        {
          carrier: ['UPS'],
          id: 'MI9999991111111111111111111111'
        },
        {
          carrier: ['DHL'],
          id: 'JD123456789012345678'
        }
      ];

      const ShippingCarrierHelperController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingCarrier.js');
      let shippingCarrierHelperController = new ShippingCarrierHelperController();

      arrayutilities.map(scenarios, scenario => {
        expect(shippingCarrierHelperController.determineCarrierFromTrackingNumber(scenario.id)).to.deep.equal(scenario.carrier, scenario.id+' should have matched carrier "'+scenario.carrier+'".');
      });

    });

  });

});
