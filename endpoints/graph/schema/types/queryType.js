'use strict';
const _  = require('underscore');

const du = require('../../../../lib/debug-utilities.js');

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;

let accessKeyType = require('./accesskey/accessKeyType');
let accessKeyListType = require('./accesskey/accessKeyListType');

let accountType = require('./account/accountType');
let accountListType = require('./account/accountListType');

let affiliateType = require('./affiliate/affiliateType');
let affiliateListType = require('./affiliate/affiliateListType');

let campaignType = require('./campaign/campaignType');
let campaignListType = require('./campaign/campaignListType');

let creditCardType = require('./creditcard/creditCardType');
let creditCardListType = require('./creditcard/creditCardListType');

let customerListType = require('./customer/customerListType');
let customerType = require('./customer/customerType');

let customerNoteListType = require('./customernote/customerNoteListType');
let customerNoteType = require('./customernote/customerNoteType');

let emailTemplateListType = require('./emailtemplate/emailTemplateListType');
let emailTemplateType = require('./emailtemplate/emailTemplateType');

let fulfillmentProviderListType = require('./fulfillmentprovider/fulfillmentProviderListType');
let fulfillmentProviderType = require('./fulfillmentprovider/fulfillmentProviderType');

let loadBalancerType = require('./loadbalancer/loadBalancerType');
let loadBalancerListType = require('./loadbalancer/loadBalancerListType');

let merchantProviderType = require('./merchantprovider/merchantProviderType');
let merchantProviderListType = require('./merchantprovider/merchantProviderListType');

let notificationListType = require('./notification/notificationListType');
let notificationCountType = require('./notification/notificationCountType');
let notificationType = require('./notification/notificationType');

let notificationSettingListType = require('./notificationsetting/notificationSettingListType');
let notificationSettingType = require('./notificationsetting/notificationSettingType');
let notificationSettingDefaultType = require('./notificationsetting/notificationSettingDefaultType');

let userType = require('./user/userType');
let userListType = require('./user/userListType');

let userACLType = require('./useracl/userACLType');
let userACLListType = require('./useracl/userACLListType');

let userDeviceTokenListType = require('./userdevicetoken/userDeviceTokenListType');
let userDeviceTokenType = require('./userdevicetoken/userDeviceTokenType');

let transactionListType = require('./transaction/transactionListType');
let transactionType = require('./transaction/transactionType');

let paginationInputType = require('./pagination/paginationInputType');

let productType = require('./product/productType');
let productListType = require('./product/productListType');

let productScheduleListType = require('./productschedule/productScheduleListType');
let productScheduleType = require('./productschedule/productScheduleType');

let rebillListType = require('./rebill/rebillListType');
let rebillType = require('./rebill/rebillType');

let roleType = require('./role/roleType');
let roleListType = require('./role/roleListType');

let sessionListType = require('./session/sessionListType');
let sessionType = require('./session/sessionType');

let SMTPProviderListType = require('./smtpprovider/SMTPProviderListType');
let SMTPProviderType = require('./smtpprovider/SMTPProviderType');

let shippingReceiptType = require('./shippingreceipt/shippingReceiptType');
let shippingReceiptListType = require('./shippingreceipt/shippingReceiptListType');

let suggestInputType = require('./search/suggestInputType');
let suggestResultsType = require('./search/suggestResultsType');
let searchInputType = require('./search/searchInputType');
let searchResultsType = require('./search/searchResultsType');

