'use strict';
var GraphQLEnumType = require('graphql').GraphQLEnumType;
var GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLString = require('graphql').GraphQLString;

var sessionController = require('./controllers/Session.js');
var productController = require('./controllers/Product.js');
var customerController = require('./controllers/Customer.js');
var transactionController = require('./controllers/Transaction.js');


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
    type: {
      type: GraphQLString,
      description: 'The type of the product.',
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
      description:
        'The products associated with the session',
      resolve: session => sessionController.getProducts(session),
    },
    transactions: {
      type: new GraphQLList(transactionType),
      description:
        'The transactions associated with the session',
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
      type: new GraphQLNonNull(GraphQLString),
      description: 'The date of the transaction.',
    },
    processor_response: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The date of the transaction.',
    }
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
    completed: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A boolean string denoting that that session has otherwise been completed or expired.',
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'What kind of a product it is.',
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
    }
  }),
  interfaces: [ customerInterface ]
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
  }),
  interfaces: []
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
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
    }
  })
});

var SixSchema = new GraphQLSchema({
  query: queryType,
  types: [ sessionType, productType, customerType ]
});

module.exports = SixSchema;