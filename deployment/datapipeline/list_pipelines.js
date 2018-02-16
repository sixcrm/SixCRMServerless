'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const datapipelineutilities = global.SixCRM.routes.include('lib', 'data-pipeline-utilities.js');


datapipelineutilities.listPipelines().then(data =>{
	du.warning('pipelines');
	du.warning(data);
})