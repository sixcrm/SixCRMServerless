const chai = require('chai');
const expect = chai.expect;
const ConfigurationUtilities = global.SixCRM.routes.include('core', 'ConfigurationUtilities.js');

describe('core/ConfigurationUtilities.js', () => {

	describe('determineStageFromAccountIdentifier', () => {

		let AWS_ACCOUNT;

		let context_temp;

		before(() => {
			context_temp = context;
			AWS_ACCOUNT = process.env.AWS_ACCOUNT;
		});

		after(() => {
			context = context_temp; //eslint-disable-line no-global-assign
			process.env.AWS_ACCOUNT = AWS_ACCOUNT;
		});

		it('throws error when account identifier returns unexpected value', () => {

			let aws_account = process.env.AWS_ACCOUNT;

			let configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			process.env.AWS_ACCOUNT = aws_account ? aws_account : 'an_aws_account'; //invalid aws account value

			try{
				configurationUtilities.determineStageFromAccountIdentifier();
			}catch (error) {
				expect(error.message).to.equal('[500] Unrecognized account identifier in stage.yml: ' + process.env.AWS_ACCOUNT);
			}
		});

		it('returns null when account identifier is undefined', () => {

			//remove any account identifier specification
			delete process.env.AWS_ACCOUNT;
			delete process.env.aws_account;
			delete context.invokedFunctionArn;

			let configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			expect(configurationUtilities.determineStageFromAccountIdentifier()).to.equal(null);
		});
	});

	describe('resolveStage', () => {

		let stage;

		before(() => {
			stage = process.env.stage;
		});

		after(() => {
			process.env.stage = stage;
		});

		it('returns "local" when stage value is null', () => {

			let configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			expect(configurationUtilities.resolveStage(null)).to.equal('local');
		});
	});

	describe('getAccountIdentifierFromEnvironment', () => {

		let AWS_ACCOUNT;

		let aws_account;

		before(() => {
			AWS_ACCOUNT = process.env.AWS_ACCOUNT;
			aws_account = process.env.aws_account;
		});

		after(() => {
			process.env.AWS_ACCOUNT = AWS_ACCOUNT;
			process.env.aws_account = aws_account;
		});

		it('successfully retrieves an account identifier "AWS_ACCOUNT" from environment', () => {

			let aws_account = process.env.AWS_ACCOUNT;

			let configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			process.env.AWS_ACCOUNT = aws_account ? aws_account : 'an_aws_account';

			expect(configurationUtilities.getAccountIdentifierFromEnvironment()).to.equal(process.env.AWS_ACCOUNT);
		});

		it('successfully retrieves an account identifier "aws_account" from environment', () => {

			let aws_account = process.env.aws_account;

			let configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			delete process.env.AWS_ACCOUNT;

			process.env.aws_account = aws_account ? aws_account : 'an_aws_account';

			expect(configurationUtilities.getAccountIdentifierFromEnvironment()).to.equal(process.env.aws_account);
		});

		it('returns null when an account identifier from environment is undefined', () => {

			let configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			delete process.env.AWS_ACCOUNT;
			delete process.env.aws_account;

			expect(configurationUtilities.getAccountIdentifierFromEnvironment()).to.equal(null);
		});
	});

	describe('getAccountIdentifier', () => {

		let AWS_ACCOUNT;

		let context_temp;

		before(() => {
			context_temp = context;
			AWS_ACCOUNT = process.env.AWS_ACCOUNT;
		});

		after(() => {
			context = context_temp; //eslint-disable-line no-global-assign
			process.env.AWS_ACCOUNT = AWS_ACCOUNT;
		});

		it('returns account identifier from environment', () => {

			let aws_account = process.env.AWS_ACCOUNT;

			let configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			process.env.AWS_ACCOUNT = aws_account ? aws_account : 'an_aws_account';

			expect(configurationUtilities.getAccountIdentifier()).to.equal(process.env.AWS_ACCOUNT);
		});

	});
});
