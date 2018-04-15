
const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const ParametersController = global.SixCRM.routes.include('providers', 'Parameters.js');

function getValidParameterValidation(){

  return {
    'test': 'somepath'
  };

}

function getValidParameterDefinition(){

  return {
    execute: {
      required: {
        message: 'message'
      },
      optional:{}
    }
  };

}

describe('controllers/providers/Parameters.js', () => {

  describe('constructor', () => {

    it('successfully constructs',  () => {

      let parametersController = new ParametersController({});

      expect(objectutilities.getClassName(parametersController)).to.equal('Parameters');
      expect(parametersController.parameter_validation).to.deep.equal({});
      expect(parametersController.parameter_definition).to.deep.equal({});

    });

  });

  describe('setParameterValidation', () => {

    it('successfully sets parameter_validation',  () => {

      let parameter_validation = getValidParameterValidation();
      let parametersController = new ParametersController({});

      let result = parametersController.setParameterValidation({});

      expect(result).to.equal(true);
      expect(parametersController.parameter_validation).to.deep.equal({});

      result = parametersController.setParameterValidation({parameter_validation: parameter_validation});
      expect(result).to.equal(true);
      expect(parametersController.parameter_validation).to.deep.equal(parameter_validation);

      parameter_validation = {'test':'someotherpath'};
      result = parametersController.setParameterValidation({parameter_validation: parameter_validation});
      expect(result).to.equal(true);
      expect(parametersController.parameter_validation).to.deep.equal(parameter_validation);

      parameter_validation = objectutilities.merge({'test2':'anotherpath'}, parameter_validation);
      result = parametersController.setParameterValidation({parameter_validation: parameter_validation});
      expect(result).to.equal(true);
      expect(parametersController.parameter_validation).to.deep.equal(parameter_validation);

    });

  });

  describe('setParameterDefinition', () => {

    it('successfully sets parameter_definition',  () => {

      let parameter_definition = getValidParameterDefinition();
      let parametersController = new ParametersController({});

      let result = parametersController.setParameterDefinition({});

      expect(result).to.equal(true);
      expect(parametersController.parameter_definition).to.deep.equal({});

      result = parametersController.setParameterDefinition({parameter_definition: parameter_definition});
      expect(result).to.equal(true);
      expect(parametersController.parameter_definition).to.deep.equal(parameter_definition);

      let second_parameter_definition = {
        someotheraction: {
          required: {
            messages: 'messages'
          },
          optional:{
            additional_information: 'additionalinformation'
          }
        }
      };

      result = parametersController.setParameterDefinition({parameter_definition: second_parameter_definition});
      expect(result).to.equal(true);
      expect(parametersController.parameter_definition).to.deep.equal(objectutilities.merge(parameter_definition, second_parameter_definition));

      parameter_definition = objectutilities.merge(second_parameter_definition, parameter_definition);
      result = parametersController.setParameterDefinition({parameter_definition: parameter_definition});
      expect(result).to.equal(true);
      expect(parametersController.parameter_definition).to.deep.equal(parameter_definition);

    });

  });

});
