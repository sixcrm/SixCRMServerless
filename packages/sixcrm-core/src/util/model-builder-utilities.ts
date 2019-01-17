import * as _ from 'lodash';

import du from './debug-utilities';
import stringutilities from './string-utilities';
import arrayutilities from './array-utilities';

const references_regex = /"\$ref":\s*"([0-9a-zA-Z./\-_]+?)"/g;

export default class ModelBuilderUtilities {

	static build(path_to_model, depth = 0) {

		if (depth > 20) {

			du.warning('Maximum depth reached:  returning empty object.');
			return {};

		}

		let model = global.SixCRM.routes.include('model', path_to_model);

		const submodel_references = this.getSubmodels(model);

		if (_.isArray(submodel_references) && submodel_references.length > 0) {

			arrayutilities.map(submodel_references, (submodel_reference) => {

				const path_to_schema = path_to_model.substring(0, path_to_model.lastIndexOf('/')) + '/' + submodel_reference;

				const submodel = this.build(path_to_schema, (depth + 1));

				model = this.replaceInstancesOfSubmodel(model, submodel_reference, submodel);

			});

		}

		return model;

	}

	static getSubmodels(model) {

		const stringified_model = JSON.stringify(model);

		return stringutilities.matchGroup(stringified_model, references_regex, 1);

	}

	static replaceInstancesOfSubmodel(model, submodel_reference, submodel) {

		const stringified_model = JSON.stringify(model);
		const stringified_submodel = JSON.stringify(submodel).trim().replace(/(^{)|(}$)/g, ''); // remove opening and closing bracket
		const regex_reference = new RegExp('"\\$ref":"' + submodel_reference + '"', 'g');

		return JSON.parse(stringified_model.replace(regex_reference, stringified_submodel));
	}

}
