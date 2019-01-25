const _ = require('lodash');

const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const PostbackProvider = global.SixCRM.routes.include('controllers', 'providers/postback-provider.js');

module.exports = class TrackerHelperController {

	constructor() {

		this.postbackprovider = new PostbackProvider();

	}

	handleTracking(session, data) {
		return this.getAffiliateIDsFromSession(session).then((affiliate_ids) => {

			return this.executeAffiliatesTracking(affiliate_ids, data);

		});

	}

	getAffiliateIDsFromSession(session) {
		if (!_.has(this, 'sessionController')) {
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		return this.sessionController.getAffiliateIDs(session);

	}

	//Note:  This structure allows for additional tracking behaviors.
	executeAffiliatesTracking(affiliate_ids, data) {
		if (!_.isArray(affiliate_ids) || affiliate_ids.length < 1) {
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
		if (!_.has(this, 'trackerController')) {
			const TrackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');
			this.trackerController = new TrackerController();
		}

		return this.trackerController.listByAffiliate({
			affiliate: affiliate_id
		}).then((trackers) => {

			if (!_.isArray(trackers)) {
				return Promise.resolve(null);

			}

			let tracker_executions = arrayutilities.map(trackers, (tracker) => {
				return this.executeTracker(tracker, data);
			});

			return Promise.all(tracker_executions);

		});

	}

	executeTracker(tracker, data) {
		return new Promise((resolve, reject) => {

			switch (tracker.type) {

				case 'postback':

					return this.executePostback(tracker, data).then((result) => {

						return resolve(result);

					});

				case 'html':

					return resolve(null);

				default:

					return reject(eu.getError('validation', 'Unrecognized Tracker type: ' + tracker.type));

			}

		});

	}

	executePostback(tracker, data) {
		//Note:  We may want to parse the affiliate that is executing the postback into the data object

		return this.postbackprovider.executePostback(tracker.body, data);

	}

}
