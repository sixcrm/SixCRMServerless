'use strict';
const _ = require('underscore');
var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class roleController extends entityController {

    constructor(){
        super('role');
    }

    getPermissions(role){
        if(_.has(role, 'permissions')){
            return role.permissions;
        }else{
            return null
        }
    }
}

module.exports = new roleController();
