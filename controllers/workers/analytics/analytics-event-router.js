module.exports = {
	click: {
		transform: 'click-transform.js',
		handlers: ['click-event-handler.js']
	},
	lead: {
		transform: 'lead-transform.js',
		handlers: ['lead-event-handler.js']
	},
	order: {
		transform: 'order-transform.js',
		handlers: ['order-event-handler.js']
	},
	create_order: {
		transform: 'create-order-transform.js',
		handlers: ['create-order-event-handler.js']
	},
	confirm: {
		transform: 'confirm-transform.js',
		handlers: ['confirm-event-handler.js']
	},
	rebill: {
		transform: 'rebill-transform.js',
		handlers: ['rebill-event-handler.js']
	},
	subscription: {
		transform: 'subscription-transform.js',
		handlers: ['subscription-event-handler.js']
	},
	cancelSession: {
		transform: 'cancel-session-transform.js',
		handlers: ['cancel-session-event-handler.js']
	},
	transaction: {
		transform: 'transaction-transform.js',
		handlers: ['transaction-event-handler.js']
	},
	activity: {
		transform: 'activity-transform.js',
		handlers: ['activity-event-handler.js']
	},
	chargeback: {
		transform: 'chargeback-transform.js',
		handlers: ['chargeback-event-handler.js']
	},
	customer: {
		transform: 'customer-transform.js',
		handlers: ['customer-event-handler.js']
	}
}
