const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;

const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');

// instantiate Terminal Controller
// it will be connected to DYNAMO
// prepare input for fullfil

xdescribe('providers/terminal/Test', () => {
  let terminalController = null;

  before(() => {
    return DynamoDbDeployment.destroyTables()
      .then(() => DynamoDbDeployment.deployTables())
      .then(() => SQSDeployment.deployQueues())
      .then(() => SQSDeployment.purgeQueues())
      .then(() => DynamoDbDeployment.seedTables())
      // .then(() => redshiftSchemaDeployment.destroy())
      // .then(() => redshiftSchemaDeployment.deployTables())
      // .then(() => redshiftSchemaDeployment.seed())
  });

  beforeEach(() => {
    terminalController = new TerminalController();
  });

  it('Testing fulfillment provider', () => {
    // TODO: no actual requests are done
    return terminalController.test({fulfillment_provider_id: '1bd805d0-0062-499b-ae28-00c5d1b827ba'}).then(result => {

      // let a = {
      //   "parameter_validation": {
      //     "rebill": "/Users/Shared/Projects/sixcrm/sixcrmserverless/model/entities/rebill.json",
      //     "vendorresponse": "/Users/Shared/Projects/sixcrm/sixcrmserverless/model/providers/shipping/terminal/responses/vendorresponseclass.json"
      //   },
      //   "parameter_definition": {
      //     "constructor": {
      //       "required": {},
      //       "optional": {"rebill": "rebill", "response_type": "response_type", "vendorresponse": "vendor_response"}
      //     }
      //   },
      //   "merged_response_types": {
      //     "success": {"code": "success"},
      //     "fail": {"code": "fail"},
      //     "noaction": {"code": "noaction"},
      //     "error": {"code": "error"}
      //   },
      //   "merged_parameter_definition": {
      //     "constructor": {
      //       "required": {},
      //       "optional": {"rebill": "rebill", "response_type": "response_type", "vendorresponse": "vendor_response"}
      //     }
      //   },
      //   "merged_parameter_validation": {
      //     "response_type": "/Users/Shared/Projects/sixcrm/sixcrmserverless/model/general/response/responsetype.json",
      //     "rebill": "/Users/Shared/Projects/sixcrm/sixcrmserverless/model/entities/rebill.json",
      //     "vendorresponse": "/Users/Shared/Projects/sixcrm/sixcrmserverless/model/providers/shipping/terminal/responses/vendorresponseclass.json"
      //   },
      //   "parameters": {
      //     "store": {
      //       "response_type": "success",
      //       "vendorresponse": {"success": true, "message": "Successfully validated."}
      //     },
      //     "parameter_validation": {
      //       "response_type": "/Users/Shared/Projects/sixcrm/sixcrmserverless/model/general/response/responsetype.json",
      //       "rebill": "/Users/Shared/Projects/sixcrm/sixcrmserverless/model/entities/rebill.json",
      //       "vendorresponse": "/Users/Shared/Projects/sixcrm/sixcrmserverless/model/providers/shipping/terminal/responses/vendorresponseclass.json"
      //     },
      //     "parameter_definition": {
      //       "constructor": {
      //         "required": {},
      //         "optional": {"rebill": "rebill", "response_type": "response_type", "vendorresponse": "vendor_response"}
      //       }
      //     }
      //   }
      // }
      // console.log(JSON.stringify(result));

      return true;

    });
    // return Promise.resolve();
  });

  afterEach(() => {
  });


  after(() => {
    return DynamoDbDeployment.destroyTables();
  });

});
