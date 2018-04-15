

module.exports.createorder = (event, context, callback) => {

  require('../../../SixCRM.js');
  global.SixCRM.clearState();

  let LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
  let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
  const createOrderController = new CreateOrderController();

  createOrderController.execute(event).then((response) => {

      return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

      return new LambdaResponse().issueError(error, event, callback);

  });

};
