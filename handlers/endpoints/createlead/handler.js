

module.exports.createlead = (event, context, callback) => {

	require('../../../SixCRM.js');

	var LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
	var CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
	const createLeadController = new CreateLeadController();

	createLeadController.execute(event).then((response) => {

		return new LambdaResponse().issueSuccess(response, callback);

	}).catch((error) =>{

		return new LambdaResponse().issueError(error, event, callback);

	});

};
