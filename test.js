require('./SixCRM.js');

/*
return global.SixCRM.configuration.waitForStatus('ready').then(() => {
  console.log('Ready!!');
  return global.SixCRM.configuration.getEnvironmentConfig('howdy').then((result) => {
    console.log('here!!');
    console.log(result);

  })
});
*/

return global.SixCRM.configuration.getEnvironmentConfig('elasticache_endpoint', false).then((result) => {
  console.log(result);
  console.log(global.SixCRM.configuration.environment_config);
  return global.SixCRM.configuration.getEnvironmentConfig('elasticache_endpoint').then((result) => {
    console.log(result);
  });
});


/*


return global.SixCRM.configuration.getEnvironmentConfig('elasticache_endpoint').then((result) => {
  console.log(result);
});
*/
