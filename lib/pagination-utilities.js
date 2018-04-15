
const _ = require('lodash');

class PaginationUtilities {

	static mergePagination(parameters_array, pagination_array){

		if(_.isObject(parameters_array)){

			if(_.isObject(pagination_array)){

				for (var key in pagination_array) {

					if(!_.has(parameters_array, key)){

						parameters_array[key] = pagination_array[key];

					}

				}

			}

		}else{

			if(_.isObject(pagination_array)){

				parameters_array = pagination_array;

			}else{

				parameters_array = [];

			}

		}

		return parameters_array;

	}

	static createSQLPaginationObject(parameters){

		let pagination_object = {
			order: parameters.order,
			limit: parseInt(parameters.limit),
			offset: parseInt(parameters.offset),
			count: parseInt(parameters.count)
		};

		return pagination_object;

	}

	static createSQLPaginationInput(pagination_object, default_pagination){

		if(_.isUndefined(default_pagination)){

			default_pagination = {
				order: 'desc',
				offset: 0,
				limit: 50
			};

		}

		if(_.isUndefined(pagination_object)){
			return default_pagination;
		}

		let return_object = {};

		for (var key in default_pagination) {

			if(_.has(pagination_object, key)) {

				return_object[key] = pagination_object[key];

			}else{

				return_object[key] = default_pagination[key];

			}

		}

		return return_object;

	}

}

module.exports = PaginationUtilities;
