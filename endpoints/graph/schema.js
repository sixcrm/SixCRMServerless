'use strict';
var _  = require('underscore');

var GraphQLEnumType = require('graphql').GraphQLEnumType;
var GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

var sessionController = require('../../controllers/Session.js');
var productController = require('../../controllers/Product.js');
var customerController = require('../../controllers/Customer.js');
var transactionController = require('../../controllers/Transaction.js');
var rebillController = require('../../controllers/Rebill.js');
var creditCardController = require('../../controllers/CreditCard.js');
var productScheduleController = require('../../controllers/ProductSchedule.js');
var merchantProviderController = require('../../controllers/MerchantProvider.js');
var loadBalancerController = require('../../controllers/LoadBalancer.js');
var campaignController = require('../../controllers/Campaign.js');
var affiliateController = require('../../controllers/Affiliate.js');
var fulfillmentProviderController = require('../../controllers/FulfillmentProvider.js');
var accessKeyController = require('../../controllers/AccessKey.js');
var userController = require('../../controllers/User.js');
var emailController = require('../../controllers/Email.js');
var SMTPProviderController = require('../../controllers/SMTPProvider.js');

const emailTypeEnum = new GraphQLEnumType({
	name: 'EmailTypeEnumeration',
	description:  'The various email types.',
	values:{
		ALLORDERS: {
			value: 'allorders',
		},
		INITIALORDERS: {
			value: 'initialorders'
		},
		INITIALFULFILLMENT: {
			value: 'initialfulfillment'
		},
		RECURRINGORDER: {
			value: 'recurringorder'
		},
		RECURRINGFULFILLMENT: {
			value: 'recurringfulfillment'
		},
		RECURRINGDECLINE: {
			value: 'recurringdecline'
		},
		CANCELLATION: {
			value: 'cancellation'
		},
		RETURNTOMANUFACTURER: {
			value: 'returntomanufacturer'
		},
		REFUNDVOID: {
			value: 'refundvoid'
		}
	}
});

const merchantProviderProcessorsEnum = new GraphQLEnumType({
  name: 'MerchantProviderProcessors',
  description: 'Whitelisted Merchant Provider Processors',
  values: {
    NMI: {
      value: 'NMI'
    }
  }
});

const fulfillmentProviderProviderEnum = new GraphQLEnumType({
  name: 'FulfillmentProviderProcessors',
  description: 'Whitelisted Fulfillment Provider Processors',
  values: {
    HASHTAG: {
      value: 'HASHTAG'
    }
  }
});

var productInterface = new GraphQLInterfaceType({
  name: 'product',
  description: 'A product',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the product.',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the product.',
    },
    sku: {
      type: GraphQLString,
      description: 'The SKU of the product.',
    }
  }),
  resolveType(product) {
    return productType;
  }
});

var customerInterface = new GraphQLInterfaceType({
  name: 'customer',
  description: 'A customer',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the customer.',
    },
    firstname: {
      type: GraphQLString,
      description: 'The firstname of the customer.',
    },
    lastname: {
      type: GraphQLString,
      description: 'The lastname of the customer.',
    },
    email: {
      type: GraphQLString,
      description: 'Email of the customer.',
    }
  }),
  resolveType(customer) {
    return customerType;
  }
});

var sessionInterface = new GraphQLInterfaceType({
  name: 'session',
  description: 'A session',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the session.',
    }
  }),
  resolveType(session) {
    return sessionType;
  }
});

var transactionInterface = new GraphQLInterfaceType({
  name: 'transaction',
  description: 'A tranasaction',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the transaction.',
    }
  }),
  resolveType(transaction) {
    return transactionType;
  }
});

var productScheduleInterface = new GraphQLInterfaceType({
  name: 'productschedule',
  description: 'A product schedule',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the productschedule.',
    }
  }),
  resolveType(productschedule) {
    return productScheduleType;
  }
});

var creditCardInterface = new GraphQLInterfaceType({
  name: 'creditcard',
  description: 'A creditcard',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the creditcard.',
    }
  }),
  resolveType(creditcard) {
    return creditCardType;
  }
});

