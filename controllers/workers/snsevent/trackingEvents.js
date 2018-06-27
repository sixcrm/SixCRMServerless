
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

module.exports = class TrackingEventsController extends SNSEventController {

	constructor(){

		super();

		this.compliant_event_types = ['lead', 'order', 'upsell[0-9]*', 'downsell[0-9]*', 'confirm'];

		this.event_record_handler = 'triggerTracking';

		const ContextHelperController = global.SixCRM.routes.include('helpers', 'context/Context.js');

		this.contextHelperController = new ContextHelperController();

	}

	triggerTracking(){

		du.debug('Trigger Tracking');

		return Promise.resolve()
			.then(() => this.isCompliantEventType())
			.then(() => this.acquireSession())
			.then(() => this.executeTracker())
			.catch(error => {
				du.error(error);
				return true;
			});

	}

	acquireSession(){

		du.debug('Acquire Session');

		let context = this.parameters.get('message').context;

		let context_objects = this.contextHelperController.discoverObjectsFromContext(['session'], context, true);

		if(!_.has(this, 'sessionController')){
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		return this.sessionController.get({id: context_objects.session}).then(result => {
			if(_.isNull(result)){
				throw eu.getError('server','Unable to identify session from datastore: '+context_objects.session);
			}
			this.parameters.set('session', result);
			return true;
		});

	}

	executeTracker(){

		du.debug('Execute Tracker');

		let session = this.parameters.get('session');
		let context = this.parameters.get('message').context;

		const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
		let trackerHelperController = new TrackerHelperController();

		return trackerHelperController.handleTracking(session, context);

	}

}
