'use strict';
var GraphQLEnumType = require('graphql').GraphQLEnumType;
var GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLString = require('graphql').GraphQLString;

var sessionController = require('../../controllers/Session.js');
var productController = require('../../controllers/Product.js');
var customerController = require('../../controllers/Customer.js');
var transactionController = require('../../controllers/Transaction.js');
var creditCardController = require('../../controllers/CreditCard.js');
var productScheduleController = require('../../controllers/ProductSchedule.js');
var merchantProviderController = require('../../controllers/MerchantProvider.js');
var loadBalancerController = require('../../controllers/LoadBalancer.js');

const merchantProviderProcessorsEnum = new GraphQLEnumType({
  name: 'MerchantProviderProcessors',
  description: 'Whitelisted Merchant Provider Processors',
  values: {
    NMI: {
      value: 'NMI'
    }
  }
});

var productTypeEnum = new GraphQLEnumType({
  name: 'ProductType',
  description: 'Types of products for sale',
  values: {
    STRAIGHT: {
      value: 'straight',
      description: 'One time transaction.',
    },
    TRIAL: {
      value: 'trial',
      description: 'One time transaction with rebilling.',
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
      description: 'The id of the product.',
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
    products: {
      type: new GraphQLList(productInterface),
      description: 'The products associated with the session',
      resolve: session => sessionController.getProducts(session),
    },
    transactions: {
      type: new GraphQLList(transactionType),
      description: 'The transactions associated with the session',
      resolve: function(session){
      	 return sessionController.getTransactions(session.id);
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
    date: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The date of the transaction.',
    },
    parentsession: {
      type: sessionType,
      description: 'The session associated with the transaction.',
      resolve: transaction => transactionController.getParentSession(transaction),
    },
    processor_response: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The date of the transaction.',
    },
    products: {
      type: new GraphQLList(productInterface),
      description:
        'The products associated with the transaction',
      resolve: transaction => transactionController.getProducts(transaction),
    },
  }),
  interfaces: [transactionInterface]
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
    }
  }),
  interfaces: [ productInterface ]
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
    session: {
      type: sessionType,
      args: {
        id: {
          description: 'id of the session',
          type: new GraphQLNonNull(GraphQLString)
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
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, product){
      	var id = product.id; 
      	return productController.getProduct(id);
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
      	return merchantProviderController.getMerchantProvider(id);
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
    }
    
  })
});

var SixSchema = new GraphQLSchema({
  query: queryType,
  types: [ sessionType, productType, customerType ]
});

module.exports = SixSchema;