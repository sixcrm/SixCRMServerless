

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('Utility', () => {

	describe('Mock Event', () => {

		it('Go!', () => {

			let context = {
				campaign: MockEntities.getValidCampaign()
			};

			let EventsHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventsHelperController();

			return eventHelperController.pushEvent({event_type: 'click', context: context}).then(result => {
				du.info(result);
				return;
			});

		});

	});

});
