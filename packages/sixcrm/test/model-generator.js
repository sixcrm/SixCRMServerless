

const jsf = require('json-schema-faker');
const uuidV4 = require('uuid/v4');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;


class ModelGenerator {

	/**
     * Returns a valid instance of object of given schema with random values.
     *
     * @param name
     * @returns {Promise}
     */
	random(name) {

		du.debug('Generating random ' + name);

		name = name.replace('.json', ''); // Extension is optional

		let schema = global.SixCRM.routes.include('model', name+'.json');

		du.debug('Schema is', schema);

		let working_directory =  process.cwd();

		process.chdir(global.SixCRM.routes.path('model') + name.substring(0, name.lastIndexOf('/')));

		return jsf.resolve(schema).then((generated_object) => {
			process.chdir(working_directory);

			// Technical Debt: Avoid this workarounds.
			//
			// Library that we use for generating valid data ('json-schema-faker') does not generate uris the way our
			// validator utilities accept. We either need to generate better uris, or have more correct validation.
			// In the meantime here we manually change the values of uris when whe _know_ they are needed.

			return generated_object;

		});

	}

	randomEntity(name) {
		return this.random('entities/'+name);
	}

	randomEntityWithId(name) {
		return this.random('entities/'+name).then((entity) => {
			entity['id'] = uuidV4();

			return entity;
		});
	}

	/**
     * Returns an instance of object from database seeds.
     *
     * @param name
     * @returns {Promise}
     */
	existing(name) {

		// Technical Debt: This method might be better suited in another class.

		let seeds = global.SixCRM.routes.include('seeds', name+'s.json');

		if (seeds.length > 0) {

			return Promise.resolve(seeds[0]);

		}

		return Promise.reject(eu.getError('server','Can\'t find seed for entity with name '+name+'.'));

	}

}

module.exports = new ModelGenerator();
