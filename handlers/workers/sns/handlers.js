const SnsHandler = require('./sns-handler');

const EventEmailsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/eventEmails.js');
const NotificationEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/notificationEvents.js');
const TrackingEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/trackingEvents.js');

module.exports = {

	customeremail: handleSns((event) => new EventEmailsController().execute(event)),
	notificationevents: handleSns((event) => new NotificationEventsController().execute(event)),
	trackingevents: handleSns((event) => new TrackingEventsController().execute(event))

}

function handleSns(delegate) {
	return (event, context, callback) => new SnsHandler().handle(event, context, callback, delegate);
}
