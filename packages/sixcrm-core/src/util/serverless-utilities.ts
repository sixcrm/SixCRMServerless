import * as _ from 'lodash';
import * as serverless from 'serverless';
import du from './debug-utilities';
import eu from './error-utilities';

du.info(serverless);

// Technical Debt: Finish this.
export default class ServerlessUtilities {

	static loadConfig(stage, handler) {

		const serverless_config = global.SixCRM.routes.include('root', 'serverless.yml');

		if (!_.has(serverless_config, 'functions') || !_.has(serverless_config.functions, handler)) {
			throw eu.getError('server', 'The function "' + handler + '" is not defined in the serverless.yml file.');
		}

		const function_config = serverless_config.functions[handler];

		if (_.has(function_config, 'environment')) {

			for (const k in function_config.environment) {

				du.debug(k, function_config.environment[k]);

			}

		}

	}

}
