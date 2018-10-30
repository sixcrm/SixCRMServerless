const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

function getValidLogInput() {

	return {
		awslogs: {
			data: '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'
		}
	};

}

function getValidUnpackedData() {

	return {
		messageType: 'DATA_MESSAGE',
		owner: '068070110666',
		logGroup: '/aws/lambda/sixcrm-development-holdtopending',
		logStream: '2018/04/23/[$LATEST]f710631c0c9242618132f0ab57127e55',
		subscriptionFilters: ['holdtopending-logs-subscription-filter'],
		logEvents: [{
				id: '33997776703358993873755181612415903177902360767278809088',
				timestamp: 1524513033116,
				message: '2018-04-23T19:50:33.116Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tExecuting Hold To Pending Forward Message Controller\n',
				extractedFields: {
					event: 'Executing Hold To Pending Forward Message Controller\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.116Z'
				}
			},
			{
				id: '33997776703358993873755181612415903177902360767278809089',
				timestamp: 1524513033116,
				message: '2018-04-23T19:50:33.116Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tInstantiate Lambda\n',
				extractedFields: {
					event: 'Instantiate Lambda\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.116Z'
				}
			},
			{
				id: '33997776703358993873755181612415903177902360767278809090',
				timestamp: 1524513033116,
				message: '2018-04-23T19:50:33.116Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tSet Parameter Validation\n',
				extractedFields: {
					event: 'Set Parameter Validation\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.116Z'
				}
			},
			{
				id: '33997776703381294618953712235557438896175009128784789507',
				timestamp: 1524513033117,
				message: '2018-04-23T19:50:33.116Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tSet Parameter Definition\n',
				extractedFields: {
					event: 'Set Parameter Definition\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.116Z'
				}
			},
			{
				id: '33997776703381294618953712235557438896175009128784789508',
				timestamp: 1524513033117,
				message: '2018-04-23T19:50:33.117Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tSet Permissions\n',
				extractedFields: {
					event: 'Set Permissions\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.117Z'
				}
			},
			{
				id: '33997776703381294618953712235557438896175009128784789509',
				timestamp: 1524513033117,
				message: '2018-04-23T19:50:33.117Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tSet\n',
				extractedFields: {
					event: 'Set',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.117Z'
				}
			},
			{
				id: '33997776703381294618953712235557438896175009128784789510',
				timestamp: 1524513033117,
				message: '2018-04-23T19:50:33.117Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tValidate\n',
				extractedFields: {
					event: 'Validate',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.117Z'
				}
			},
			{
				id: '33997776703381294618953712235557438896175009128784789511',
				timestamp: 1524513033117,
				message: '2018-04-23T19:50:33.117Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tValidate Model\n',
				extractedFields: {
					event: 'Validate Model\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.117Z'
				}
			},
			{
				id: '33997776703381294618953712235557438896175009128784789512',
				timestamp: 1524513033117,
				message: '2018-04-23T19:50:33.117Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tValidate Function\n',
				extractedFields: {
					event: 'Validate Function\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.117Z'
				}
			},
			{
				id: '33997776704273324426894937161218867627080943589024006153',
				timestamp: 1524513033157,
				message: '2018-04-23T19:50:33.157Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tIssue Validation Success.\n',
				extractedFields: {
					event: 'Issue Validation Success.\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.157Z'
				}
			},
			{
				id: '33997776704273324426894937161218867627080943589024006154',
				timestamp: 1524513033157,
				message: '2018-04-23T19:50:33.157Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tModel is valid.\n',
				extractedFields: {
					event: 'Model is valid.\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.157Z'
				}
			},
			{
				id: '33997776704273324426894937161218867627080943589024006155',
				timestamp: 1524513033157,
				message: '2018-04-23T19:50:33.157Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tValidate Parameters\n',
				extractedFields: {
					event: 'Validate Parameters\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.157Z'
				}
			},
			{
				id: '33997776704273324426894937161218867627080943589024006156',
				timestamp: 1524513033157,
				message: '2018-04-23T19:50:33.157Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tIs Set\n',
				extractedFields: {
					event: 'Is Set\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.157Z'
				}
			},
			{
				id: '33997776704273324426894937161218867627080943589024006157',
				timestamp: 1524513033157,
				message: '2018-04-23T19:50:33.157Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet Messages\n',
				extractedFields: {
					event: 'Get Messages\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.157Z'
				}
			},
			{
				id: '33997776704273324426894937161218867627080943589024006158',
				timestamp: 1524513033157,
				message: '2018-04-23T19:50:33.157Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet\n',
				extractedFields: {
					event: 'Get',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.157Z'
				}
			},
			{
				id: '33997776704273324426894937161218867627080943589024006159',
				timestamp: 1524513033157,
				message: '2018-04-23T19:50:33.157Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tReceive Messages\n',
				extractedFields: {
					event: 'Receive Messages\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.157Z'
				}
			},
			{
				id: '33997776704273324426894937161218867627080943589024006160',
				timestamp: 1524513033157,
				message: '2018-04-23T19:50:33.157Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet Queue Parameters\n',
				extractedFields: {
					event: 'Get Queue Parameters\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.157Z'
				}
			},
			{
				id: '33997776704273324426894937161218867627080943589024006161',
				timestamp: 1524513033157,
				message: '2018-04-23T19:50:33.157Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tParse\n',
				extractedFields: {
					event: 'Parse',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.157Z'
				}
			},
			{
				id: '33997776704273324426894937161218867627080943589024006162',
				timestamp: 1524513033157,
				message: '2018-04-23T19:50:33.157Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet Token\n',
				extractedFields: {
					event: 'Get Token\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.157Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986579',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet Token Value\n',
				extractedFields: {
					event: 'Get Token Value\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986580',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tReplace Tokens With Values\n',
				extractedFields: {
					event: 'Replace Tokens With Values\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986581',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet Token\n',
				extractedFields: {
					event: 'Get Token\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986582',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet Token Value\n',
				extractedFields: {
					event: 'Get Token Value\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986583',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tReplace Tokens With Values\n',
				extractedFields: {
					event: 'Replace Tokens With Values\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986584',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet Token\n',
				extractedFields: {
					event: 'Get Token\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986585',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet Token Value\n',
				extractedFields: {
					event: 'Get Token Value\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986586',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tReplace Tokens With Values\n',
				extractedFields: {
					event: 'Replace Tokens With Values\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986587',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet Token\n',
				extractedFields: {
					event: 'Get Token\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986588',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tMessage parameters\n{ QueueUrl: \'https://sqs.us-east-1.amazonaws.com/068070110666/hold\',\n  MaxNumberOfMessages: 10 }\n',
				extractedFields: {
					event: 'Message parameters\n{ QueueUrl: \'https://sqs.us-east-1.amazonaws.com/068070110666/hold\',\n  MaxNumberOfMessages: 10 }\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776704295625172093467784360403345353591950529986589',
				timestamp: 1524513033158,
				message: '2018-04-23T19:50:33.158Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tInstantiate SQS\n',
				extractedFields: {
					event: 'Instantiate SQS\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.158Z'
				}
			},
			{
				id: '33997776705990481807181795143117117934074867424984498206',
				timestamp: 1524513033234,
				message: '2018-04-23T19:50:33.234Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tMessages\n[]\n',
				extractedFields: {
					event: 'Messages\n[]\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.234Z'
				}
			},
			{
				id: '33997776705990481807181795143117117934074867424984498207',
				timestamp: 1524513033234,
				message: '2018-04-23T19:50:33.234Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tSet\n',
				extractedFields: {
					event: 'Set',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.234Z'
				}
			},
			{
				id: '33997776705990481807181795143117117934074867424984498208',
				timestamp: 1524513033234,
				message: '2018-04-23T19:50:33.234Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tValidate\n',
				extractedFields: {
					event: 'Validate',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.234Z'
				}
			},
			{
				id: '33997776705990481807181795143117117934074867424984498209',
				timestamp: 1524513033234,
				message: '2018-04-23T19:50:33.234Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tValidate Model\n',
				extractedFields: {
					event: 'Validate Model\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.234Z'
				}
			},
			{
				id: '33997776705990481807181795143117117934074867424984498210',
				timestamp: 1524513033234,
				message: '2018-04-23T19:50:33.234Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tValidate Function\n',
				extractedFields: {
					event: 'Validate Function\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.234Z'
				}
			},
			{
				id: '33997776706481098201549468852230903736073131378116067363',
				timestamp: 1524513033256,
				message: '2018-04-23T19:50:33.256Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tIssue Validation Success.\n',
				extractedFields: {
					event: 'Issue Validation Success.\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.256Z'
				}
			},
			{
				id: '33997776706481098201549468852230903736073131378116067364',
				timestamp: 1524513033256,
				message: '2018-04-23T19:50:33.256Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tModel is valid.\n',
				extractedFields: {
					event: 'Model is valid.\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.256Z'
				}
			},
			{
				id: '33997776706481098201549468852230903736073131378116067365',
				timestamp: 1524513033256,
				message: '2018-04-23T19:50:33.256Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tInvoke Additional Lambdas\n',
				extractedFields: {
					event: 'Invoke Additional Lambdas\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.256Z'
				}
			},
			{
				id: '33997776706481098201549468852230903736073131378116067366',
				timestamp: 1524513033256,
				message: '2018-04-23T19:50:33.256Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet\n',
				extractedFields: {
					event: 'Get',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.256Z'
				}
			},
			{
				id: '33997776706481098201549468852230903736073131378116067367',
				timestamp: 1524513033256,
				message: '2018-04-23T19:50:33.256Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet\n',
				extractedFields: {
					event: 'Get',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.256Z'
				}
			},
			{
				id: '33997776706481098201549468852230903736073131378116067368',
				timestamp: 1524513033256,
				message: '2018-04-23T19:50:33.256Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tForward Messages To Workers\n',
				extractedFields: {
					event: 'Forward Messages To Workers\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.256Z'
				}
			},
			{
				id: '33997776706503398946747999475372439454345779739622047785',
				timestamp: 1524513033257,
				message: '2018-04-23T19:50:33.256Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet\n',
				extractedFields: {
					event: 'Get',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.256Z'
				}
			},
			{
				id: '33997776706503398946747999475372439454345779739622047786',
				timestamp: 1524513033257,
				message: '2018-04-23T19:50:33.257Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet\n',
				extractedFields: {
					event: 'Get',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.257Z'
				}
			},
			{
				id: '33997776706503398946747999475372439454345779739622047787',
				timestamp: 1524513033257,
				message: '2018-04-23T19:50:33.257Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tSet\n',
				extractedFields: {
					event: 'Set',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.257Z'
				}
			},
			{
				id: '33997776706503398946747999475372439454345779739622047788',
				timestamp: 1524513033257,
				message: '2018-04-23T19:50:33.257Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tValidate\n',
				extractedFields: {
					event: 'Validate',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.257Z'
				}
			},
			{
				id: '33997776706503398946747999475372439454345779739622047789',
				timestamp: 1524513033257,
				message: '2018-04-23T19:50:33.257Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tValidate Model\n',
				extractedFields: {
					event: 'Validate Model\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.257Z'
				}
			},
			{
				id: '33997776706503398946747999475372439454345779739622047790',
				timestamp: 1524513033257,
				message: '2018-04-23T19:50:33.257Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tValidate Function\n',
				extractedFields: {
					event: 'Validate Function\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.257Z'
				}
			},
			{
				id: '33997776706748707143931836329929332355344911716187832367',
				timestamp: 1524513033268,
				message: '2018-04-23T19:50:33.268Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tIssue Validation Success.\n',
				extractedFields: {
					event: 'Issue Validation Success.\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.268Z'
				}
			},
			{
				id: '33997776706771007889130366953070868073617560077693812784',
				timestamp: 1524513033269,
				message: '2018-04-23T19:50:33.269Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tModel is valid.\n',
				extractedFields: {
					event: 'Model is valid.\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.269Z'
				}
			},
			{
				id: '33997776706771007889130366953070868073617560077693812785',
				timestamp: 1524513033269,
				message: '2018-04-23T19:50:33.269Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tHandle Worker Response Objects\n',
				extractedFields: {
					event: 'Handle Worker Response Objects\n',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.269Z'
				}
			},
			{
				id: '33997776706771007889130366953070868073617560077693812786',
				timestamp: 1524513033269,
				message: '2018-04-23T19:50:33.269Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tGet\n',
				extractedFields: {
					event: 'Get',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.269Z'
				}
			},
			{
				id: '33997776706771007889130366953070868073617560077693812787',
				timestamp: 1524513033269,
				message: '2018-04-23T19:50:33.269Z\t9566fe06-472f-11e8-be8e-013be36d39bb\tRespond\n',
				extractedFields: {
					event: 'Respond',
					request_id: '9566fe06-472f-11e8-be8e-013be36d39bb',
					timestamp: '2018-04-23T19:50:33.269Z'
				}
			}
		]
	};

}

describe('controllers/workers/logger', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {
		it('successfully constructs', () => {

			const LoggerController = global.SixCRM.routes.include('controllers', 'workers/logger.js');
			let loggerController = new LoggerController();

			expect(objectutilities.getClassName(loggerController)).to.equal('LoggerController');

		});
	});

	describe('unpackData', () => {

		it('successfully unpacks data', () => {

			let input = getValidLogInput();

			const LoggerController = global.SixCRM.routes.include('controllers', 'workers/logger.js');
			let loggerController = new LoggerController();

			let required_properties = ['messageType', 'owner', 'logGroup', 'logStream', 'subscriptionFilters', 'logEvents'];
			return loggerController.unpackData(input).then(result => {
				arrayutilities.map(required_properties, required_property => {
					expect(result).to.have.property(required_property);
				});
				expect(result.logEvents).to.be.a('array');
				arrayutilities.map(result.logEvents, logevent => {
					expect(logevent).to.have.property('id');
					expect(logevent).to.have.property('timestamp');
					expect(logevent).to.have.property('message');
					expect(logevent).to.have.property('extractedFields');
					expect(logevent.extractedFields).to.have.property('event');
					expect(logevent.extractedFields).to.have.property('request_id');
					expect(logevent.extractedFields).to.have.property('timestamp');
				});
			});

		});

	});

	describe('transformData', () => {

		it('successfully transforms unpacked data', () => {

			const unpacked_data = getValidUnpackedData();

			let required_fields = ['@id', '@timestamp', '@message', '@owner', '@log_group', '@log_stream'];

			const LoggerController = global.SixCRM.routes.include('controllers', 'workers/logger.js');
			let loggerController = new LoggerController();

			let transformed_data = loggerController.transformData(unpacked_data);
			expect(transformed_data).to.be.an('array');

		});

		it('successfully throws a control message error', () => {

			const unpacked_data = getValidUnpackedData();
			unpacked_data.messageType = 'CONTROL_MESSAGE';

			const LoggerController = global.SixCRM.routes.include('controllers', 'workers/logger.js');
			let loggerController = new LoggerController();

			try {
				loggerController.transformData(unpacked_data);
				expect(false).to.equal(true);
			} catch (error) {
				expect(error.message).to.equal('[520] Control Message');
			}

		});

	});

	describe('transformResponse', () => {

		it('successfully transforms result to response', () => {

			let result = {
				error: null,
				success: {
					attemptedItems: 100,
					successfulItems: 100,
					failedItems: 0
				},
				successCode: 200,
				failedItems: []
			};

			const LoggerController = global.SixCRM.routes.include('controllers', 'workers/logger.js');
			let loggerController = new LoggerController();

			loggerController.transformResponse(result);

		});

		it('successfully transforms result to response when a failed item is present', () => {

			let result = {
				error: null,
				success: {
					attemptedItems: 100,
					successfulItems: 99,
					failedItems: 1
				},
				successCode: 200,
				failedItems: [{}]
			};

			const LoggerController = global.SixCRM.routes.include('controllers', 'workers/logger.js');
			let loggerController = new LoggerController();

			loggerController.transformResponse(result);

		});

		it('throws an error for a non 200-level successCode', (done) => {

			let result = {
				errors: {
					statusCode: 500,
					responseBody: 'Something went wrong'
				},
				success: {
					attemptedItems: 100,
					successfulItems: 0,
					failedItems: 100
				},
				successCode: 500,
				failedItems: []
			};

			const LoggerController = global.SixCRM.routes.include('controllers', 'workers/logger.js');
			let loggerController = new LoggerController();

			try {

				loggerController.transformResponse(result);

				done(new Error('Should not have completed'));

			} catch (ex) {

				done();

			}

		});

	});

	describe('processLog', () => {

		it('successfully processes log input', () => {

			const Client = class {
				bulk()  {
					return Promise.resolve({
						error: null,
						success: {
							attemptedItems: 100,
							successfulItems: 100,
							failedItems: 0
						},
						statusCode: 200,
						failedItems: []

					});
				}
			}

			const Elasticsearch = class {
					static get Client() {
						return Client;
					}
			}

			mockery.registerMock('elasticsearch', Elasticsearch);

			let input = getValidLogInput();

			const LoggerController = global.SixCRM.routes.include('controllers', 'workers/logger.js');
			let loggerController = new LoggerController();

			return loggerController.processLog(input).then(result => {
				du.warning(result);
			});

		});

	});

});
