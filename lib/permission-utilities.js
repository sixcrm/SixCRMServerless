'use strict'
const _ =  require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');

class PermissionUtilities {

    constructor(){
        this.messages = {
            nopermission: 'Sorry, you don\'t have access to this Entity type.'
        }
        this.universalpermissions = ['role/read'];
    }

    validatePermissions(action, entity, identifier){

        du.deep('Validate Permissions');

        return new Promise((resolve, reject) => {

            if(_.has(global, 'disableactionchecks') && global.disableactionchecks == true){

                du.warning('USER ACL actionchecks disabled.');

                return resolve(true);

            }else{

                let permission_string = this.buildPermissionString(action, entity, identifier);

                du.deep('Permission String: '+permission_string);

                this.getPermissions().then((permissions) => {

                    du.deep('Permissions:', permissions);

                    let has_permission = this.hasPermission(permission_string, permissions.allow);

                    du.deep('Has Permission: '+has_permission);

                    return resolve(has_permission);

                }).catch((error) => {

                    return reject(error);

                });

            }

        });

    }

    getPermissions(){

        return new Promise((resolve, reject) => {

            du.deep('Global User:', global.user, 'Global Account: ', global.account);

            if(!_.has(global, 'user') || _.isNull(global.user) || !_.has(global, 'account') || _.isNull(global.account)){

                return reject(new Error('Missing request parameters'));

            }else{

                du.deep('Global User: ', global.user);
                du.deep('Global Account: ', global.account);

                let permission_object = this.buildPermissionObject();

                du.deep('Permission Object: ', permission_object);

                resolve(permission_object);

            }

        });

    }

    buildPermissionObject(){

        du.deep('Build Permission Object');

        let allow = [];
        let deny = ['*'];

        if(_.has(global, 'user') && _.has(global.user, 'acl')){

		 	if(_.isArray(global.user.acl)){

     global.user.acl.forEach((acl_object) => {

         if(_.has(acl_object, 'account') && _.has(acl_object.account, 'id')){

             du.deep('ACL OBJECT: ', acl_object);

             if(acl_object.account.id == '*' || acl_object.account.id == global.account){

                 if(_.has(acl_object, 'role') && _.has(acl_object.role, 'permissions') && _.has(acl_object.role.permissions, 'allow') && _.isArray(acl_object.role.permissions.allow)){
                     if(acl_object.role.permissions.allow.length > 0){
                         allow = allow.concat(acl_object.role.permissions.allow);
                     }
                 }else{
                     throw new Error('Unexpected ACL object structure');
                 }

                 if(_.has(acl_object, 'role') && _.has(acl_object.role, 'permissions') && _.has(acl_object.role.permissions, 'deny') && _.isArray(acl_object.role.permissions.deny)){
                     if(acl_object.role.permissions.deny.length > 0){
                         deny = deny.concat(acl_object.role.permissions.deny);
                     }
                 }

             }

         }else{

             throw new Error('Unset ACL Account');

         }

     });

 }

        }

        allow = _.uniq(allow);
        deny = _.uniq(deny);

        return {allow:allow, deny:['*']};

    }

    buildPermissionString(action, entity, identifier){

        if(_.isUndefined(action) || action == ''){
            return false;
        }

        if(_.isUndefined(entity) || entity == ''){
            return false;
        }

        let permission_string = entity+'/'+action;

        if(!_.isUndefined(identifier)){
            permission_string += '/'+identifier;
        }else{
            permission_string += '/*';
        }

        return permission_string;

    }

    hasPermission(required_permission_string, permission_array){

        let return_value = false;

        if(!_.isArray(permission_array)){

            return false;

        }

        if(this.isUniversalPermission(required_permission_string)){

            return_value = true;

        }else{

            permission_array.forEach((permission) => {

  		        if(this.isPermissionMatch(required_permission_string, permission)){

              return_value = true;
              return true;

          }

            });

        }

        return return_value;

    }

