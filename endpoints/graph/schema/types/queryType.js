'use strict';
const _  = require('underscore');
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;

let notificationSettingListType = require('./notificationSettingListType');
let notificationSettingType = require('./notificationSettingType');
let notificationSettingDefaultType = require('./notificationSettingDefaultType');
let notificationListType = require('./notificationListType');
let notificationCountType = require('./notificationCountType');
let notificationType = require('./notificationType');
let userACLType = require('./userACLType');
let roleType = require('./roleType');
let accountType = require('./accountType');
let accessKeyType = require('./accessKeyType');
let affiliateType = require('./affiliateType');
let campaignType = require('./campaignType');
let creditCardType = require('./creditCardType');
let loadBalancerType = require('./loadBalancerType');
let fulfillmentProviderType = require('./fulfillmentProviderType');
let merchantProviderType = require('./merchantProviderType');
let productScheduleType = require('./productScheduleType');
let sessionListType = require('./sessionListType');
let campaignListType = require('./campaignListType');
let transactionListType = require('./transactionListType');
let productScheduleListType = require('./productScheduleListType');
let loadBalancerListType = require('./loadBalancerListType');
let customerNoteListType = require('./customerNoteListType');
let customerListType = require('./customerListType');
let roleListType = require('./roleListType');
let accountListType = require('./accountListType');
let accessKeyListType = require('./accessKeyListType');
let fulfillmentProviderListType = require('./fulfillmentProviderListType');
let merchantProviderListType = require('./merchantProviderListType');
let creditCardListType = require('./creditCardListType');
let affiliateListType = require('./affiliateListType');
let shippingReceiptListType = require('./shippingReceiptListType');
let rebillListType = require('./rebillListType');
let userACLListType = require('./userACLListType');
let userListType = require('./userListType');
let productListType = require('./productListType');
let SMTPProviderListType = require('./SMTPProviderListType');
let emailTemplateListType = require('./emailTemplateListType');
let SMTPProviderType = require('./SMTPProviderType');
let emailTemplateType = require('./emailTemplateType');
let productType = require('./productType');
let customerNoteType = require('./customerNoteType');
let sessionType = require('./sessionType');
let rebillType = require('./rebillType');
let shippingReceiptType = require('./shippingReceiptType');
let transactionType = require('./transactionType');
let transactionSummaryType = require('./transactionSummaryType');
let userType = require('./userType');
let suggestInputType = require('./suggestInputType');
let suggestResultsType = require('./suggestResultsType');
let searchInputType = require('./searchInputType');
let searchResultsType = require('./searchResultsType');
let customerType = require('./customerType');

const sessionController = require('../../../../controllers/Session.js');
const productController = require('../../../../controllers/Product.js');
const customerController = require('../../../../controllers/Customer.js');
const customerNoteController = require('../../../../controllers/CustomerNote.js');
const transactionController = require('../../../../controllers/Transaction.js');
const rebillController = require('../../../../controllers/Rebill.js');
const creditCardController = require('../../../../controllers/CreditCard.js');
const productScheduleController = require('../../../../controllers/ProductSchedule.js');
const merchantProviderController = require('../../../../controllers/MerchantProvider.js');
const loadBalancerController = require('../../../../controllers/LoadBalancer.js');
const campaignController = require('../../../../controllers/Campaign.js');
const affiliateController = require('../../../../controllers/Affiliate.js');
const fulfillmentProviderController = require('../../../../controllers/FulfillmentProvider.js');
const accessKeyController = require('../../../../controllers/AccessKey.js');
const userController = require('../../../../controllers/User.js');
const userACLController = require('../../../../controllers/UserACL.js');
const emailTemplateController = require('../../../../controllers/EmailTemplate.js');
const SMTPProviderController = require('../../../../controllers/SMTPProvider.js');
const shippingReceiptController = require('../../../../controllers/ShippingReceipt.js');
const accountController = require('../../../../controllers/Account.js');
const roleController = require('../../../../controllers/Role.js');
const searchController = require('../../../../controllers/endpoints/search.js');
const suggestController = require('../../../../controllers/endpoints/suggest.js');
const notificationController = require('../../../../controllers/Notification');
const notificationSettingController = require('../../../../controllers/NotificationSetting');

