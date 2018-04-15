
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class TagController extends entityController {
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

    listByEntity({id, pagination, fatal}) {
        return this.queryBySecondaryIndex({field: 'entity', index_value: id, index_name: 'entity-index', pagination: pagination, fatal: fatal});
    }
}

