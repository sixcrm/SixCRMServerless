'use strict';
/* eslint-disable no-unused-vars */
//Technical Debt:  This script is enormous.  Refactor.
var _  = require('underscore');

var GraphQLEnumType = require('graphql').GraphQLEnumType;
var GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLInt = require('graphql').GraphQLInt;
var GraphQLFloat = require('graphql').GraphQLFloat;
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
var userACLController = require('../../controllers/UserACL.js');
var emailTemplateController = require('../../controllers/EmailTemplate.js');
var SMTPProviderController = require('../../controllers/SMTPProvider.js');
var shippingReceiptController = require('../../controllers/ShippingReceipt.js');
var accountController = require('../../controllers/Account.js');
var roleController = require('../../controllers/Role.js');
const searchController = require('../../controllers/endpoints/search.js');
const suggestController = require('../../controllers/endpoints/suggest.js');
const notificationController = require('../../controllers/Notification');

const emailTemplateTypeEnum = new GraphQLEnumType({
	name: 'EmailTemplateTypeEnumeration',
	description:  'The various email template types.',
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

//this is trash?
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
      	 return sessionController.getRebills(session);
      }
    },
    campaign: {
      type: campaignType,
      description: 'The campaign associated with the session',
      resolve: function(session){
      	return sessionController.getCampaign(session);
      }
    }
  }),
  interfaces: [sessionInterface]
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