var sessionType = new GraphQLObjectType({
  name: 'Session',
  description: 'A record denoting a customer, a group of products and corresponding transactions.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the session.',
    },
    completed: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A boolean string denoting that that session has otherwise been completed or expired.',
    },
    customer: {
      type: customerType,
      description: 'The customer record that the session references.',
      resolve: session => sessionController.getCustomer(session),
    },
    created: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The timestamp when the Session was created.',
    },
    modified: {
      type: GraphQLString,
      description: 'The timestamp when the Session was modified.',
    },
    product_schedules: {
      type: new GraphQLList(productScheduleType),
      description: 'The product schedules associated with the session',
      resolve: session => sessionController.getProductSchedules(session),
    },
    rebills: {
      type: new GraphQLList(rebillType),
      description: 'The rebills associated with the session',
      resolve: function(session){
      	 return sessionController.getRebills(session.id);
      }
    },
    campaign: {
      type: new GraphQLNonNull(campaignType),
      description: 'The campaign associated with the session',
      resolve: function(session){
      	return sessionController.getCampaign(session);
      }
    }
  }),
  interfaces: [sessionInterface]
});

var transactionType = new GraphQLObjectType({
  name: 'Transaction',
  description: 'A record denoting transactions.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the transaction.',
    },
    amount: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The amount of the transaction.',
    },
    date: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The date of the transaction.',
    },
    processor_response: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The date of the transaction.',
    },
    rebill: {
	  type: new GraphQLNonNull(rebillType),
      description: 'The rebill of the transaction.',
      resolve: function(rebill){
      	 return rebillController.getRebill(rebill.id);
      }
    },
  }),
  interfaces: [transactionInterface]
});

var rebillType = new GraphQLObjectType({
  name: 'Rebill',
  description: 'A record denoting a rebill.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the transaction.',
    },
    billdate: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The date of the rebill.',
    },
    amount: {
	  type: new GraphQLNonNull(GraphQLString),
      description: 'The amount of the rebill.',
    },
    parentsession: {
      type: sessionType,
      description: 'The session associated with the transaction.',
      resolve: rebill => rebillController.getParentSession(rebill),
    },
    product_schedules: {
      type: new GraphQLList(productScheduleType),
      description:
        'The product schedules associated with the rebill',
      resolve: rebill => rebillController.getProductSchedules(rebill),
    },
    products: {
      type: new GraphQLList(productType),
      description:
        'The products associated with the rebill',
      resolve: rebill => rebillController.getProducts(rebill),
    },
    transactions: {
	  type: new GraphQLList(transactionType),
      description: 'The transactions associated with the rebill',
      resolve: rebill => rebillController.getTransactions(rebill),	
    }
  }),
  interfaces: []
});

var productType = new GraphQLObjectType({
  name: 'Product',
  description: 'A product for sale.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the product.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the product.',
    },
    sku: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The product SKU',
    },
    ship: {
      type: GraphQLString,
      description: 'The product ship, no-ship status.',
    },
    shipping_delay: {
      type: GraphQLString,
      description: 'The number of seconds to delay shipping after a transaction.',
    },
    fulfillment_provider: {
		type: fulfillmentProviderType,
		description: 'The session associated with the transaction.',
		resolve: product => productController.getFulfillmentProvider(product),    
    }
  }),
  interfaces: []
});

