'use strict';

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

function getValidMessages(){
  return [
    {
      Body:JSON.stringify({id: uuidV4()}),
      spoofed: true
    },
    {
      Body:JSON.stringify({id: uuidV4()}),
      spoofed: true
    }
  ];
}

describe('workers/forwardMessage/pickRebillsToBillController', () => {

  describe('constructor', () => {

    it('successfully constructs', () => {

      const PickRebillsToBillController = global.SixCRM.routes.include('workers', 'forwardMessage/pickRebillsToBill.js');
      let pickRebillsToBillController = new PickRebillsToBillController();

      expect(objectutilities.getClassName(pickRebillsToBillController)).to.equal('PickRebillsToBillController');

    });

  });

  describe('invokeAdditionalLambdas', () => {

    it('returns the messages object', () => {

      let messages = getValidMessages();

      const PickRebillsToBillController = global.SixCRM.routes.include('workers', 'forwardMessage/pickRebillsToBill.js');
      let pickRebillsToBillController = new PickRebillsToBillController();

      return pickRebillsToBillController.invokeAdditionalLambdas(messages).then(result => {
        expect(result).to.deep.equal(messages);
      });

    });

  });

  describe('invokeAdditionalLambdas', () => {

    it('returns the messages object', () => {

      let messages = getValidMessages();

      const PickRebillsToBillController = global.SixCRM.routes.include('workers', 'forwardMessage/pickRebillsToBill.js');
      let pickRebillsToBillController = new PickRebillsToBillController();

      return pickRebillsToBillController.validateMessages(messages).then(result => {
        expect(result).to.deep.equal(messages);
      });

    });

  });

});
