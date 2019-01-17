import * as chai from 'chai';
const expect = chai.expect;
import ConfigurationUtilities from '../../../../src/Configuration';

describe('core/ConfigurationUtilities.js', () => {

	describe('determineStageFromAccountIdentifier', () => {

		let AWS_ACCOUNT;

		let context_temp;

		before(() => {
			context_temp = context;
			AWS_ACCOUNT = process.env.AWS_ACCOUNT;
		});

		after(() => {
			context = context_temp; // eslint-disable-line no-global-assign
			process.env.AWS_ACCOUNT = AWS_ACCOUNT;
		});

		it('throws error when account identifier returns unexpected value', () => {

			const aws_account = process.env.AWS_ACCOUNT;

			const configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			process.env.AWS_ACCOUNT = aws_account ? aws_account : 'an_aws_account'; // invalid aws account value

			try {
				configurationUtilities.determineStageFromAccountIdentifier();
			} catch (error) {
				expect(error.message).to.equal('[500] Unrecognized account identifier in stage.yml: ' + process.env.AWS_ACCOUNT);
			}
		});

		it('returns null when account identifier is undefined', () => {

			// remove any account identifier specification
			delete process.env.AWS_ACCOUNT;
			delete process.env.aws_account;
			delete (context as any).invokedFunctionArn;

			const configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			expect(configurationUtilities.determineStageFromAccountIdentifier()).to.equal(null);
		});
	});

	describe('resolveStage', () => {

		let env;

		before(() => {
			env = process.env;
		});

		after(() => {
			process.env = env;
		});

		it('returns "local" when stage value is null', () => {

			delete process.env.CIRCLECI;

			const configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

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

			const this_aws_account = process.env.AWS_ACCOUNT;

			const configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			process.env.AWS_ACCOUNT = this_aws_account ? this_aws_account : 'an_aws_account';

			expect(configurationUtilities.getAccountIdentifierFromEnvironment()).to.equal(process.env.AWS_ACCOUNT);
		});

		it('successfully retrieves an account identifier "aws_account" from environment', () => {

			const this_aws_account = process.env.aws_account;

			const configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			delete process.env.AWS_ACCOUNT;

			process.env.aws_account = this_aws_account ? this_aws_account : 'an_aws_account';

			expect(configurationUtilities.getAccountIdentifierFromEnvironment()).to.equal(process.env.aws_account);
		});

		it('returns null when an account identifier from environment is undefined', () => {

			const configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

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
			context = context_temp; // eslint-disable-line no-global-assign
			process.env.AWS_ACCOUNT = AWS_ACCOUNT;
		});

		it('returns account identifier from environment', () => {

			const aws_account = process.env.AWS_ACCOUNT;

			const configurationUtilities = new ConfigurationUtilities(global.SixCRM.routes);

			process.env.AWS_ACCOUNT = aws_account ? aws_account : 'an_aws_account';

			expect(configurationUtilities.getAccountIdentifier()).to.equal(process.env.AWS_ACCOUNT);
		});

	});
});
