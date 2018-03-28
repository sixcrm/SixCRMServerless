'use strict';
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class EntityACLController extends entityController {
    constructor() {
        super('entityacl');
        this.primary_key = 'entity';
    }

    listByType({type, pagination, search, fatal}) {
        return this.queryBySecondaryIndex({
            index_name: 'type-index',
            field: 'type',
            index_value: type,
            pagination,
            search,
            fatal
        });
    }
}