    isPermissionMatch(required_permission, submitted_permission){

        du.debug('Is Permission Match');

        if(this.hasWildcardAccess(submitted_permission)){
            return true;
        }

        if(this.hasSpecificPermission(required_permission, submitted_permission)){
            return true;
        };

        if(this.hasCanonicalPermission(required_permission, submitted_permission)){
            return true;
        };

        if(this.hasPermissionSuperset(required_permission, submitted_permission)){
            return true;
        }

    }

    hasPermissionSuperset(required_permission, submitted_permission){

        du.debug('Has Permission Subset');

        let canonical_required_permission_array = this.buildCanonicalPermissionString(required_permission).split('/');
        let canonical_submitted_permission_array = this.buildCanonicalPermissionString(submitted_permission).split('/');

        for(let i = 0; i < canonical_required_permission_array.length; i++){

            if(canonical_required_permission_array[i] !== canonical_submitted_permission_array[i] && canonical_submitted_permission_array[i] !== '*'){

                return false;

            }

        }

        du.highlight('Has Permission Subset: true');

        return true;

    }

    isUniversalPermission(required_permission){

        du.debug('Is Universal Permission');

        let return_value = false;

        this.universalpermissions.forEach((universal_permission) => {

            if(this.isPermissionMatch(required_permission, universal_permission)){

                du.highlight('Is Universal Permission: true');

                return_value = true;
                return true;

            }

        });

        return return_value;

    }

    hasCanonicalPermission(required_permission, submitted_permission){

        du.debug('Has Canonical Permission');

        let canonical_required_permission_string = this.buildCanonicalPermissionString(required_permission);
        let canonical_submitted_permission_string = this.buildCanonicalPermissionString(submitted_permission);

        if(canonical_required_permission_string == canonical_submitted_permission_string){

            du.highlight('Has Canonical Permission: true');

            return true;

        }

        return false;

    }

    buildCanonicalPermissionString(permission_string){

        let permission_string_array = permission_string.split('/');

        for(var i = 0; i < Math.max(0, (3 - permission_string_array.length)); i++){
            permission_string_array.push('*');
        }

        return permission_string_array.join('/');

    }

    hasWildcardAccess(permission_string){

        du.debug('Has Wildcard Access');

        if(permission_string == '*'){

            du.highlight('Has Wildcard Access: true');

            return true;

        }

        return false;

    }

    hasSpecificPermission(permission_string, required_permission_string){

        du.debug('Has Specific Permission');

        if(permission_string == required_permission_string){

            du.highlight('Has Specific Permission: true');

            return true;

        }

        return false;

    }

    validatePermissionsArray(permissions_array){

        du.deep('Validate Permissions Array');

        du.debug(permissions_array);

        return new Promise((resolve, reject) => {

            this.getPermissions().then((permissions) => {

                let permission_object = {
                    has_permission: false,
                    permission_failures: []
                };

                let permission_failures = [];

                permissions_array.forEach((permission_string) => {

                    if(!this.hasPermission(permission_string, permissions.allow)){

                        permission_failures.push(permission_string);

                    }

                });

                if(permission_failures.length < 1){ permission_object['has_permission'] = true; }

                permission_object['permission_failures'] = permission_failures;

                return resolve(permission_object);

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    setGlobalAccount(account){

        du.deep('Set Global Account');

        global.account = account;

    }

    unsetGlobalAccount(){

        du.deep('Unset Global Account');

        global.account = undefined;

    }

    unsetGlobalUser(){

        du.deep('Unset Global User.');

        global.user = undefined;

    }

    setGlobalUser(user){

        du.deep('Set Global User');

        global.user = user;

    }

    disableACLs(){

        du.warning('Disable ACLs');

        global.disableactionchecks = true;
        global.disableaccountfilter = true;

    }

    enableACLs(){

        du.warning('Enable ACLs');

        global.disableactionchecks = false;
        global.disableaccountfilter = false;

    }

    /**
	 * Whether the global ACL checks are disabled.
     * @returns {boolean}
     */
    areACLsDisabled() {
        return global.disableactionchecks && global.disableaccountfilter;
    }

}

var pu = new PermissionUtilities();

module.exports = pu;
