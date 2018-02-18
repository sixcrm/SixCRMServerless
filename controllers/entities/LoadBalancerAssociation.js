'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class loadBalancerAssociationController extends entityController {

  constructor(){

    super('loadbalancerassociation');

  }

  getLoadBalancer(loadbalancerassociation){

    du.debug('Get LoadBalancer');

    return this.executeAssociatedEntityFunction(
      'loadBalancerController',
      'get',
      {id: loadbalancerassociation.loadbalancer}
    );

  }

  getCampaign(loadbalancerassociation){

    du.debug('Get Campaign');

    return this.executeAssociatedEntityFunction(
      'campaignController',
      'get',
      {id: loadbalancerassociation.campaign}
    );

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
