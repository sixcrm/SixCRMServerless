const CampaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
const AffiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');
const TrackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');

module.exports = class TrackingController extends transactionEndpointController{

	constructor(){

		super();

		this.required_permissions = [
			'tracker/read'
		];

		this.parameter_definitions = {
			execute: {
				required : {
					event:'event'
				}
			}
		};

		this.parameter_validation = {
			'event':global.SixCRM.routes.path('model', 'endpoints/tracking/event.json'),
			'affiliate':global.SixCRM.routes.path('model', 'entities/affiliate.json'),
			'campaign':global.SixCRM.routes.path('model', 'entities/campaign.json'),
			'trackers':global.SixCRM.routes.path('model', 'endpoints/tracking/trackers.json')
		};

		this.campaignController = new CampaignController();
		this.affiliateController = new AffiliateController();
		this.trackerController = new TrackerController();

		this.initialize();

	}

	execute(event){
		return this.preamble(event)
			.then(() => this.acquireEventProperties())
			.then(() => this.acquireTrackers())
		//Note: filtering or validation here?
			.then(() => this.respond());

	}

	acquireEventProperties(){
		let promises = [
			this.acquireAffiliate(),
			this.acquireCampaign()
		];

		return Promise.all(promises).then(() => {
			return true;
		});

	}

	acquireAffiliate(){
		let event = this.parameters.get('event');

		return this.affiliateController.getByAffiliateID(event.affiliate_id).then(affiliate => {

			this.parameters.set('affiliate', affiliate);

			return true;

		});

	}

	acquireCampaign(){
		let event = this.parameters.get('event');

		return this.campaignController.get({id: event.campaign}).then(campaign => {

			this.parameters.set('campaign', campaign);

			return true;

		});

	}

	acquireTrackers(){
		let campaign = this.parameters.get('campaign');
		let affiliate = this.parameters.get('affiliate');

		return this.trackerController.listByCampaignAndAffiliate({campaign: campaign.id, affiliate: affiliate.id, type: 'html'})
			.then(result => this.trackerController.getResult(result, 'trackers'))
			.then(trackers => {

				this.parameters.set('trackers', trackers);

				return true;

			});

	}

	respond(){
		let trackers = this.parameters.get('trackers');

		return Promise.resolve({trackers: trackers});

	}

}
