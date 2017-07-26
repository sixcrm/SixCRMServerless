require('./SixCRM.js');

/*return global.SixCRM.configuration.waitForStatus('ready').then(() => {
  console.log('Ready');
  return global.SixCRM.configuration.getEnvironmentConfig('elasticache_endpoint').then((result) => {
    console.log(result);
  })
});*/

return global.SixCRM.configuration.getEnvironmentConfig('elasticache_endpoint').then((result) => {
  console.log(result);
});
/*


return global.SixCRM.configuration.getEnvironmentConfig('elasticache_endpoint').then((result) => {
  console.log(result);
});
*/