const analyticsController = require('../../../../controllers/analytics/Analytics.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
  	search:{
  	  type: searchResultsType.graphObj,
	  description: 'Executes a search query.',
	  args: {
	    search: { type: searchInputType.graphObj }
	  },
	  resolve: function(root, search){
      return searchController.search(search.search);
	  }
  	},
  	suggest:{
  	  type: suggestResultsType.graphObj,
  	  description: 'Retrieves string suggestions.',
	  args: {
	    suggest: { type: suggestInputType.graphObj}
	  },
	  resolve: function(root, suggest){
      return suggestController.suggest(suggest.suggest);
	  }
  	},
  	userintrospection:{
  	  type: userType.graphObj,
	  resolve: function(){
      return userController.introspection();
	  }
  	},
  	transaction: {
      type: transactionType.graphObj,
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
            type: shippingReceiptType.graphObj,
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
            type: rebillType.graphObj,
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
            type: sessionType.graphObj,
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
            type: customerType.graphObj,
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
        customernote: {
            type: customerNoteType.graphObj,
            args: {
                id: {
                    description: 'id of the customer note',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: function(root, customernote){
      	var id = customernote.id;

      	return customerNoteController.get(id);
            }
        },
        product: {
            type: productType.graphObj,
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
            type: emailTemplateType.graphObj,
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
            type: SMTPProviderType.graphObj,
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
            type: emailTemplateListType.graphObj,
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
            type: SMTPProviderListType.graphObj,
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
            type: productListType.graphObj,
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
            type: userListType.graphObj,
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
            type: userACLListType.graphObj,
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
            type: rebillListType.graphObj,
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
            type: shippingReceiptListType.graphObj,
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
            type: affiliateListType.graphObj,
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
            type: creditCardListType.graphObj,
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
            type: merchantProviderListType.graphObj,
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
            type: fulfillmentProviderListType.graphObj,
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
            type: accessKeyListType.graphObj,
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
            type: accountListType.graphObj,
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
            type: roleListType.graphObj,
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
            type: customerListType.graphObj,
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
        customernotelist: {
            type: customerNoteListType.graphObj,
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
            resolve: function(root, customernote){
                var cursor = customernote.cursor;
                var limit = customernote.limit;

      	return customerNoteController.list(cursor, limit);
            }
        },
        customernotelistbycustomer: {
            type: customerNoteListType.graphObj,
            args: {
      	customer: {
      		description: 'The customer identifier',
      		type: new GraphQLNonNull(GraphQLString)
      	},
                limit: {
                    description: 'limit',
                    type: GraphQLString
                },
                cursor: {
                    description: 'cursor',
                    type: GraphQLString
                }
            },
            resolve: function(root, customernote){
                var customer = customernote.customer;
                var cursor = customernote.cursor;
                var limit = customernote.limit;

      	return customerNoteController.listByCustomer(customer, cursor, limit);
            }
        },
        loadbalancerlist: {
            type: loadBalancerListType.graphObj,
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
            type: productScheduleListType.graphObj,
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
            type: transactionListType.graphObj,
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
        transactionsummary: {
            type: transactionSummaryType.graphObj,
            args: {
                start: {
                    description: 'The transaction summary start daytime.',
                    type: new GraphQLNonNull(GraphQLString)
                },
                end: {
                    description: 'The transaction summary start daytime.',
                    type: new GraphQLNonNull(GraphQLString)
                },
                campaign:{
                    description: 'The transaction summary campaign filter list.',
                    type: new GraphQLList(GraphQLString)
                },
                affiliate:{
                    description: 'The transaction summary affiliate filter list.',
                    type: new GraphQLList(GraphQLString)
                },
                subaffiliate_1:{
                    description: 'The transaction summary subaffiliate 1 filter list.',
                    type: new GraphQLList(GraphQLString)
                },
                subaffiliate_2:{
                    description: 'The transaction summary subaffiliate 2 filter list.',
                    type: new GraphQLList(GraphQLString)
                },
                subaffiliate_3:{
                    description: 'The transaction summary subaffiliate 3 filter list.',
                    type: new GraphQLList(GraphQLString)
                },
                subaffiliate_4:{
                    description: 'The transaction summary subaffiliate 4 filter list.',
                    type: new GraphQLList(GraphQLString)
                },
                subaffiliate_5:{
                    description: 'The transaction summary subaffiliate 5 filter list.',
                    type: new GraphQLList(GraphQLString)
                },
                merchantprovider:{
                    description: 'The transaction summary merchant provider filter list.',
                    type: new GraphQLList(GraphQLString)
                },
                productschedule:{
                    description: 'The transaction summary product schedule filter list.',
                    type: new GraphQLList(GraphQLString)
                },
                transactiontype:{
                    description: 'The transaction summary product transaction type filter list.',
                    type: new GraphQLList(GraphQLString)
                },
                processorresult:{
                    description: 'The transaction summary processor result filter list.',
                    type: new GraphQLList(GraphQLString)
                }
            },
            resolve: function(root, transaction_summary_args){
      	       return analyticsController.getTransactionSummary(transaction_summary_args);
            }
        },
        transactionlistbycustomer: {
            type: transactionListType.graphObj,
            args: {
                customer: {
                    description: 'The customer identifier',
                    type: new GraphQLNonNull(GraphQLString)
                },
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
                var customer = transaction.customer;
                var cursor = transaction.cursor;
                var limit = transaction.limit;

                return customerController.listTransactionsByCustomer(customer, cursor, limit);
            }
        },
        sessionlistbycustomer: {
            type: sessionListType.graphObj,
            args: {
                customer: {
                    description: 'The customer identifier',
                    type: new GraphQLNonNull(GraphQLString)
                },
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
                let customer = session.customer;
                let cursor = session.cursor;
                let limit = session.limit;

                return customerController.listCustomerSessions(customer, cursor, limit);
            }
        },
        campaignlist: {
            type: campaignListType.graphObj,
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
            type: sessionListType.graphObj,
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
            type: productScheduleType.graphObj,
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
            type: merchantProviderType.graphObj,
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
            type: fulfillmentProviderType.graphObj,
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
            type: loadBalancerType.graphObj,
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
            type: creditCardType.graphObj,
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
            type: campaignType.graphObj,
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
            type: affiliateType.graphObj,
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
            type: accessKeyType.graphObj,
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
            type: accountType.graphObj,
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
            type: roleType.graphObj,
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
            type: userType.graphObj,
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
            type: userACLType.graphObj,
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
        notification: {
            type: notificationType.graphObj,
            args: {
                id: {
                    description: 'id of the notification',
                    type: GraphQLString
                }
            },
            resolve: (root, notification) => {
                if (_.has(notification, 'id')) {
                    return notificationController.get(notification.id);
                } else {
                    return null;
                }
            }
        },
        notificationcount: {
  	       type: notificationCountType.graphObj,
            resolve: function() {
                return notificationController.numberOfUnseenNotifications();
            }
        },
        notificationlist: {
            type: notificationListType.graphObj,
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
                return notificationController.listForCurrentUser(notification.limit, notification.cursor);
            }
        },
        notificationsetting: {
            type: notificationSettingType.graphObj,
            args: {
                user: {
                    description: 'user email associated of the notification settings',
                    type: GraphQLString
                },
                id: {
                    description: 'id of the notification settings',
                    type: GraphQLString
                }
            },
            resolve: (root, notificationsetting) => {
                if (_.has(notificationsetting, 'user')) {
                    return notificationSettingController.get(notificationsetting.user, 'user');
                } else {
                    return notificationSettingController.get(notificationsetting.id, 'id');
                }
            }
        },
        notificationsettinglist: {
            type: notificationSettingListType.graphObj,
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
            resolve: function(root, notification_setting) {
                return notificationSettingController.list(notification_setting.limit, notification_setting.cursor);
            }
        },
        notificationsettingdefault: {
            type: notificationSettingDefaultType.graphObj,
            resolve: (root, notificationdefault) => {
                return notificationSettingController.getDefaultProfile();
            }
        }
    })
});