var emailTemplateListType = new GraphQLObjectType({
  name: 'EmailTemplates',
  description: 'Email tempates for use.',
  fields: () => ({
    emailtemplates: {
      type: new GraphQLList(emailTemplateType),
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
      description: 'The SMTP providers',
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

var shippingReceiptListType = new GraphQLObjectType({
  name: 'ShippingReceipts',
  description: 'Receipts from shipping',
  fields: () => ({
    shippingreceipts: {
      type: new GraphQLList(shippingReceiptType),
      description: 'The shipping receipts',
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

var userACLListType = new GraphQLObjectType({
  name: 'UserACLs',
  description: 'User ACLs.',
  fields: () => ({
    useracls: {
      type: new GraphQLList(userACLType),
      description: 'The acls',
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
      type: paginationType,
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var accountListType = new GraphQLObjectType({
  name: 'Accounts',
  description: 'Accounts',
  fields: () => ({
    accounts: {
      type: new GraphQLList(accountType),
      description: 'The accounts',
    },
    pagination: {
      type: new GraphQLNonNull(paginationType),
      description: 'Query pagination',
    }
  }),
  interfaces: []
});

var roleListType = new GraphQLObjectType({
  name: 'Roles',
  description: 'Roles',
  fields: () => ({
    roles: {
      type: new GraphQLList(roleType),
      description: 'The roles',
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
      description: 'The id of the accesskey.',
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

var accountType = new GraphQLObjectType({
  name: 'Account',
  description: 'A account.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the account.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the account.',
    },
    active: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The active status of the account.',
    }
  }),
  interfaces: []
});

var roleType = new GraphQLObjectType({
  name: 'Role',
  description: 'A role.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the role.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the role.',
    },
    active: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The active status of the role.',
    },
    permissions:{
      type: new GraphQLNonNull(permissionsType),
      description: 'The permsissions associated with the role.',
      resolve: role => roleController.getPermissions(role)
    }
  }),
  interfaces: []
});

var notificationCountType = new GraphQLObjectType({
    name: 'NotificationCount',
    description: 'Number of unseen notifications.',
    fields: () => ({
        count: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Number of unseen notifications.',
        }
    }),
    interfaces: []
});

var notificationListType = new GraphQLObjectType({
    name: 'NotificationList',
    description: 'Notifications.',
    fields: () => ({
        notifications: {
            type: new GraphQLList(notificationType),
            description: 'Notifications.',
        }
    }),
    interfaces: []
});

var notificationType = new GraphQLObjectType({
    name: 'Notification',
    description: 'A notification.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the notification.',
        },
        user: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the user who is an owner of the notification.',
        },
        account: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the account notification is associated with.',
        },
        type: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The type of the notification.',
        },
        action: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The action associated with the notification.',
        },
        message: {
            type: GraphQLString,
            description: 'Notification message.'
        },
        created: {
            type: GraphQLString,
            description: 'Time at which the notification was created.',
        },
        read: {
            type: GraphQLString,
            description: 'Time at which the user has read the notification.',
        }
    }),
    interfaces: []
});

var permissionsType = new GraphQLObjectType({
  name: 'Permissions',
  description: 'A role permissions object.',
  fields: () => ({
    allow: {
      type: new GraphQLList(GraphQLString),
      description: 'A permissions list',
    },
    deny: {
      type: new GraphQLList(GraphQLString),
      description: 'A permissions list',
    }
  }),
  interfaces: []
});

var userACLType = new GraphQLObjectType({
  name: 'UserACL',
  description: 'A user access control list object.',
  fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the role.',
    },
    user:{
      type: new GraphQLNonNull(userType),
      description: 'The user related to user ACL object',
      resolve: (user_acl) => {
        return userACLController.getUser(user_acl);
      }
    },
  	account:{
      type: new GraphQLNonNull(accountType),
      description: 'The account related to user ACL object',
      resolve: (user_acl) => {
      	return userACLController.getAccount(user_acl);
      }
    },
    role:{
      type: new GraphQLNonNull(roleType),
      description: 'The role related to user ACL object',
      resolve: (user_acl) => {
      	return userACLController.getRole(user_acl);
      }
    }
  })
});

var userInviteType = new GraphQLObjectType({
  name: 'UserInvite',
  description: 'A user unvite.',
  fields: () => ({
    link: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the user',
    }
  })
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
      type: GraphQLString,
      description: 'The auth0_id of the user.',
    },
    active: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The active status of the user',
    },
    termsandconditions:{
	  type: GraphQLString,
      description: 'The accepted Terms and Conditions version.',
    },
    acl:{
      type: new GraphQLList(userACLType),
      description: 'The user\'s ACL objects.',
      resolve: (user) => userController.getACL(user)
    },
    accesskey: {
      type: accessKeyType,
      description: 'The access_key of the user.',
      resolve: (user) => {
      	if(_.has(user, 'access_key_id')){
      		var id = user.access_key_id
      		return userController.getAccessKey(id);
      	}else{
      		return null;
      	}	
      }
    },
    address: {
      type: addressType,
      description: 'The address of the user.',
      resolve: (user) => {
      	return userController.getAddress(user);
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
    name: {
      type: GraphQLString,
      description: 'The name of product schedule.',
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

var transactionProductType = new GraphQLObjectType({
  name: 'transactionproduct',
  description: 'A product associated with a transaction.',
  fields: () => ({
    amount: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The amount of the product.',
    },
    product: {
      type: productType,
      description: 'The product.',
      resolve: function(transactionproduct){
      	return transactionController.getProduct(transactionproduct.product);
      }
    },
    shippingreceipt: {
	  type: shippingReceiptType,
	  description: 'A shipping receipt associated with the transaction product.',
	  resolve: function(transactionproduct){
		if(!_.has(transactionproduct, "shippingreceipt")){ return null; }
	    return shippingReceiptController.get(transactionproduct.shippingreceipt);	    
	  }
    }
  }),
  interfaces: []
});

var shippingReceiptType = new GraphQLObjectType({
  name: 'shippingreceipt',
  description: 'A shipping receipt.',
  fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the shipping receipt.',
    },
    created: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A timestamp when the receipt is generated.',
    },
    status: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A shipping status',
    },
    modified: {
      type: GraphQLString,
      description: 'A timestamp when the receipt is generated.',
    },
    trackingnumber: {
      type: GraphQLString,
      description: 'A tracking number for the shipment',
    },
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
      type: merchantProviderType,
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

var transactionType = new GraphQLObjectType({
  name: 'Transaction',
  description: 'A record denoting transactions.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the transaction.',
    },
    alias: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The alias of the transaction.',
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
	  type: rebillType,
      description: 'The rebill of the transaction.',
      resolve: transaction => transactionController.getParentRebill(transaction)
    },
    products: {
	  type: new GraphQLList(transactionProductType),
	  description: 'Products associated with the transaction',
	  resolve: transaction => transactionController.getTransactionProducts(transaction)
    }
  }),
  interfaces: [transactionInterface]
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
    emailtemplates: {
      type: new GraphQLList(emailTemplateType),
      descsription: 'Email templates configured and associated with the campaign',
      resolve: campaign => campaignController.getEmailTemplates(campaign)
    }
  }),
  interfaces: []
});

var emailTemplateType = new GraphQLObjectType({
  name: 'emailtemplate',
  description: 'A email template object',
  fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email template identifier.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email template name.',
    },
    subject: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email subject.',
    },
    body: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email template body.',
    },
    type: {
      type: new GraphQLNonNull(emailTemplateTypeEnum),
      description: 'The email template type (see enumeration).',
    },
    smtp_provider: {
      type: SMTPProviderType,
      description: 'The SMTP Provider for the email template.',
      resolve: emailtemplate => emailTemplateController.getSMTPProvider(emailtemplate)
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

//Techincal Debt:  This seems deprecated
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
      type: new GraphQLNonNull(GraphQLString),
      description: 'The country code of the address.',
    },
  }),
  interfaces: []
});

/* 
* Search Results 
*/

const searchInputType = new GraphQLInputObjectType({
  name: 'SearchInput',
  fields: () => ({
    query:					{ type: new GraphQLNonNull(GraphQLString) },
    cursor:					{ type: GraphQLString },
    expr:					{ type: GraphQLString },
    facet:					{ type: GraphQLString },
    filterQuery: 			{ type: GraphQLString },
    highlight: 				{ type: GraphQLString },
	partial: 				{ type: GraphQLString },
	queryOptions:			{ type: GraphQLString },
  	queryParser: 			{ type: GraphQLString },
	return: 				{ type: GraphQLString },
	size: 					{ type: GraphQLString },
	sort: 					{ type: GraphQLString },
	start: 					{ type: GraphQLString },
	stats: 					{ type: GraphQLString }
  })
});
            
