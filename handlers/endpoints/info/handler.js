

module.exports.info = (event, context, callback) => {

	require('../../../SixCRM.js');

	const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
	let InfoController = global.SixCRM.routes.include('controllers', 'endpoints/info.js');
	const infoController = new InfoController();

	infoController.execute(event).then((response) => {

		return new LambdaResponse().issueSuccess(response, callback);

	}).catch((error) =>{

		return new LambdaResponse().issueError(error, event, callback);

	});

};
