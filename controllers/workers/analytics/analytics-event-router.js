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
	'upsell*': {
		transform: 'upsell-transform.js',
		handlers: ['upsell-event-handler.js']
	},
	'downsell*': {
		transform: 'downsell-transform.js',
		handlers: ['downsell-event-handler.js']
	},
	confirm: {
		transform: 'confirm-transform.js',
		handlers: ['confirm-event-handler.js']
	},
	rebill: {
		transform: 'rebill-transform.js',
		handlers: ['rebill-event-handler.js']
	},
	transaction_success: {
		transform: 'transaction-transform.js',
		handlers: ['transaction-event-handler.js']
	},
	transaction_fail: {
		transform: 'transaction-transform.js',
		handlers: ['transaction-event-handler.js']
	},
	transaction_declined: {
		transform: 'transaction-transform.js',
		handlers: ['transaction-event-handler.js']
	},
	transaction_error: {
		transform: 'transaction-transform.js',
		handlers: ['transaction-event-handler.js']
	},
	transaction_recovery_success: {
		transform: 'transaction-transform.js',
		handlers: ['transaction-event-handler.js']
	},
	transaction_recovery_fail: {
		transform: 'transaction-transform.js',
		handlers: ['transaction-event-handler.js']
	},
	transaction_recovery_declined: {
		transform: 'transaction-transform.js',
		handlers: ['transaction-event-handler.js']
	},
	transaction_recovery_error: {
		transform: 'transaction-transform.js',
		handlers: ['transaction-event-handler.js']
	}
}
