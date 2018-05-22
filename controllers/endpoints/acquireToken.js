const _ = require('lodash');
const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
const jwtprovider = new JWTProvider();
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js')

module.exports = class AcquireTokenController extends transactionEndpointController {

	constructor() {

		super();

		this.required_permissions = [
			'user/read',
			'account/read',
			'campaign/read',
			'affiliate/read',
			'affiliate/create',
			'tracker/read'
		];

		this.parameter_definitions = {
			execute: {
				required: {
					event: 'event'
				}
			}
		};

		this.parameter_validation = {
			'updatedevent': global.SixCRM.routes.path('model', 'endpoints/acquireToken/updatedevent.json'),
			'event': global.SixCRM.routes.path('model', 'endpoints/acquireToken/event.json'),
			'campaign': global.SixCRM.routes.path('model', 'entities/campaign.json'),
			'transactionjwt': global.SixCRM.routes.path('model', 'definitions/jwt.json'),
			'affiliates': global.SixCRM.routes.path('model', 'endpoints/components/affiliates.json')
		};

		this.initialize();

		this.event_type = 'click';

	}

	execute(event) {

		du.debug('Execute');

		return this.preamble(event)
			.then(() => this.validateCampaign())
			.then(() => this.acquireToken())
			.then(() => this.postProcessing())
			.then(() => {
				return this.parameters.get('transactionjwt');
			});

	}

	validateCampaign() {

		du.debug('Validate Campaign');

		let event = this.parameters.get('event');

		if (!_.has(this, 'campaignController')) {
			const CampaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
			this.campaignController = new CampaignController();
		}

		return this.campaignController.get({
			id: event.campaign
		}).then((campaign) => {

			if (!_.has(campaign, 'id')) {
				throw eu.getError('bad_request', 'Invalid Campaign ID: ' + event.campaign);
			}

			this.parameters.set('campaign', campaign);

			return true;

		});

	}

	acquireToken() {

		du.debug('Acquire Token');

		let jwt_prototype = {
			user: {
				user_alias: global.user.alias
			}
		};

		let transaction_jwt = jwtprovider.getJWT(jwt_prototype, 'transaction');

		this.parameters.set('transactionjwt', transaction_jwt);

		return Promise.resolve(true);

	}

	async postProcessing() {

		du.debug('Post Processing');

		await this.handleAffiliateInformation();


		await Promise.all([
			this.pushEvent(),
			AnalyticsEvent.push('click', {
				affiliates: this.parameters.get('affiliates', {fatal: false}),
				campaign: this.parameters.get('campaign', {fatal: false})
			})
		]);

	}

	handleAffiliateInformation() {

		du.debug('Handle Affiliate Information');

		let event = this.parameters.get('event');

		if (!_.has(this, 'affiliateHelperController')) {
			const AffiliateHelperController = global.SixCRM.routes.include('helpers', 'entities/affiliate/Affiliate.js');

			this.affiliateHelperController = new AffiliateHelperController();
		}

		return this.affiliateHelperController.handleAffiliateInformation(event).then(results => {

			if (_.has(results, 'affiliates')) {

				this.parameters.set('affiliates', results.affiliates);

				return true;

			}

			return false;

		});

	}

}
