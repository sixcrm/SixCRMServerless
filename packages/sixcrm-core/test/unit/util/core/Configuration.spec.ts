import * as chai from 'chai';
const expect = chai.expect;
import * as _ from 'lodash';

import objectutilities from '../../../../src/util/object-utilities';
import Configuration from '../../../../src/Configuration';

describe('core/Configuration.js', () => {

	const DEVELOPMENT_ACCOUNT = '068070110666';

	describe('constructor', () => {
		it('instantiates', () => {

			const configuration = new Configuration(global.SixCRM.routes);

			// expect(configuration.stage).to.equal('local');
			expect(configuration.serverless_config).not.to.be.undefined;
			expect(configuration.serverless_config).not.to.be.undefined;
			expect(configuration.site_config).not.to.be.undefined;
			expect(configuration.site_config).not.to.be.null;

		});

		it('handles incorrect stage', () => {
			try {
				new Configuration(global.SixCRM.routes, 'some_unknown_stage');
			} catch (error) {
				expect(error.code).to.equal(500);
			}
		});

	});

	describe('getAccountIdentifier', () => {

		let _context: any = null;
		let _process_env: any = null;

		before(() => {
			_process_env = process.env;
			_context = context;
		});

		after(() => {
			process.env = _process_env;
			/* eslint-disable no-global-assign */
			context = _context;
		});

		it('determines account identifier', () => {
			const configuration = new Configuration(global.SixCRM.routes, 'development');

			process.env.AWS_ACCOUNT = DEVELOPMENT_ACCOUNT;

			expect(configuration.getAccountIdentifier()).to.equal(DEVELOPMENT_ACCOUNT);
		});

		xit('determines account identifier - fallback to lambda', () => {
			delete process.env.AWS_ACCOUNT;
			// eslint-disable-next-line no-global-assign
			context = {
				invokedFunctionArn: DEVELOPMENT_ACCOUNT
			} as any;
			const configuration = new Configuration(global.SixCRM.routes);

			expect(configuration.getAccountIdentifier()).to.equal(DEVELOPMENT_ACCOUNT);
		});

	});

	describe('determineStageFromAccountIdentifier', () => {

		let _process_env: any = null;

		before(() => {
			_process_env = process.env;
		});

		after(() => {
			process.env = _process_env;
		});

		xit('determines stage from account identifier', () => {
			const configuration = new Configuration(global.SixCRM.routes);

			process.env.AWS_ACCOUNT = DEVELOPMENT_ACCOUNT;

			expect(configuration.determineStageFromAccountIdentifier()).to.equal('development');
		});

	});

	describe('handleStage', () => {

		let process_env;

		beforeEach(() => {
			process_env = process.env;
		});

		afterEach(() => {
			process.env = process_env;
		});

		it('successfully identifies the stage based on branch name', () => {

			const stages = global.SixCRM.routes.include('config', 'stages.yml');

			objectutilities.map(stages, (key) => {

				const stage = stages[key];

				if (_.has(stage, 'branch_name')) {

					if (!_.isUndefined(process.env.AWS_ACCOUNT) && !_.isNull(process.env.AWS_ACCOUNT)) {
						delete process.env.AWS_ACCOUNT;
					}

					if (!_.isUndefined(process.env.stage) && !_.isNull(process.env.stage)) {
						delete process.env.stage;
					}

					process.env.CIRCLE_BRANCH = stage.branch_name;

					const configuration = new Configuration(global.SixCRM.routes);

					expect(configuration.stage).to.equal(key);

				}

			});

		});

		it('successfully identifies the stage (local) in absence of branch name or ', () => {

			// let stages = global.SixCRM.routes.include('config', 'stages.yml');

			if (!_.isUndefined(process.env.AWS_ACCOUNT) && !_.isNull(process.env.AWS_ACCOUNT)) {
				delete process.env.AWS_ACCOUNT;
			}

			if (!_.isUndefined(process.env.stage) && !_.isNull(process.env.stage)) {
				delete process.env.stage;
			}

			if (!_.isUndefined(process.env.CIRCLE_BRANCH) && !_.isNull(process.env.CIRCLE_BRANCH)) {
				delete process.env.CIRCLE_BRANCH;
			}

			if (!_.isUndefined(process.env.CIRCLECI) && !_.isNull(process.env.CIRCLECI)) {
				delete process.env.CIRCLECI;
			}

			const configuration = new Configuration(global.SixCRM.routes);

			expect(configuration.stage).to.equal('local');

		});

	});

});