var productListType = new GraphQLObjectType({
  name: 'Products',
  description: 'Products for sale.',
  fields: () => ({
    products: {
      type: new GraphQLList(productType),
      description: 'The products',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var emailListType = new GraphQLObjectType({
  name: 'Emails',
  description: 'Email tempates for use.',
  fields: () => ({
    emails: {
      type: new GraphQLList(emailType),
      description: 'The email templates',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var SMTPProviderListType = new GraphQLObjectType({
  name: 'SMTPProviders',
  description: 'SMTP Providers.',
  fields: () => ({
    smtpproviders: {
      type: new GraphQLList(SMTPProviderType),
      description: 'The email templates',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var rebillListType = new GraphQLObjectType({
  name: 'Rebills',
  description: 'Orders for rebilling',
  fields: () => ({
    rebills: {
      type: new GraphQLList(rebillType),
      description: 'The rebills',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});


var userListType = new GraphQLObjectType({
  name: 'Users',
  description: 'Users for sale.',
  fields: () => ({
    users: {
      type: new GraphQLList(userType),
      description: 'The products',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var affiliateListType = new GraphQLObjectType({
  name: 'Affiliates',
  description: 'Affiliates',
  fields: () => ({
    affiliates: {
      type: new GraphQLList(affiliateType),
      description: 'The affiliates',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var creditCardListType = new GraphQLObjectType({
  name: 'CreditCards',
  description: 'Credit cards',
  fields: () => ({
    creditcards: {
      type: new GraphQLList(creditCardType),
      description: 'The affiliates',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var merchantProviderListType = new GraphQLObjectType({
  name: 'MerchantProviders',
  description: 'Merchant providers',
  fields: () => ({
    merchantproviders: {
      type: new GraphQLList(merchantProviderType),
      description: 'The merchant providers',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var fulfillmentProviderListType = new GraphQLObjectType({
  name: 'FulfillmentProviders',
  description: 'Fulfillment providers',
  fields: () => ({
    fulfillmentproviders: {
      type: new GraphQLList(fulfillmentProviderType),
      description: 'The fulfillment providers',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var accessKeyListType = new GraphQLObjectType({
  name: 'AccessKeys',
  description: 'Access keys',
  fields: () => ({
    accesskeys: {
      type: new GraphQLList(accessKeyType),
      description: 'The access keys',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var customerListType = new GraphQLObjectType({
  name: 'Customers',
  description: 'Customers',
  fields: () => ({
    customers: {
      type: new GraphQLList(customerType),
      description: 'The customers',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var loadBalancerListType = new GraphQLObjectType({
  name: 'LoadBalancers',
  description: 'Load Balancers',
  fields: () => ({
    loadbalancers: {
      type: new GraphQLList(loadBalancerType),
      description: 'The Load Balancers',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var productScheduleListType = new GraphQLObjectType({
  name: 'ProductSchedules',
  description: 'Product Schedules',
  fields: () => ({
    productschedules: {
      type: new GraphQLList(productScheduleType),
      description: 'The product schedules',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var transactionListType = new GraphQLObjectType({
  name: 'Transactions',
  description: 'Transactions',
  fields: () => ({
    transactions: {
      type: new GraphQLList(transactionType),
      description: 'The transactions',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var sessionListType = new GraphQLObjectType({
  name: 'Sessions',
  description: 'Sessions',
  fields: () => ({
    sessions: {
      type: new GraphQLList(sessionType),
      description: 'The sessions',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var campaignListType = new GraphQLObjectType({
  name: 'Campaigns',
  description: 'Campaigns',
  fields: () => ({
    campaigns: {
      type: new GraphQLList(campaignType),
      description: 'The campaigns',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});


var paginationType = new GraphQLObjectType({
	name: 'Pagination',
	description: 'Pagination Assets',
	fields: () => ({
		count: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The number of records returned by the query.',
		},
		end_cursor: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The end cursor of the paginated results.',
		},
		has_next_page: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Boolean that represents whether or not the query has more records available.',
		}
	}),
	interfaces: []
});

var accessKeyType = new GraphQLObjectType({
  name: 'AccessKey',
  description: 'A accesskey.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the product.',
    },
    access_key: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The access_key of the accesskey.',
    },
    secret_key: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The secret_key of the accesskey.',
    }
  }),
  interfaces: []
});

var userType = new GraphQLObjectType({
  name: 'User',
  description: 'A user.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the user',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the user',
    },
    auth0_id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The auth0_id of the user.',
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email of the user',
    },
    active: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The active status of the user',
    },
    accesskey: {
      type: accessKeyType,
      description: 'The access_key of the user.',
      resolve: (user) => {
      	var id = user.access_key_id
      	return userController.getAccessKeyByID(id);
      }
    }
  }),
  interfaces: []
});

var affiliateType = new GraphQLObjectType({
  name: 'Affiliate',
  description: 'A affiliate.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the product.',
    },
    affiliate_id: {
      type: new GraphQLNonNull(GraphQLString),
      description: '.',
    },
    sub_id_1: {
      type: new GraphQLNonNull(GraphQLString),
      description: '.',
    },
    sub_id_2: {
      type: new GraphQLNonNull(GraphQLString),
      description: '.',
    },
    sub_id_3: {
      type: new GraphQLNonNull(GraphQLString),
      description: '.',
    },
    sub_id_4: {
      type: new GraphQLNonNull(GraphQLString),
      description: '.',
    },
    sub_id_5: {
      type: new GraphQLNonNull(GraphQLString),
      description: '.',
    },
    click_id: {
      type: new GraphQLNonNull(GraphQLString),
      description: '.',
    }
  }),
  interfaces: []
});

var customerType = new GraphQLObjectType({
  name: 'Customer',
  description: 'A customer.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the customer.',
    },
    firstname: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The firstname of the customer.',
    },
    lastname: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The lastname of the customer.',
    },
    phone: {
      type: GraphQLString,
      description: 'The phone number of the customer.',
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the customer.',
    },
    address: {
      type: addressType,
      description: 'The customer\'s shipping address.',
      resolve: customer => customerController.getAddress(customer),
    },
    creditcards: {
	  type: new GraphQLList(creditCardType),
      description:'The creditcards associated with the customer',
	  resolve: customer => customerController.getCreditCards(customer)
    }
  }),
  interfaces: [ customerInterface ]
});


var productScheduleType = new GraphQLObjectType({
  name: 'ProductSchedule',
  description: 'A product schedule.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of product schedule.',
    },
    schedule: {
	  type: new GraphQLList(scheduleType),
      description:'The schedules associated with the product schedule',
	  resolve: productschedule => productScheduleController.getSchedule(productschedule)
    }
  }),
  interfaces: []
});

var scheduleType = new GraphQLObjectType({
  name: 'schedule',
  description: 'A scheduled product.',
  fields: () => ({
    price: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The price of schedule.',
    },
    start: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The start of schedule.',
    },
    end: {
      type: GraphQLString,
      description: 'The end of schedule.',
    },
    period: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The period of schedule.',
    },
    product: {
	  type: productType,
      description:'The product associated with the schedule',
	  resolve: schedule => productScheduleController.getProduct(schedule)
    }
  }),
  interfaces: []
});

var merchantProviderType = new GraphQLObjectType({
  name: 'merchantprovider',
  description: 'A merchant provider.',
  fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the merchant provider instance.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the merchant provider instance.',
    },
    processor: {
      type: new GraphQLNonNull(merchantProviderProcessorsEnum),
      description: 'The processor',
    },
    username: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The end of schedule.',
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The period of schedule.',
    },
    endpoint: {
	  type: new GraphQLNonNull(GraphQLString),
      description:'The product associated with the schedule'
    }
  }),
  interfaces: []
});

var fulfillmentProviderType = new GraphQLObjectType({
  name: 'fulfillmentprovider',
  description: 'A fulfillment provider.',
  fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the fulfillment provider instance.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the fulfillment provider instance.',
    },
    provider: {
      type: new GraphQLNonNull(fulfillmentProviderProviderEnum),
      description: 'The provider.',
    },
    username: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The provider username.',
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The provider password.',
    },
    endpoint: {
	  type: new GraphQLNonNull(GraphQLString),
      description:'The provider endpoint.'
    }
  }),
  interfaces: []
});

var merchantProviderConfigurationType = new GraphQLObjectType({
  name: 'merchantproviderconfiguration',
  description: 'A merchant provider configuration.',
  fields: () => ({
  	distribution: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The distribution of the merchantprovider.',
    },
    merchantprovider: {
      type: new GraphQLNonNull(merchantProviderType),
      description: 'The merchant provider associated with the load balancer',
      resolve: merchantproviderconfiguration => loadBalancerController.getMerchantProviderConfiguration(merchantproviderconfiguration)
    }
  }),
  interfaces: []
});

var loadBalancerType = new GraphQLObjectType({
  name: 'loadbalancer',
  description: 'A loadbalancer.',
  fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the loadbalancer.',
    },
    merchantproviderconfigurations: {
      type: new GraphQLList(merchantProviderConfigurationType),
      description: 'The configured merchant providers associated with the load balancer',
      resolve: loadbalancer => loadBalancerController.getMerchantProviderConfigurations(loadbalancer)
    }
  }),
  interfaces: []
});

var campaignType = new GraphQLObjectType({
  name: 'campaign',
  description: 'A camapign.',
  fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the campaign.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the campaign.',
    },
    loadbalancer: {
      type: loadBalancerType,
      description: 'The loadbalancer for the campaign.',
      resolve: campaign => campaignController.getLoadBalancer(campaign)
    },
    productschedules: {
      type: new GraphQLList(productScheduleType),
      description: 'The configured product schedules associated with the campaign',
      resolve: campaign => campaignController.getProductSchedules(campaign)
    },
    emails: {
      type: new GraphQLList(emailType),
      descsription: 'Emails configured and associated with the campaign',
      resolve: campaign => campaignController.getEmails(campaign)
    }
  }),
  interfaces: []
});

var emailType = new GraphQLObjectType({
  name: 'email',
  description: 'A email object',
  fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email identifier.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email name.',
    },
    subject: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email subject.',
    },
    body: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email body.',
    },
    type: {
      type: new GraphQLNonNull(emailTypeEnum),
      description: 'The email type (see enumeration).',
    },
    smtp_provider: {
      type: new GraphQLNonNull(SMTPProviderType),
      description: 'The SMTP Provider for the email.',
      resolve: email => emailController.getSMTPProvider(email)
    }
  }),
  interfaces: []
});

var SMTPProviderType = new GraphQLObjectType({
  name: 'SMTP',
  description: 'A SMTP Provider',
  fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The SMTP Provider identifier.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the SMTP Provider.',
    },
    hostname: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The hostname of the SMTP Provider.',
    },
    ip_address: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ip_address of the SMTP Provider.',
    },
    username: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A username associated with the SMTP Provider.',
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The password associated with the username.',
    },
    port: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The SMTP port for the the SMTP Provider',
    }
  }),
  interfaces: []
});

var priceType = new GraphQLObjectType({
  name: 'Price',
  description: 'A price object',
  fields: () => ({
    straight: {
      type: GraphQLString,
      description: 'The straight sale price.',
    },
    trial: {
      type: GraphQLString,
      description: 'The trial price',
    }
  }),
  interfaces: []
});

var recurringType = new GraphQLObjectType({
  name: 'Recurring',
  description: 'A recurring details object',
  fields: () => ({
    period: {
      type: GraphQLString,
      description: 'The period in days for rebilling.',
    },
    price: {
      type: GraphQLString,
      description: 'The rebilling price.',
    }
  }),
  interfaces: []
});

var creditCardType = new GraphQLObjectType({
  name: 'CreditCard',
  description: 'A creditcard',
  fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The creditcard id',
    },
    ccnumber: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The creditcard number',
    },
    expiration: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The creditcard expiration date.',
    },
    ccv: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The creditcard ccv.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The creditcard name.',
    },
    address: {
      type: addressType,
      description: 'The customer\'s shipping address.',
      resolve: creditcard => creditCardController.getAddress(creditcard),
    }
  }),
  interfaces: []
});

var addressType = new GraphQLObjectType({
  name: 'Address',
  description: 'A address',
  fields: () => ({
    line1: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The first line of the address.',
    },
    line2: {
      type: GraphQLString,
      description: 'The second line of the address',
    },
    city: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The City of the address.',
    },
    state: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The State of the address.',
    },
	zip: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ZIP code of the address.',
    },
    country: {
      type: GraphQLString,
      description: 'The country code of the address.',
    },
  }),
  interfaces: []
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
  	transaction: {
      type: transactionType,
      args: {
        id: {
          description: 'id of the transaction',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, transaction){
      	var id = transaction.id; 
      	return transactionController.getTransaction(id);
      }
    },
    rebill: {
      type: rebillType,
      args: {
        id: {
          description: 'id of the rebill',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, rebill){
      	var id = rebill.id; 
      	return rebillController.getRebill(id);
      }
    },
    session: {
      type: sessionType,
      args: {
        id: {
          description: 'id of the session',
          type: GraphQLString
        }
      },
      resolve: function(root, session){
      	var id = session.id; 
      	return sessionController.getSession(id);
      }
    },
    customer: {
      type: customerType,
      args: {
        id: {
          description: 'id of the customer',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, customer){
      	var id = customer.id; 
      	return customerController.getCustomer(id);
      }
    },
    product: {
      type: productType,
      args: {
        id: {
          description: 'id of the product',
          type: GraphQLString
        }
      },
      resolve: function(root, product){
		var id = product.id; 
      	return productController.get(id);
      }
    },
    
     email: {
      type: emailType,
      args: {
        id: {
          description: 'id of the email',
          type: GraphQLString
        }
      },
      resolve: function(root, email){
		var id = email.id; 
      	return emailController.getEmail(id);
      }
    },
    
    smtpprovider: {
      type: SMTPProviderType,
      args: {
        id: {
          description: 'id of the SMTP Provider',
          type: GraphQLString
        }
      },
      resolve: function(root, smtpprovider){
		var id = smtpprovider.id; 
      	return SMTPProviderController.get(id);
      }
    },
    
    emaillist: {
      type: emailListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, emails){
		var cursor = emails.cursor; 
		var limit = emails.limit; 
      	return emailController.listEmails(cursor, limit);
      }
    },
    
    smtpproviderlist: {
      type: SMTPProviderListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, smtpproviders){
		var cursor = smtpproviders.cursor; 
		var limit = smtpproviders.limit; 
      	return SMTPProviderController.list(cursor, limit);
      }
    },
	
    productlist: {
      type: productListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, products){
		var cursor = products.cursor; 
		var limit = products.limit; 
      	return productController.list(cursor, limit);
      }
    },
    
    userlist: {
      type: userListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, user){
		var cursor = user.cursor; 
		var limit = user.limit; 
      	return userController.list(cursor, limit);
      }
    },
    
    rebilllist: {
      type: rebillListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, rebill){
		var cursor = rebill.cursor; 
		var limit = rebill.limit; 
      	return rebillController.listRebills(cursor, limit);
      }
    },
    
    affiliatelist: {
      type: affiliateListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, affiliate){
		var cursor = affiliate.cursor; 
		var limit = affiliate.limit; 
      	return affiliateController.list(cursor, limit);
      }
    },
    
    creditcardlist: {
      type: creditCardListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, creditcard){
		var cursor = creditcard.cursor; 
		var limit = creditcard.limit; 
      	return creditCardController.listCreditCards(cursor, limit);
      }
    },
    
    merchantproviderlist: {
      type: merchantProviderListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, merchantprovider){
		var cursor = merchantprovider.cursor; 
		var limit = merchantprovider.limit; 
      	return merchantProviderController.list(cursor, limit);
      }
    },
    
     fulfillmentproviderlist: {
      type: fulfillmentProviderListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, fulfillmentprovider){
		var cursor = fulfillmentprovider.cursor; 
		var limit = fulfillmentprovider.limit; 
      	return fulfillmentProviderController.listFulfillmentProviders(cursor, limit);
      }
    },
    
    accesskeylist: {
      type: accessKeyListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, accesskey){
		var cursor = accesskey.cursor; 
		var limit = accesskey.limit; 
      	return accessKeyController.list(cursor, limit);
      }
    },
    
    customerlist: {
      type: customerListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, customer){
		var cursor = customer.cursor; 
		var limit = customer.limit; 
      	return customerController.listCustomers(cursor, limit);
      }
    },
    
    loadbalancerlist: {
      type: loadBalancerListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, loadbalancer){
		var cursor = loadbalancer.cursor; 
		var limit = loadbalancer.limit; 
      	return loadBalancerController.listLoadBalancers(cursor, limit);
      }
    },
    
    productschedulelist: {
      type: productScheduleListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, productschedule){
		var cursor = productschedule.cursor; 
		var limit = productschedule.limit; 
      	return productScheduleController.listProductSchedules(cursor, limit);
      }
    },
    
    transactionlist: {
      type: transactionListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, transaction){
		var cursor = transaction.cursor; 
		var limit = transaction.limit; 
      	return transactionController.listTransactions(cursor, limit);
      }
    },
    
    campaignlist: {
      type: campaignListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, campaign){
		var cursor = campaign.cursor; 
		var limit = campaign.limit; 
      	return campaignController.listCampaigns(cursor, limit);
      }
    },
    
	sessionlist: {
      type: sessionListType,
      args: {
        limit: {
          description: 'limit',
          type: GraphQLString
        },
        cursor: {
          description: 'cursor',
          type: GraphQLString
        }
      },
      resolve: function(root, session){
		var cursor = session.cursor; 
		var limit = session.limit; 
      	return sessionController.listSessions(cursor, limit);
      }
    },
    
    productschedule: {
      type: productScheduleType,
      args: {
        id: {
          description: 'id of the productschedule',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, productschedule){
      	var id = productschedule.id; 
      	return productScheduleController.getProductSchedule(id);
      }
    },
    
    merchantprovider: {
      type: merchantProviderType,
      args: {
        id: {
          description: 'id of the merchantprovider',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, merchantprovider){
      	var id = merchantprovider.id; 
      	return merchantProviderController.get(id);
      }
    },
    
    fulfillmentprovider: {
      type: fulfillmentProviderType,
      args: {
        id: {
          description: 'id of the fulfillmentprovider',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, fulfillmentprovider){
      	var id = fulfillmentprovider.id; 
      	return fulfillmentProviderController.getFulfillmentProvider(id);
      }
    },
    
    loadbalancer: {
      type: loadBalancerType,
      args: {
        id: {
          description: 'id of the loadbalancer',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, loadbalancer){
      	var id = loadbalancer.id; 
      	return loadBalancerController.getLoadBalancer(id);
      }
    },
    creditcard: {
      type: creditCardType,
      args: {
        id: {
          description: 'id of the creditcard',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, creditcard){
      	var id = creditcard.id; 
      	return creditCardController.getCreditCard(id);
      }
    },
    campaign: {
      type: campaignType,
      args: {
        id: {
          description: 'id of the campaign',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, campaign){
      	var id = campaign.id; 
      	return campaignController.getCampaign(id);
      }
    },
    affiliate: {
      type: affiliateType,
      args: {
        id: {
          description: 'id of the affiliate',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, affiliate){
      	var id = affiliate.id; 
      	return affiliateController.get(id);
      }
    },
    accesskey: {
      type: accessKeyType,
      args: {
        id: {
          description: 'id of the accesskey',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, accesskey){
      	var id = accesskey.id; 
      	return accessKeyController.get(id);
      }
    },
    user: {
      type: userType,
      args: {
        id: {
          description: 'id of the user',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, user){
      	var id = user.id; 
      	return userController.get(id);
      }
    }
    
  })
});

const productInputType = new GraphQLInputObjectType({
  name: 'ProductInput',
  fields: () => ({
    id:		{ type: new GraphQLNonNull(GraphQLString) },
    name:	{ type: new GraphQLNonNull(GraphQLString) },
    sku:	{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const userInputType = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: () => ({
    id:			{ type: new GraphQLNonNull(GraphQLString) },
    name:		{ type: new GraphQLNonNull(GraphQLString) },
    auth0_id:	{ type: new GraphQLNonNull(GraphQLString) },
    email:		{ type: new GraphQLNonNull(GraphQLString) },
    active: 	{ type: new GraphQLNonNull(GraphQLString) }
  })
});
        
const accessKeyInputType = new GraphQLInputObjectType({
  name: 'AccessKeyInput',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    access_key:			{ type: new GraphQLNonNull(GraphQLString) },
    secret_key:			{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const affiliateInputType = new GraphQLInputObjectType({
  name: 'AffiliateInput',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    affiliate_id:		{ type: new GraphQLNonNull(GraphQLString) },
    sub_id_1:			{ type: new GraphQLNonNull(GraphQLString) },
    sub_id_2:			{ type: new GraphQLNonNull(GraphQLString) },
    sub_id_3:			{ type: new GraphQLNonNull(GraphQLString) },
    sub_id_4:			{ type: new GraphQLNonNull(GraphQLString) },
    sub_id_5:			{ type: new GraphQLNonNull(GraphQLString) },
    click_id:			{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const SMTPProviderInputType = new GraphQLInputObjectType({
  name: 'SMTPProviderInput',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    name:				{ type: new GraphQLNonNull(GraphQLString) },
    hostname:			{ type: new GraphQLNonNull(GraphQLString) },
    ip_address:			{ type: new GraphQLNonNull(GraphQLString) },
    username:			{ type: new GraphQLNonNull(GraphQLString) },
    password:			{ type: new GraphQLNonNull(GraphQLString) },
    port:				{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const merchantProviderInputType = new GraphQLInputObjectType({
  name: 'MerchantProviderInput',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    name:				{ type: new GraphQLNonNull(GraphQLString) },
    username:			{ type: new GraphQLNonNull(GraphQLString) },
    password:			{ type: new GraphQLNonNull(GraphQLString) },
    endpoint:			{ type: new GraphQLNonNull(GraphQLString) },
    processor:			{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const deleteOutputType = new GraphQLObjectType({
  name: 'deleteOutput',
  fields: () => ({
    id:	{ type: new GraphQLNonNull(GraphQLString) }
  })
});

var mutationType = new GraphQLObjectType({
	name: 'Mutation',
	fields: () => ({
		createuser:{
			type: userType,
			description: 'Adds a new user.',
			args: {
				user: { type: userInputType }
			},
			resolve: (value, user) => {
				return userController.create(user.user);
			}
		},
		updateuser:{
			type: userType,
			description: 'Updates a user.',
			args: {
				user: { type: userInputType }
			},
			resolve: (value, user) => {
				return userController.update(user.user);
			}
		},
		deleteuser:{
			type: deleteOutputType,
			description: 'Deletes a user.',
			args: {
				id: {
				  description: 'id of the user',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, user) => {
				var id = user.id;
				return userController.delete(id);
			}
		},
		createproduct:{
			type: productType,
			description: 'Adds a new product.',
			args: {
				product: { type: productInputType }
			},
			resolve: (value, product) => {
				return productController.create(product.product);
			}
		},
		updateproduct:{
			type: productType,
			description: 'Updates a product.',
			args: {
				product: { type: productInputType }
			},
			resolve: (value, product) => {
				return productController.update(product.product);
			}
		},
		deleteproduct:{
			type: deleteOutputType,
			description: 'Deletes a product.',
			args: {
				id: {
				  description: 'id of the product',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, product) => {
				var id = product.id;
				return productController.delete(id);
			}
		},
		createaccesskey:{
			type: accessKeyType,
			description: 'Adds a new accesskey.',
			args: {
				accesskey: { type: accessKeyInputType }
			},
			resolve: (value, accesskey) => {
				return accessKeyController.create(accesskey.accesskey);
			}
		},
		updateaccesskey:{
			type: accessKeyType,
			description: 'Updates a accesskey.',
			args: {
				accesskey: { type: accessKeyInputType }
			},
			resolve: (value, accesskey) => {
				return accessKeyController.update(accesskey.accesskey);
			}
		},
		deleteaccesskey:{
			type: deleteOutputType,
			description: 'Deletes a accesskey.',
			args: {
				id: {
				  description: 'id of the accesskey',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, accesskey) => {
				var id = accesskey.id;
				return accessKeyController.delete(id);
			}
		},
		createaffiliate:{
			type: affiliateType,
			description: 'Adds a new affiliate.',
			args: {
				affiliate: { type: affiliateInputType }
			},
			resolve: (value, affiliate) => {
				return affiliateController.create(affiliate.affiliate);
			}
		},
		updateaffiliate:{
			type: affiliateType,
			description: 'Updates a affiliate.',
			args: {
				affiliate: { type: affiliateInputType }
			},
			resolve: (value, affiliate) => {
				return affiliateController.update(affiliate.affiliate);
			}
		},
		deleteaffiliate:{
			type: deleteOutputType,
			description: 'Deletes a affiliate.',
			args: {
				id: {
				  description: 'id of the affiliate',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, affiliate) => {
				var id = affiliate.id;
				return affiliateController.delete(id);
			}
		},
		createsmtpprovider:{
			type: SMTPProviderType,
			description: 'Adds a new SMTP Provider.',
			args: {
				smtpprovider: { type: SMTPProviderInputType }
			},
			resolve: (value, smtpprovider) => {
				return SMTPProviderController.create(smtpprovider.smtpprovider);
			}
		},
		updatesmtpprovider:{
			type: SMTPProviderType,
			description: 'Updates a SMTP Provider.',
			args: {
				smtpprovider: { type: SMTPProviderInputType }
			},
			resolve: (value, smtpprovider) => {
				return SMTPProviderController.update(smtpprovider.smtpprovider);
			}
		},
		deletesmtpprovider:{
			type: deleteOutputType,
			description: 'Deletes a SMTP Provider.',
			args: {
				id: {
				  description: 'id of the smtpprovider',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, smtpprovider) => {
				var id = smtpprovider.id;
				return SMTPProviderController.delete(id);
			}
		},
		createmerchantprovider:{
			type: merchantProviderType,
			description: 'Adds a new Merchant Provider.',
			args: {
				merchantprovider: { type: merchantProviderInputType }
			},
			resolve: (value, merchantprovider) => {
				return merchantProviderController.create(merchantprovider.merchantprovider);
			}
		},
		updatemerchantprovider:{
			type: merchantProviderType,
			description: 'Updates a Merchant Provider.',
			args: {
				merchantprovider: { type: merchantProviderInputType }
			},
			resolve: (value, merchantprovider) => {
				return merchantProviderController.update(merchantprovider.merchantprovider);
			}
		},
		deletemerchantprovider:{
			type: deleteOutputType,
			description: 'Deletes a Merchant Provider.',
			args: {
				id: {
				  description: 'id of the merchantprovider',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, merchantprovider) => {
				var id = merchantprovider.id;
				return merchantProviderController.delete(id);
			}
		}
	})
});

var SixSchema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
  types: []
});

module.exports = SixSchema;