

module.exports.shippedtodelivered = (event, context, callback) => {

	require('../../../../SixCRM.js');

	const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
	const ShippedToDeliveredForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/shippedToDeliveredForwardMessage.js');
	const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

	du.debug('Executing Shipped To Delivered Forward Message Controller');

	return executor(new ShippedToDeliveredForwardMessageController(), event, callback);

};
