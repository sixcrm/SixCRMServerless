'use strict';

const jsf = require('json-schema-faker');
const uuidV4 = require('uuid/v4');
const eu = global.routes.include('lib', 'error-utilities.js');


class ModelGenerator {

    /**
     * Returns a valid instance of object of given schema with random values.
     *
     * @param name
     * @returns {Promise}
     */
    random(name) {
        let schema = global.routes.include('model', `${name}.json`);

        return jsf.resolve(schema);

    }

    randomEntity(name) {
        return this.random(`entities/${name}`);
    }

    randomEntityWithId(name) {
        return this.random(`entities/${name}`).then((entity) => {
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

        let seeds = global.routes.include('seeds', `${name}s.json`);

        if (seeds.length > 0) {

            return Promise.resolve(seeds[0]);

        }

        return Promise.reject(eu.getError('server',`Can't find seed for entity with name '${name}'.`));

    }

}

module.exports = new ModelGenerator;
