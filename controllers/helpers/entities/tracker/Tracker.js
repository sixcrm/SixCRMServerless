const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const PostbackProvider = global.SixCRM.routes.include('controllers', 'providers/postback-provider.js');

module.exports = class TrackerHelperController {

	constructor() {

		this.postbackprovider = new PostbackProvider();

	}

	handleTracking(session, data) {

		du.debug('Handle Tracking')

		return this.getAffiliateIDsFromSession(session).then((affiliate_ids) => {

			return this.executeAffiliatesTracking(affiliate_ids, data);

		});

	}

	getAffiliateIDsFromSession(session) {

		du.debug('Get Affiliate IDs From Session');

		if (!_.has(this, 'sessionController')) {
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		return this.sessionController.getAffiliateIDs(session);

	}

	//Note:  This structure allows for additional tracking behaviors.
	executeAffiliatesTracking(affiliate_ids, data) {

		du.debug('Execute Affiliates Tracking');

		if (!_.isArray(affiliate_ids) || affiliate_ids.length < 1) {

			du.debug('No affiliate identifier information.');

			return Promise.resolve(null);

		}

		let affiliate_tracker_executions = [];

		arrayutilities.map(affiliate_ids, (affiliate_id) => {

			affiliate_tracker_executions.push(this.executeAffiliateTrackers(affiliate_id, data));

		});

		return Promise.all(affiliate_tracker_executions).then((affiliate_tracker_executions) => {

			return affiliate_tracker_executions;

		});

	}

	executeAffiliateTrackers(affiliate_id, data) {

		du.debug('Execute Affiliate Trackers');

		if (!_.has(this, 'trackerController')) {
			const TrackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');
			this.trackerController = new TrackerController();
		}

		return this.trackerController.listByAffiliate({
			affiliate: affiliate_id
		}).then((trackers) => {

			if (!_.isArray(trackers)) {

				du.debug('No trackers associated with this affiliate.');

				return Promise.resolve(null);

			}

			let tracker_executions = arrayutilities.map(trackers, (tracker) => {
				return this.executeTracker(tracker, data);
			});

			return Promise.all(tracker_executions);

		});

	}

	executeTracker(tracker, data) {

		du.debug('Execute Tracker');

		return new Promise((resolve, reject) => {

			switch (tracker.type) {

				case 'postback':

					return this.executePostback(tracker, data).then((result) => {

						return resolve(result);

					});

				case 'html':

					du.debug('Tracker has HTML type, skipping.');

					return resolve(null);

				default:

					return reject(eu.getError('validation', 'Unrecognized Tracker type: ' + tracker.type));

			}

		});

	}

	executePostback(tracker, data) {

		du.debug('Execute Postback');

		//Note:  We may want to parse the affiliate that is executing the postback into the data object

		return this.postbackprovider.executePostback(tracker.body, data);

	}

}
