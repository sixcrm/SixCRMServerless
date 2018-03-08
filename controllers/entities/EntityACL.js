'use strict';
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const dynamoutilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

class entityACLController extends entityController {
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

    getByEntity({id}) {
        let query_parameters = this.createINQueryParameters({field: 'entity', list_array: [id]});

        return dynamoutilities.scanRecords('entityacls', query_parameters).then(result => result.Items[0]);
    }

}

module.exports = new entityACLController();