var searchResultsType = new GraphQLObjectType({
  name: 'SearchResults',
  description: 'Search Results.',
  fields: () => ({
    status: {
      type: new GraphQLNonNull(searchStatusType),
      description: 'Search Result Status',
    },
    hits: {
      type: new GraphQLNonNull(searchHitsType),
      description: 'Search Result Hits',
    },
    facets: {
      type: GraphQLString,
      description: 'Search Result Faceting'
    }
  }),
  interfaces: []
});


var searchStatusType = new GraphQLObjectType({
  name: 'SearchStatus',
  description: 'Search Result Hits.',
  fields: () => ({
    timems: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Microsecond result time.',
    },
    rid: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The result ID.',
    }
  }),
  interfaces: []
});

var searchHitsType = new GraphQLObjectType({
  name: 'SearchResultHits',
  description: 'Search Result Hits.',
  fields: () => ({
    found: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Search Result Found',
    },
    start: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Search Result Start',
    },
    hit: {
      type: new GraphQLList(searchHitType),
      description: 'Search Result Hit'
    }
  }),
  interfaces: []
});
						
var searchHitType = new GraphQLObjectType({
  name: 'SearchResultHit',
  description: 'Search Result Hit.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Search Result ID',
    },
    fields: {
    	type: GraphQLString,
    	description: 'Search Result fields.'
    }
  }),
  interfaces: []
});

//Note:  These are exactly what's present in the CloudSearch implementation
/*
var searchResultFieldsType = new GraphQLObjectType({
  name: 'SearchResultFields',
  description: 'Search Result Fields.',
  fields: () => ({
	entity_type: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Search Result ID',
    },
    account: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    active: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    address: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    alias: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    amount: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    email: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    first_six: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    firstname: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    last_four: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    lastname: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    name: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    phone: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    sku: {
      type: GraphQLString,
      description: 'Search Result ID',
    },
    tracking_number: {
      type: GraphQLString,
      description: 'Search Result ID',
    }
  }),
  interfaces: []
});
*/

/* 
* Search Suggester 
*/

const suggestInputType = new GraphQLInputObjectType({
  name: 'SuggestInput',
  fields: () => ({
    query:					{ type: new GraphQLNonNull(GraphQLString) },
    suggester:				{ type: new GraphQLNonNull(GraphQLString) },
    size:					{ type: GraphQLString }
  })
});

var suggestResultsType = new GraphQLObjectType({
  name: 'SuggestResults',
  description: 'Suggest Results.',
  fields: () => ({
    status: {
      type: new GraphQLNonNull(searchStatusType),
      description: 'Search Result Status',
    },
    suggest: {
      type: new GraphQLNonNull(suggestTopLevelResultsType),
      description: 'Search Result Hits',
    }
  }),
  interfaces: []
});

var suggestTopLevelResultsType = new GraphQLObjectType({
  name: 'SuggestTopLevelResults',
  description: 'Suggest Top Level Results.',
  fields: () => ({
    query: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Suggest Query',
    },
    found: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of Search Results found that match the suggestion query',
    },
    suggestions: {
      type: new GraphQLList(suggestionType),
      description: 'The suggestions associated with the query',
    }
  }),
  interfaces: []
});

var suggestionType = new GraphQLObjectType({
  name: 'Suggestion',
  description: 'A Suggestion.',
  fields: () => ({
    suggestion: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The suggestion string',
    },
    score: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of Search Results found that match the suggestion query',
    },
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id associated with the suggestion.',
    }
  }),
  interfaces: []
});


