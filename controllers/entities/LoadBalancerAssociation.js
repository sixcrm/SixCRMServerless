'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class loadBalancerAssociationController extends entityController {

  constructor(){

    super('loadbalancerassociation');

  }

  //Technical Debt:  This seems hacky
  listByEntitiesAndCampaign({entities, campaign}){

    du.debug('List Load Balancers By Entity and Campaign');

    let query_parameters = this.createINQueryParameters({field:'entity', list_array: entities});

    query_parameters.filter_expression += ' AND #campaign = :campaignv';
    query_parameters.expression_attribute_names = {'#campaign': 'campaign'};
    query_parameters.expression_attribute_values[':campaignv'] = this.getID(campaign);

    return this.listByAccount({query_parameters: query_parameters});

  }

  listByCampaign({campaign}){

    du.debug('List Load Balancers By Campaign');

    let query_parameters = {
      filter_expression:'#campaign = :campaignv',
      expression_attribute_names: {'#campaign': 'campaign'},
      expression_attribute_values: {':campaignv': this.getID(campaign)}
    };

    return this.listByAccount({query_parameters: query_parameters});

  }

}

module.exports = new loadBalancerAssociationController();
