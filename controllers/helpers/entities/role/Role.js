const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
module.exports = class RoleHelperController {

  constructor(){

  }

  async getDisabledRole(){

    du.debug('Get Disabled Role');

    if(!_.has(this, 'roleController')){
      const RoleController = global.SixCRM.routes.include('entities', 'Role.js');
      this.roleController = new RoleController();
    }

    let disabled_role = await this.roleController.getShared({id: this.getDisabledRoleId()});

    if(!_.isNull(disabled_role)){
      return disabled_role;
    }

    throw eu.getError('server', 'Unable to identify the disabled role.');

  }

  getDisabledRoleId(){

    return '78e507dd-93fc-413b-b21a-819480209740';

  }

  roleIntersection(role1, role2){

		du.debug('Roles Intersection');

		let intersectional_allows = [];

		allows = arrayutilities.map(role1.permissions.allow, r1_allow => {

			let r1_allow_split = r1.allow.split('/');

			arrayutilities.map(role2.permissions.allow, (r2_allow) => {

				let r2_allow_split = r2_allow.split('/');

				if(r1_allow_split[0] == '*'){
					intersectional_allows.push(r2_allow);
					return true;
				}

				if(r1_allow_split[0] == r2_allow_split[0]){
					if(r1_allow_split[1] == r2_allow_split[1]){
						intersectional_allows.push(r2_allow)
						return true;
					}

          //there was a if here...
				}



			});

		});

		let harmonized_role = {
      /*
			permissions:[
				allow:
			]
      */
		};

		return harmonized_role;

	}

}
