'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class entityACLController extends entityController {
    constructor() {
        super('entityacl');
        this.primary_key = 'entity';
    }

    assure(entity_acl) {
        du.debug('EntityACLController Assure');

        return this.get({id: entity_acl.entity}).then(acl => {
            if (_.isNull(acl)) {
                return this.create({entity: entity_acl});
            }
            return acl;
        });
    }
}

module.exports = new entityACLController();
