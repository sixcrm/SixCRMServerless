'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js')

module.exports = class EC2Utilities extends AWSUtilities {

    constructor(){

      super();

      this.ec2 = new this.AWS.EC2({
        apiVersion: '2016-11-15',
        region: this.getRegion()
      });

      this.max_retry_attempts = 3;
      this.retry_pause = 3000;

    }

    assureSecurityGroup(parameters){

      du.debug('Assure Security Group');

      let security_group_identifier;

      if(_.has(parameters, 'GroupName')){

        security_group_identifier = parameters.GroupName;

      }else if(_.has(parameters, 'GroupId')){

        security_group_identifier = parameters.GroupId;

      }else{

        eu.throwError('server', 'EC2Utilities.assureSecurityGroup expects GroupName of GroupId arguments');

      }

      return this.securityGroupExists(security_group_identifier).then((result) => {

        if(result !== false){

          du.info('Security group exists ('+security_group_identifier+')...');

          return result;

        }else{

          du.info('Creating security group ('+security_group_identifier+')...');

          return this.createSecurityGroup(parameters);

        }

      });

    }

    securityGroupExists(security_group, use_cache, retry){

      du.debug('Security Group Exists');

      if(_.isUndefined(retry)){
        retry = 0;
      }

      if(_.isUndefined(use_cache)){
        use_cache = true;
      }

      if(use_cache == true && _.has(this, 'security_group_descriptions') && _.has(this.security_group_descriptions, 'SecurityGroups')){

        let security_group_description = arrayutilities.find(this.security_group_descriptions.SecurityGroups, (description) => {
          if(description.GroupName == security_group || description.GroupId == security_group){ return true; }
          return false;
        });

        if(!_.isUndefined(security_group_description)){

          return Promise.resolve(security_group_description);

        }

      }else{

        return this.describeSecurityGroups({}).then((results) => {

          this.security_group_descriptions = results;

          return this.securityGroupExists(security_group, true, retry);

        });

      }

      if(retry !== false && retry < this.max_retry_attempts){

        retry += 1;

        du.info('Retrying ('+numberutilities.appendOrdinalSuffix(retry)+' attempt...)');

        return Promise.resolve().then(timestamp.delay(this.retry_pause)).then(() => {

          return this.securityGroupExists(security_group, false, retry);

        });

      }else{

        return Promise.resolve(false);

      }


    }

    describeSecurityGroups(parameters){

      du.debug('Describe Security Groups');

      return new Promise((resolve) => {

        this.ec2.describeSecurityGroups(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

      });

    }

    createSecurityGroup(parameters){

      du.debug('Create Security Group');

      return new Promise((resolve) => {

        let handle = this.ec2.createSecurityGroup(parameters);

        handle.on('success', (response) => {
          du.highlight('Security Group Created.');
          return resolve(response);
        }).on('error',(error) => {
          eu.throwError('server', error);
        });

        handle.send();

      });

    }

    determineGroupIDFromName(group_name){

      du.debug('Determine Group ID From Name');

      return this.securityGroupExists(group_name).then((results) => {

        if(results == false){
          eu.throwError('server', 'Security group does not exist.');
        }

        if(!_.has(results, 'GroupId')){
          eu.throwError('server', 'Unexpected response group structure.');
        }

        return results.GroupId;

      });

    }

    addSecurityGroupIngressRules(parameters){

      du.debug('Add Security Group Ingress Rules');

      if(!_.has(parameters, 'GroupId')){

        if(!_.has(parameters, 'GroupName')){

          eu.throwError('server', 'Inappropriate Parameterization');

        }

        return this.determineGroupIDFromName(parameters.GroupName).then((group_id) => {

          parameters.GroupId = group_id;

          return this.addSecurityGroupIngressRules(parameters);

        });

      }else{

        return new Promise((resolve) => {

          return this.removeExistingIngressRules(parameters).then(() => {
            return this.ec2.authorizeSecurityGroupIngress(parameters, (error, data) => resolve(this.AWSCallback(error, data)));
          });

        });

      }

    }

    addSecurityGroupEgressRules(parameters){

      du.debug('Add Security Group Egress Rules');

      if(!_.has(parameters, 'GroupId')){

        if(!_.has(parameters, 'GroupName')){

          eu.throwError('server', 'Inappropriate Parameterization');

        }

        return this.determineGroupIDFromName(parameters.GroupName).then((group_id) => {

          parameters.GroupId = group_id;

          return this.addSecurityGroupEgressRules(parameters);

        });

      }else{

        return new Promise((resolve) => {

          return this.removeExistingEgressRules(parameters).then(() => {

            parameters = objectutilities.subtractiveFilter(['GroupName'], parameters);

            return this.ec2.authorizeSecurityGroupEgress(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

          });

        });

      }

    }

    removeExistingIngressRules(parameters){

      du.debug('Remove Existing Ingress Rules');

      return new Promise((resolve) => {

        return this.securityGroupExists(parameters.GroupId).then((result) => {

          if(_.has(result, 'IpPermissions') && _.isArray(result.IpPermissions) && result.IpPermissions.length > 0){

            let ip_permissions = arrayutilities.map(result.IpPermissions, this.filterRule);

            result.IpPermissions = ip_permissions;

            result = objectutilities.subtractiveFilter(['Description', 'OwnerId', 'IpPermissionsEgress','Tags','VpcId'], result);

            return this.revokeSecurityGroupIngress(result).then((result) => {

              du.highlight('Successfully revoked ingress rules');

              return resolve(result);

            });

          }else{

            du.highlight('No ingress rules to revoke...');

            return resolve(false);

          }

        });

      });

    }

    filterRule(rule){

      du.debug('Filter Rule');

      let clean_rule;

      if(_.contains(['tcp','udp'], rule.IpProtocol)){

        clean_rule = objectutilities.additiveFilter(['IpProtocol', 'IpRanges','FromPort','ToPort', 'UserIdGroupPairs'], rule);

      }else if(rule.IpProtocol == '-1'){
        clean_rule = objectutilities.additiveFilter(['IpProtocol', 'IpRanges', 'UserIdGroupPairs'], rule);
      }

      if(_.has(clean_rule, 'IpRanges') && clean_rule.IpRanges.length < 1){
        delete clean_rule.IpRanges;
      }

      if(_.has(clean_rule, 'UserIdGroupPairs') && clean_rule.UserIdGroupPairs.length < 1){
        delete clean_rule.UserIdGroupPairs;
      }

      return clean_rule;


    }

    removeExistingEgressRules(parameters){

      du.debug('Remove Existing Egress Rules');

      return new Promise((resolve) => {

        return this.securityGroupExists(parameters.GroupId).then((result) => {

          if(_.has(result, 'IpPermissionsEgress') && _.isArray(result.IpPermissionsEgress) && result.IpPermissionsEgress.length > 0){

            let ip_permissions_egress = arrayutilities.map(result.IpPermissionsEgress, this.filterRule);

            result.IpPermissions = ip_permissions_egress;

            result = objectutilities.subtractiveFilter(['GroupName', 'Description', 'OwnerId', 'IpPermissionsEgress', 'Tags', 'VpcId'], result);

            return this.revokeSecurityGroupEgress(result).then((result) => {

              du.highlight('Successfully revoked egress rules');

              return resolve(result);

            });

          }else{

            du.highlight('No egress rules to revoke...');

            return resolve(false);

          }

        });

      });

    }

    revokeSecurityGroupIngress(parameters){

      du.debug('Revoke Security Group Ingress');

      return new Promise((resolve) => {

        this.ec2.revokeSecurityGroupIngress(parameters, (error, data) => {

          resolve(this.AWSCallback(error, data))

        });

      });

    }

    revokeSecurityGroupEgress(parameters){

      du.debug('Revoke Security Group Egress');

      return new Promise((resolve) => {

        this.ec2.revokeSecurityGroupEgress(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

      });

    }

    getSecurityGroupIdentifier(object){

      du.debug('Get Security Group Identifier');

      let identifier = null;

      if(_.has(object, 'GroupId')){
        identifier = object.GroupId;
      }else if(_.has(object,'GroupName')){
        identifier = object.GroupName;
      }

      return identifier;

    }

    destroySecurityGroup(parameters){

      du.debug('Create Security Group');

      return new Promise((resolve, reject) => {

        let identifier = this.getSecurityGroupIdentifier(parameters);

        return this.securityGroupExists(identifier).then((results) => {

          if(results === false){

            du.highlight('Security Group does not exist');

            return resolve(false);

          }else{

            let handle = this.ec2.deleteSecurityGroup(parameters);

            handle.on('success',(result) => {
              du.highlight('Security Group destroyed');
              return resolve(result);
            }).on('error',(error) => {
              return reject(eu.getError('server', error));
            });

            return handle.send();
          }

        });

      });

    }

}
