'use strict';
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class TagController extends entityController {
    constructor() {
        super('tag');
    }

    listByKey({key, pagination, search, reverse_order, fatal}) {
        const query_parameters = {
            key_condition_expression: '#key = :keyv',
            expression_attribute_names: {
                '#key': 'key'
            },
            expression_attribute_values: {
                ':keyv': key
            }
        };

        return this.listByAccount({query_parameters, pagination, search, reverse_order, fatal});
    }

    listByKeyFuzzy({key, pagination, search, reverse_order, fatal}) {
        let query_parameters = {
            key_condition_expression: 'begins_with(#key, :keyv)',
            expression_attribute_names: {
                '#key': 'key'
            },
            expression_attribute_values: {
                ':keyv': key
            }
        };

        return this.listByAccount({query_parameters, pagination, search, reverse_order, fatal});
    }
}

module.exports = new TagController();