let transactionSummaryType = require('./analytics/transactionSummaryType');
let transactionOverviewType =  require('./analytics/transactionOverviewType');
let eventFunnelType =  require('./analytics/eventFunnelType');
let campaignDeltaType =  require('./analytics/campaignDeltaType');
let eventsByAffiliateType =  require('./analytics/eventsByAffiliateType');
let transactionsByAffiliateType =  require('./analytics/transactionsByAffiliateType');
let merchantProcessorAmountType =  require('./analytics/merchantProcessorAmountType');
let analyticsFilterInputType = require('./analytics/analyticsFilterInputType');

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
const userDeviceTokenController = require('../../../../controllers/UserDeviceToken');

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
              return transactionController.get(transaction.id);
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
                return shippingReceiptController.get(shippingreceipt.id);
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
                return rebillController.get(rebill.id);
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
                return sessionController.get(session.id);
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
                return customerController.get(customer.id);
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
                return customerNoteController.get(customernote.id);
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
                return productController.get(product.id);
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
                return emailTemplateController.get(emailtemplate.id);
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
                return SMTPProviderController.get(smtpprovider.id);
            }
        },
        emailtemplatelist: {
            type: emailTemplateListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, emailtemplates){
                return emailTemplateController.list(emailtemplates.pagination);
            }
        },
        smtpproviderlist: {
            type: SMTPProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, smtpproviders){
                return SMTPProviderController.list(smtpproviders.pagination);
            }
        },
        productlist: {
            type: productListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, products){
                return productController.list(products.pagination);
            }
        },
        userlist: {
            type: userListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, user){
                return userController.list(user.pagination);
            }
        },
        useracllist: {
            type: userACLListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, useracl){
                return userACLController.list(useracl.pagination);
            }
        },
        rebilllist: {
            type: rebillListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, rebill){
      	       return rebillController.list(rebill.pagination);
            }
        },
        shippingreceiptlist: {
            type: shippingReceiptListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, shippingreceipt){
                return shippingReceiptController.list(shippingreceipt.pagination); }
        },
        affiliatelist: {
            type: affiliateListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, affiliate){
                return affiliateController.list(affiliate.pagination);
            }
        },
        creditcardlist: {
            type: creditCardListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, creditcard){
                return creditCardController.list(creditcard.pagination);
            }
        },
        merchantproviderlist: {
            type: merchantProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, merchantprovider){
      	       return merchantProviderController.list(merchantprovider.pagination);
            }
        },
        fulfillmentproviderlist: {
            type: fulfillmentProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, fulfillmentprovider){
      	       return fulfillmentProviderController.list(fulfillmentprovider.pagination);
            }
        },
        accesskeylist: {
            type: accessKeyListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, accesskey){
      	       return accessKeyController.list(accesskey.pagination);
            }
        },
        accountlist: {
            type: accountListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, account){
                return accountController.list(account.pagination);
            }
        },
        rolelist: {
            type: roleListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, role){
      	       return roleController.list(role.pagination);
            }
        },
        customerlist: {
            type: customerListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, customer){
      	       return customerController.list(customer.pagination);
            }
        },
        customernotelist: {
            type: customerNoteListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, customernote){
                return customerNoteController.list(customernote.pagination);
            }
        },
        customernotelistbycustomer: {
            type: customerNoteListType.graphObj,
            args: {
      	       customer: {
      		         description: 'The customer identifier',
      		         type: new GraphQLNonNull(GraphQLString)
      	        },
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, customernote){
      	      return customerNoteController.listByCustomer(customernote.customer, customernote.pagination);
            }
        },

        loadbalancerlist: {
            type: loadBalancerListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, loadbalancer){
      	       return loadBalancerController.list(loadbalancer.pagination);
            }
        },
        productschedulelist: {
            type: productScheduleListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, productschedule){
      	       return productScheduleController.list(productschedule.pagination);
            }
        },
        transactionlist: {
            type: transactionListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, transaction){
      	       return transactionController.list(transaction.pagination);
            }
        },
        transactionsummary: {
            type: transactionSummaryType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj }
            },
            resolve: function(root, analyticsfilter){
                return analyticsController.getTransactionSummary(analyticsfilter.analyticsfilter);
            }
        },
        transactionoverview: {
            type: transactionOverviewType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj }
            },
            resolve: function(root, analyticsfilter){
                return analyticsController.getTransactionOverview(analyticsfilter.analyticsfilter);
            }
        },
        eventfunnel: {
            type: eventFunnelType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj }
            },
            resolve: function(root, analyticsfilter){
                return analyticsController.getEventFunnel(analyticsfilter.analyticsfilter);
            }
        },
        campaigndelta: {
            type: campaignDeltaType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj }
            },
            resolve: function(root, analyticsfilter){
                return analyticsController.getCampaignDelta(analyticsfilter.analyticsfilter);
            }
        },
        eventsbyaffiliate: {
            type: eventsByAffiliateType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj }
            },
            resolve: function(root, analyticsfilter){
                return analyticsController.getEventsByAffiliate(analyticsfilter.analyticsfilter);
            }
        },

        transactionsbyaffiliate: {
            type: transactionsByAffiliateType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj }
            },
            resolve: function(root, analyticsfilter){
                return analyticsController.getTransactionsByAffiliate(analyticsfilter.analyticsfilter);
            }
        },
        merchantprocessoramount: {
            type: merchantProcessorAmountType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj }
            },
            resolve: function(root, analyticsfilter){
                return analyticsController.getMerchantProcessorAmount(analyticsfilter.analyticsfilter);
            }
        },
        transactionlistbycustomer: {
            type: transactionListType.graphObj,
            args: {
                customer: {
                    description: 'The customer identifier',
                    type: new GraphQLNonNull(GraphQLString)
                },
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, transaction){
                return customerController.listTransactionsByCustomer(transaction.customer, transaction.pagination.cursor, transaction.pagination.limit);
            }
        },
        sessionlistbycustomer: {
            type: sessionListType.graphObj,
            args: {
                customer: {
                    description: 'The customer identifier',
                    type: new GraphQLNonNull(GraphQLString)
                },
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, session){
                return customerController.listCustomerSessions(session.customer, session.pagination.cursor, session.pagination.limit);
            }
        },
        rebilllistbycustomer: {
            type: rebillListType.graphObj,
            args: {
                customer: {
                    description: 'The customer identifier',
                    type: new GraphQLNonNull(GraphQLString)
                },
                pagination: {
                    type: paginationInputType.graphObj
                }
            },
            resolve: function(root, rebill){
                return customerController.listCustomerRebills(rebill.customer, rebill.pagination.cursor, rebill.pagination.limit);
            }
        },
        campaignlist: {
            type: campaignListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, campaign){
                return campaignController.list(campaign.pagination);
            }
        },
        sessionlist: {
            type: sessionListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, session){
                return sessionController.list(session.pagination);
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
            	return productScheduleController.get(productschedule.id);
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
      	       return merchantProviderController.get(merchantprovider.id);
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
                return fulfillmentProviderController.get(fulfillmentprovider.id);
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
                return loadBalancerController.get(loadbalancer.id);
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
                return creditCardController.get(creditcard.id);
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
                return campaignController.get(campaign.id);
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
                return affiliateController.get(affiliate.id);
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
                return accessKeyController.get(accesskey.id);
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
                return accountController.get(account.id);
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
                return roleController.get(role.id);
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
              //Technical Debt:  What is this logic for?
      	       if(_.has(user,"id")){
                 return userController.get(user.id);
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
              //Technical Debt:  What is this logic for?
            	if(_.has(useracl, 'id')){
                return userACLController.get(useracl.id);
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
               //Technical Debt:  What is this logic for?
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
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, notification) {
                return notificationController.listForCurrentUser(notification.pagination);
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
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, notification_setting) {
                return notificationSettingController.list(notification_setting.pagination);
            }
        },
        notificationsettingdefault: {
            type: notificationSettingDefaultType.graphObj,
            resolve: (root, notificationdefault) => {
                return notificationSettingController.getDefaultProfile();
            }
        },
        userdevicetokenlist: {
            type: userDeviceTokenListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, user_device_token) {

                return userDeviceTokenController.list(user_device_token.pagination);

            }
        },
        userdevicetokensbyuserlist: {
            type: userDeviceTokenListType.graphObj,
            args: {
                user: {
                    description: 'A user_id.',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: function(root, user_device_token) {
                return userDeviceTokenController.getUserDeviceTokensByUser(user_device_token.user);
            }
        },
        userdevicetoken: {
            type: userDeviceTokenType.graphObj,
            args: {
                id: {
                    description: 'id of the user device token',
                    type: GraphQLString
                },
                user: {
                    description: 'user associated with the user device token',
                    type: GraphQLString
                }
            },
            resolve: (root, user_device_token) => {
                //Technical Debt:  What is this logic for?
                if (_.has(user_device_token, 'id')) {
                    return userDeviceTokenController.get(user_device_token.id);
                }else{
                    return null;
                }
            }
        },
    })
});