var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
  	search:{
  	  type: searchResultsType,
	  description: 'Executes a search query.',
	  args: {
	    search: { type: searchInputType }
	  },
	  resolve: function(root, search){
		return searchController.search(search.search); 
	  }
  	},
  	suggest:{
  	  type: suggestResultsType,
  	  description: 'Retrieves string suggestions.',
	  args: {
	    suggest: { type: suggestInputType }
	  },
	  resolve: function(root, suggest){
		return suggestController.suggest(suggest.suggest); 
	  }
  	},
  	userintrospection:{
  	  type: userType,
	  resolve: function(root, user){
		return userController.introspection(); 
	  }
  	},
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
      	return transactionController.get(id);
      }
    },
    shippingreceipt: {
      type: shippingReceiptType,
      args: {
        id: {
          description: 'id of the shipping receipt',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, shippingreceipt){
      	var id = shippingreceipt.id; 
      	return shippingReceiptController.get(id);
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
      	return rebillController.get(id);
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
      	return sessionController.get(id);
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
      	return customerController.get(id);
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
    
     emailtemplate: {
      type: emailTemplateType,
      args: {
        id: {
          description: 'id of the email template',
          type: GraphQLString
        }
      },
      resolve: function(root, emailtemplate){
		var id = emailtemplate.id; 
      	return emailTemplateController.get(id);
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
    
    emailtemplatelist: {
      type: emailTemplateListType,
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
      resolve: function(root, emailtemplates){
		var cursor = emailtemplates.cursor; 
		var limit = emailtemplates.limit; 
      	return emailTemplateController.list(cursor, limit);
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
    
    useracllist: {
      type: userACLListType,
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
      resolve: function(root, useracl){
		var cursor = useracl.cursor; 
		var limit = useracl.limit; 
      	return userACLController.list(cursor, limit);
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
      	return rebillController.list(cursor, limit);
      }
    },
    
    shippingreceiptlist: {
      type: shippingReceiptListType,
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
      resolve: function(root, shippingreceipt){
		var cursor = shippingreceipt.cursor; 
		var limit = shippingreceipt.limit; 
      	return shippingReceiptController.list(cursor, limit);
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
      	return creditCardController.list(cursor, limit);
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
      	return fulfillmentProviderController.list(cursor, limit);
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
    
    accountlist: {
      type: accountListType,
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
      resolve: function(root, account){
		var cursor = account.cursor; 
		var limit = account.limit; 
      	return accountController.list(cursor, limit);
      }
    },
    
    rolelist: {
      type: roleListType,
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
      resolve: function(root, role){
		var cursor = role.cursor; 
		var limit = role.limit; 
      	return roleController.list(cursor, limit);
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
      	return customerController.list(cursor, limit);
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
      	return loadBalancerController.list(cursor, limit);
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
      	return productScheduleController.list(cursor, limit);
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
      	return transactionController.list(cursor, limit);
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
      	return campaignController.list(cursor, limit);
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
      	return sessionController.list(cursor, limit);
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
      	return productScheduleController.get(id);
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
      	return fulfillmentProviderController.get(id);
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
      	return loadBalancerController.get(id);
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
      	return creditCardController.get(id);
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
      	return campaignController.get(id);
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
    account: {
      type: accountType,
      args: {
        id: {
          description: 'id of the account',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, account){
      	var id = account.id; 
      	return accountController.get(id);
      }
    },
    role: {
      type: roleType,
      args: {
        id: {
          description: 'id of the role',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function(root, role){
      	var id = role.id; 
      	return roleController.get(id);
      }
    },
    user: {
      type: userType,
      args: {
        id: {
          description: 'id of the user',
          type: GraphQLString
        }
      },
      resolve: function(root, user){
      	if(_.has(user,"id")){ 
			var id = user.id; 
			return userController.get(id);
		}else{
			return null;
		}
      }
    },
    useracl: {
      type: userACLType,
      args: {
        id: {
          description: 'id of the useracl',
          type: GraphQLString
        }
      },
      resolve: function(root, useracl){
      	if(_.has(useracl, 'id')){
			var id = useracl.id; 
			return userACLController.get(id);
		}else{
			return null;
		}
      }
    },
    notificationcount: {
  	  type: notificationCountType,
      resolve: function() {
          return Promise.resolve({ count: 42 });
      }
    },
    notificationlist: {
      type: notificationListType,
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
      resolve: function(root, notification) {
        return notificationController.listForCurrentAccount(notification.limit, notification.cursor);
      }
    }
  })
});

const productInputType = new GraphQLInputObjectType({
  name: 'ProductInput',
  fields: () => ({
    id:						{ type: new GraphQLNonNull(GraphQLString) },
    name:					{ type: new GraphQLNonNull(GraphQLString) },
    sku:					{ type: new GraphQLNonNull(GraphQLString) },
    ship:					{ type: new GraphQLNonNull(GraphQLString) },
    shipping_delay: 		{ type: new GraphQLNonNull(GraphQLString) },
    fulfillment_provider: 	{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const userInputType = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: () => ({
    id:			{ type: new GraphQLNonNull(GraphQLString) },
    name:		{ type: new GraphQLNonNull(GraphQLString) },
    auth0_id:	{ type: new GraphQLNonNull(GraphQLString) },
    active: 	{ type: new GraphQLNonNull(GraphQLString) },
    termsandconditions: 	{ type: GraphQLString },
    address:	{ type: addressInputType },
    acl:		{ type: new GraphQLList(userACLInputType) }
  })
});

const userACLInputType = new GraphQLInputObjectType({
  name: 'UserACLInputType',
  fields: () => ({
  	id:						{ type: new GraphQLNonNull(GraphQLString) },
  	user:					{ type: new GraphQLNonNull(GraphQLString) },
    account:				{ type: new GraphQLNonNull(GraphQLString) },
    role:					{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const userInviteInputType = new GraphQLInputObjectType({
  name: 'UserInviteInput',
  fields: () => ({
    email:		{ type: new GraphQLNonNull(GraphQLString) },
    account:	{ type: new GraphQLNonNull(GraphQLString) },
    role:		{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const inviteInputType = new GraphQLInputObjectType({
  name: 'inviteInput',
  fields: () => ({
    token:		{ type: new GraphQLNonNull(GraphQLString) },
    parameters:	{ type: new GraphQLNonNull(GraphQLString) }
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

const accountInputType = new GraphQLInputObjectType({
  name: 'AccountInput',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    name:				{ type: new GraphQLNonNull(GraphQLString) },
    active:				{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const roleInputType = new GraphQLInputObjectType({
  name: 'RoleInput',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    name:				{ type: new GraphQLNonNull(GraphQLString) },
    active:				{ type: new GraphQLNonNull(GraphQLString) }
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

const fulfillmentProviderInputType = new GraphQLInputObjectType({
  name: 'FulfillmentProviderInput',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    name:				{ type: new GraphQLNonNull(GraphQLString) },
    username:			{ type: new GraphQLNonNull(GraphQLString) },
    password:			{ type: new GraphQLNonNull(GraphQLString) },
    endpoint:			{ type: new GraphQLNonNull(GraphQLString) },
    provider:			{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const emailTemplateInputType = new GraphQLInputObjectType({
  name: 'EmailTemplateInput',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    name:				{ type: new GraphQLNonNull(GraphQLString) },
    subject:			{ type: new GraphQLNonNull(GraphQLString) },
    body:				{ type: new GraphQLNonNull(GraphQLString) },
    type:				{ type: new GraphQLNonNull(GraphQLString) },
    smtp_provider:		{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const addressInputType = new GraphQLInputObjectType({
  name: 'AddressInput',
  fields: () => ({
    line1:				{ type: new GraphQLNonNull(GraphQLString) },
    line2:				{ type: GraphQLString },
    city:				{ type: new GraphQLNonNull(GraphQLString) },
    state:				{ type: new GraphQLNonNull(GraphQLString) },
    zip:				{ type: new GraphQLNonNull(GraphQLString) },
    country:			{ type: new GraphQLNonNull(GraphQLString) },
  })
});
				
const creditCardInputType = new GraphQLInputObjectType({
  name: 'CreditCardInput',
  fields: () => ({
  	id:					{ type: GraphQLString },
    ccnumber:			{ type: new GraphQLNonNull(GraphQLString) },
    expiration:			{ type: new GraphQLNonNull(GraphQLString) },
    ccv:				{ type: new GraphQLNonNull(GraphQLString) },
    name:				{ type: new GraphQLNonNull(GraphQLString) },
    address:			{ type: new GraphQLNonNull(addressInputType) }
  })
});

//note that the credit card input type should either be an object or an identifier
//Add to todos...
const customerInputType = new GraphQLInputObjectType({
  name: 'CustomerInputType',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    firstname:			{ type: new GraphQLNonNull(GraphQLString) },
    lastname:			{ type: new GraphQLNonNull(GraphQLString) },
    email:				{ type: new GraphQLNonNull(GraphQLString) },
    phone:				{ type: new GraphQLNonNull(GraphQLString) },
    address:			{ type: new GraphQLNonNull(addressInputType) },
    creditcards:		{ type: new GraphQLList(GraphQLString) }
  })
});

const merchantProviderConfigurationInputType = new GraphQLInputObjectType({
  name: 'MerchantProviderConfigutationInputType',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    distribution:		{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const loadBalancerInputType = new GraphQLInputObjectType({
  name: 'LoadBalancerInputType',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    merchantproviders:	{ type: new GraphQLList(merchantProviderConfigurationInputType) }
  })
});

const productScheduleInputType = new GraphQLInputObjectType({
  name: 'ProductScheduleInputType',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    name:				{ type: GraphQLString },
    schedule:			{ type: new GraphQLList(productScheduleProductConfigurationInputType) }
  })
});

const productScheduleProductConfigurationInputType = new GraphQLInputObjectType({
  name: 'ProductScheduleProductConfigurationInputType',
  fields: () => ({
    product_id:			{ type: new GraphQLNonNull(GraphQLString) },
    price:				{ type: new GraphQLNonNull(GraphQLString) },
    start:				{ type: new GraphQLNonNull(GraphQLString) },
    end:				{ type: GraphQLString },
    period:				{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const deleteOutputType = new GraphQLObjectType({
  name: 'deleteOutput',
  fields: () => ({
    id:	{ type: new GraphQLNonNull(GraphQLString) }
  })
});

const rebillInputType = new GraphQLInputObjectType({
  name: 'RebillInputType',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    billdate:			{ type: new GraphQLNonNull(GraphQLInt) },
    parentsession:		{ type: new GraphQLNonNull(GraphQLString) },
    amount:				{ type: new GraphQLNonNull(GraphQLString) },
    product_schedules:	{ type: new GraphQLList(GraphQLString) }
  })
});

const transactionInputType = new GraphQLInputObjectType({
  name: 'TransactionInputType',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    date:				{ type: new GraphQLNonNull(GraphQLString) },
    rebill_id:			{ type: new GraphQLNonNull(GraphQLString) },
    amount:				{ type: new GraphQLNonNull(GraphQLFloat) },
    processor_response:	{ type: new GraphQLList(GraphQLString) },
    products:			{ type: new GraphQLList(transactionProductInputType) }
  })
});

const transactionProductInputType = new GraphQLInputObjectType({
  name: 'TransactionProductInputType',
  fields: () => ({
    amount:				{ type: new GraphQLNonNull(GraphQLString) },
    product:			{ type: new GraphQLNonNull(GraphQLString) }
  })
});
	
const campaignInputType = new GraphQLInputObjectType({
  name: 'CampaignInputType',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    name:				{ type: new GraphQLNonNull(GraphQLString) },
    loadbalancer:		{ type: new GraphQLNonNull(GraphQLString) },
    productschedules:	{ type: new GraphQLList(GraphQLString) },
    emailtemplates:		{ type: new GraphQLList(GraphQLString) }
  })
});

const shippingReceiptInputType = new GraphQLInputObjectType({
  name: 'ShippingReceiptInputType',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    created:			{ type: new GraphQLNonNull(GraphQLString) },
    status:				{ type: new GraphQLNonNull(GraphQLString) },
    modified:			{ type: GraphQLString },
    trackingnumber:		{ type: GraphQLString }
  })
});

const sessionInputType = new GraphQLInputObjectType({
  name: 'SessionInputType',
  fields: () => ({
    id:					{ type: new GraphQLNonNull(GraphQLString) },
    customer:			{ type: new GraphQLNonNull(GraphQLString) },
    campaign:			{ type: new GraphQLNonNull(GraphQLString) },
    modified:			{ type: new GraphQLNonNull(GraphQLString) },
    created:			{ type: new GraphQLNonNull(GraphQLString) },
    completed:			{ type: new GraphQLNonNull(GraphQLString) },
    affiliate:			{ type: GraphQLString },
    product_schedules:	{ type: new GraphQLList(GraphQLString) }
  })
});

var notificationInputType = new GraphQLInputObjectType({
    name: 'NotificationInput',
    fields: () => ({
        id:			{ type: new GraphQLNonNull(GraphQLString) },
        user:		{ type: new GraphQLNonNull(GraphQLString) },
        account:	{ type: new GraphQLNonNull(GraphQLString) },
        type: 	    { type: new GraphQLNonNull(GraphQLString) },
        action: 	{ type: new GraphQLNonNull(GraphQLString) },
        message:	{ type: new GraphQLNonNull(GraphQLString) },
        read:		{ type: GraphQLString }
    })
});

var mutationType = new GraphQLObjectType({
	name: 'Mutation',
	fields: () => ({
		acceptinvite:{
			type: userType,
			description: 'Completes a user invite.',
			args: {
				invite: { type: inviteInputType }
			},
			resolve: (value, invite) => {	
				return userController.acceptInvite(invite.invite);
			}
		},
		inviteuser:{
			type: userInviteType,
			description: 'Invites a new user to the site.',
			args: {
				userinvite: { type: userInviteInputType }
			},
			resolve: (value, userinvite) => {	
				return userController.invite(userinvite.userinvite);
			}
		},
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
		createuserstrict:{
			type: userType,
			description: 'Adds a new user.',
			args: {
				user: { type: userInputType }
			},
			resolve: (value, user) => {	
				return userController.createStrict(user.user); 
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
		createuseracl:{
			type: userACLType,
			description: 'Adds a new user acl.',
			args: {
				useracl: { type: userACLInputType }
			},
			resolve: (value, useracl) => {	
				return userACLController.create(useracl.useracl);
			}
		},
		updateuseracl:{
			type: userACLType,
			description: 'Updates a user acl.',
			args: {
				useracl: { type: userACLInputType }
			},
			resolve: (value, useracl) => {
				return userACLController.update(useracl.useracl);
			}
		},
		deleteuseracl:{
			type: deleteOutputType,
			description: 'Deletes a user acl.',
			args: {
				id: {
				  description: 'id of the useracl',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, useracl) => {
				var id = useracl.id;
				return userACLController.delete(id);
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
		createaccount:{
			type: accountType,
			description: 'Adds a new account.',
			args: {
				account: { type: accountInputType }
			},
			resolve: (value, account) => {
				return accountController.create(account.account);
			}
		},
		updateaccount:{
			type: accountType,
			description: 'Updates a account.',
			args: {
				account: { type: accountInputType }
			},
			resolve: (value, account) => {
				return accountController.update(account.account);
			}
		},
		deleteaccount:{
			type: deleteOutputType,
			description: 'Deletes a account.',
			args: {
				id: {
				  description: 'id of the account',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, account) => {
				var id = account.id;
				return accountController.delete(id);
			}
		},
		createrole:{
			type: roleType,
			description: 'Adds a new role.',
			args: {
				role: { type: roleInputType }
			},
			resolve: (value, role) => {
				return roleController.create(role.role);
			}
		},
		updaterole:{
			type: roleType,
			description: 'Updates a role.',
			args: {
				role: { type: roleInputType }
			},
			resolve: (value, role) => {
				return roleController.update(role.role);
			}
		},
		deleterole:{
			type: deleteOutputType,
			description: 'Deletes a role.',
			args: {
				id: {
				  description: 'id of the role',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, role) => {
				var id = role.id;
				return roleController.delete(id);
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
		},
		createfulfillmentprovider:{
			type: fulfillmentProviderType,
			description: 'Adds a new Fulfillment Provider.',
			args: {
				fulfillmentprovider: { type: fulfillmentProviderInputType }
			},
			resolve: (value, fulfillmentprovider) => {
				return fulfillmentProviderController.create(fulfillmentprovider.fulfillmentprovider);
			}
		},
		updatefulfillmentprovider:{
			type: fulfillmentProviderType,
			description: 'Updates a Fulfillment Provider.',
			args: {
				fulfillmentprovider: { type: fulfillmentProviderInputType }
			},
			resolve: (value, fulfillmentprovider) => {
				return fulfillmentProviderController.update(fulfillmentprovider.fulfillmentprovider);
			}
		},
		deletefulfillmentprovider:{
			type: deleteOutputType,
			description: 'Deletes a Fulfillment Provider.',
			args: {
				id: {
				  description: 'id of the fulfillmentprovider',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, fulfillmentprovider) => {
				var id = fulfillmentprovider.id;
				return fulfillmentProviderController.delete(id);
			}
		},
		createemailtemplate:{
			type: emailTemplateType,
			description: 'Adds a new email template.',
			args: {
				emailtemplate: { type: emailTemplateInputType }
			},
			resolve: (value, emailtemplate) => {
				return emailTemplateController.create(emailtemplate.emailtemplate);
			}
		},
		updateemailtemplate:{
			type: emailTemplateType,
			description: 'Updates a Email Template.',
			args: {
				emailtemplate: { type: emailTemplateInputType }
			},
			resolve: (value, emailtemplate) => {
				return emailTemplateController.update(emailtemplate.emailtemplate);
			}
		},
		deleteemailtemplate:{
			type: deleteOutputType,
			description: 'Deletes a Email Template.',
			args: {
				id: {
				  description: 'id of the email template',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, emailtemplate) => {
				var id = emailtemplate.id;
				return emailTemplateController.delete(id);
			}
		},
		createcreditcard:{
			type: creditCardType,
			description: 'Adds a new credit card.',
			args: {
				creditcard: { type: creditCardInputType }
			},
			resolve: (value, creditcard) => {
				return creditCardController.create(creditcard.creditcard);
			}
		},
		updatecreditcard:{
			type: creditCardType,
			description: 'Updates a Credit Card.',
			args: {
				creditcard: { type: creditCardInputType }
			},
			resolve: (value, creditcard) => {
				return creditCardController.update(creditcard.creditcard);
			}
		},
		deletecreditcard:{
			type: deleteOutputType,
			description: 'Deletes a Credit Card.',
			args: {
				id: {
				  description: 'id of the creditcard',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, creditcard) => {
				var id = creditcard.id;
				return creditCardController.delete(id);
			}
		},
		createcustomer:{
			type: customerType,
			description: 'Adds a new customer.',
			args: {
				customer: { type: customerInputType }
			},
			resolve: (value, customer) => {
				return customerController.create(customer.customer);
			}
		},
		updatecustomer:{
			type: customerType,
			description: 'Updates a customer.',
			args: {
				customer: { type: customerInputType }
			},
			resolve: (value, customer) => {
				return customerController.update(customer.customer);
			}
		},
		deletecustomer:{
			type: deleteOutputType,
			description: 'Deletes a customer.',
			args: {
				id: {
				  description: 'id of the customer',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, customer) => {
				var id = customer.id;
				return customerController.delete(id);
			}
		},
		createloadbalancer:{
			type: loadBalancerType,
			description: 'Adds a new customer.',
			args: {
				loadbalancer: { type: loadBalancerInputType }
			},
			resolve: (value, loadbalancer) => {
				return loadBalancerController.create(loadbalancer.loadbalancer);
			}
		},
		updateloadbalancer:{
			type: loadBalancerType,
			description: 'Updates a loadbalancer.',
			args: {
				loadbalancer: { type: loadBalancerInputType }
			},
			resolve: (value, loadbalancer) => {
				return loadBalancerController.update(loadbalancer.loadbalancer);
			}
		},
		deleteloadbalancer:{
			type: deleteOutputType,
			description: 'Deletes a loadbalancer.',
			args: {
				id: {
				  description: 'id of the loadbalancer',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, loadbalancer) => {
				var id = loadbalancer.id;
				return loadBalancerController.delete(id);
			}
		},
		createproductschedule:{
			type: productScheduleType,
			description: 'Adds a new product schedule.',
			args: {
				productschedule: { type: productScheduleInputType }
			},
			resolve: (value, productschedule) => {
				return productScheduleController.create(productschedule.productschedule);
			}
		},
		updateproductschedule:{
			type: productScheduleType,
			description: 'Updates a product schedule.',
			args: {
				productschedule: { type: productScheduleInputType }
			},
			resolve: (value, productschedule) => {
				return productScheduleController.update(productschedule.productschedule);
			}
		},
		deleteproductschedule:{
			type: deleteOutputType,
			description: 'Deletes a product schedule.',
			args: {
				id: {
				  description: 'id of the product schedule',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, productschedule) => {
				var id = productschedule.id;
				return productScheduleController.delete(id);
			}
		},
		createrebill:{
			type: rebillType,
			description: 'Adds a new rebill.',
			args: {
				rebill: { type: rebillInputType }
			},
			resolve: (value, rebill) => {
				return rebillController.create(rebill.rebill);
			}
		},
		updaterebill:{
			type: rebillType,
			description: 'Updates a rebill.',
			args: {
				rebill: { type: rebillInputType }
			},
			resolve: (value, rebill) => {
				return rebillController.update(rebill.rebill);
			}
		},
		deleterebill:{
			type: deleteOutputType,
			description: 'Deletes a rebill.',
			args: {
				id: {
				  description: 'id of the rebill',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, rebill) => {
				var id = rebill.id;
				return rebillController.delete(id);
			}
		},
		createtransaction:{
			type: transactionType,
			description: 'Adds a new transaction.',
			args: {
				transaction: { type: transactionInputType }
			},
			resolve: (value, transaction) => {
				return transactionController.createTransaction(transaction.transaction);
			}
		},
		updatetransaction:{
			type: transactionType,
			description: 'Updates a transaction.',
			args: {
				transaction: { type: transactionInputType }
			},
			resolve: (value, transaction) => {
				return transactionController.updateTransaction(transaction.transaction);
			}
		},
		deletetransaction:{
			type: deleteOutputType,
			description: 'Deletes a transaction.',
			args: {
				id: {
				  description: 'id of the transaction',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, transaction) => {
				var id = transaction.id;
				return transactionController.delete(id);
			}
		},
		createcampaign:{
			type: campaignType,
			description: 'Adds a new campaign.',
			args: {
				campaign: { type: campaignInputType }
			},
			resolve: (value, campaign) => {
				return campaignController.create(campaign.campaign);
			}
		},
		updatecampaign:{
			type: campaignType,
			description: 'Updates a campaign.',
			args: {
				campaign: { type: campaignInputType }
			},
			resolve: (value, campaign) => {
				return campaignController.update(campaign.campaign);
			}
		},
		deletecampaign:{
			type: deleteOutputType,
			description: 'Deletes a campaign.',
			args: {
				id: {
				  description: 'id of the campaign',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, campaign) => {
				var id = campaign.id;
				return campaignController.delete(id);
			}
		},
		createsession:{
			type: sessionType,
			description: 'Adds a new session.',
			args: {
				session: { type: sessionInputType }
			},
			resolve: (value, session) => {
				return sessionController.create(session.session);
			}
		},
		updatesession:{
			type: sessionType,
			description: 'Updates a session.',
			args: {
				session: { type: sessionInputType }
			},
			resolve: (value, session) => {
				return sessionController.update(session.session);
			}
		},
		deletesession:{
			type: deleteOutputType,
			description: 'Deletes a session.',
			args: {
				id: {
				  description: 'id of the session',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, session) => {
				var id = session.id;
				return sessionController.delete(id);
			}
		},
		createshippingreceipt:{
			type: shippingReceiptType,
			description: 'Adds a new shippingreceipt.',
			args: {
				shippingreceipt: { type: shippingReceiptInputType }
			},
			resolve: (value, shippingreceipt) => {
				return shippingReceiptController.create(shippingreceipt.shippingreceipt);
			}
		},
		updateshippingreceipt:{
			type: shippingReceiptType,
			description: 'Updates a shippingreceipt.',
			args: {
				shippingreceipt: { type: shippingReceiptInputType }
			},
			resolve: (value, shippingreceipt) => {
				return shippingReceiptController.update(shippingreceipt.shippingreceipt);
			}
		},
		deleteshippingreceipt:{
			type: deleteOutputType,
			description: 'Deletes a shippingreceipt.',
			args: {
				id: {
				  description: 'id of the shippingreceipt',
				  type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, shippingreceipt) => {
				var id = shippingreceipt.id;
				return shippingReceiptController.delete(id);
			}
		},
        createnotification:{
            type: notificationType,
            description: 'Creates a new notification.',
            args: {
                notification: { type: notificationInputType }
            },
            resolve: (value, notification) => {
                return notificationController.create(notification.notification);
            }
        },
        updatenotification:{
            type: notificationType,
            description: 'Updates a notification.',
            args: {
                notification: { type: notificationInputType }
            },
            resolve: (value, notification) => {
                return notificationController.update(notification.notification);
            }
        },
        deletenotification:{
            type: deleteOutputType,
            description: 'Deletes a notification.',
            args: {
                id: {
                    description: 'id of the notification',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (value, notification) => {
                return notificationController.delete(notification.id);
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