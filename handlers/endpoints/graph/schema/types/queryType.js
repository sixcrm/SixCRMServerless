'use strict';
const _  = require('underscore');

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

//Technical Debt:  All of these types frequently have the same fields (id, account, active, created_at, updated_at).  This would be a excellent usage of fragments...

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
let notificationTestType = require('./notification/notificationTestType');
let notificationType = require('./notification/notificationType');

let notificationSettingListType = require('./notificationsetting/notificationSettingListType');
let notificationSettingType = require('./notificationsetting/notificationSettingType');
let notificationSettingDefaultType = require('./notificationsetting/notificationSettingDefaultType');

let userType = require('./user/userType');
let userListType = require('./user/userListType');

let userSettingListType = require('./usersetting/userSettingListType');
let userSettingType = require('./usersetting/userSettingType');

let userSigningStringListType = require('./usersigningstring/userSigningStringListType');
let userSigningStringType = require('./usersigningstring/userSigningStringType');

let userACLType = require('./useracl/userACLType');
let userACLListType = require('./useracl/userACLListType');

let userDeviceTokenListType = require('./userdevicetoken/userDeviceTokenListType');
let userDeviceTokenType = require('./userdevicetoken/userDeviceTokenType');

let transactionListType = require('./transaction/transactionListType');
let transactionType = require('./transaction/transactionType');

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

let trackerType = require('./tracker/trackerType');
let trackerListType = require('./tracker/trackerListType');

let tokenListType = require('./token/tokenListType');

let suggestInputType = require('./search/suggestInputType');
let suggestResultsType = require('./search/suggestResultsType');
let searchInputType = require('./search/searchInputType');
let searchResultsType = require('./search/searchResultsType');

let listMerchantProviderSummariesType = require('./analytics/listMerchantProviderSummariesType');
let transactionSummaryType = require('./analytics/transactionSummaryType');
let listTransactionsType = require('./analytics/listTransactionsType');
let listEventsType = require('./analytics/listEventsType');
let eventSummaryType = require('./analytics/eventSummaryType');
let transactionOverviewType =  require('./analytics/transactionOverviewType');
let eventFunnelType =  require('./analytics/eventFunnelType');
let campaignDeltaType =  require('./analytics/campaignDeltaType');
let campaignsByAmountType =  require('./analytics/campaignsByAmountType');
let listBINsType =  require('./analytics/listBINsType');


let listActivityType = require('./analytics/listActivityType');

let eventsByFacetType =  require('./analytics/eventsByFacetType');
let transactionsByFacetType =  require('./analytics/transactionsByFacetType');

let merchantProviderAmountType =  require('./analytics/merchantProviderAmountType');
let analyticsFilterInputType = require('./analytics/filterInputType');
let analyticsPaginationInputType = require('./analytics/paginationInputType');
let analyticsActivityFilterInputType = require('./analytics/activityFilterInputType');
let analyticsBINFilterInputType = require('./analytics/BINFilterInputType');

let paginationInputType = require('./pagination/paginationInputType');
let cacheInputType = require('./cache/cacheInputType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        /*
        * Esoteric requests
        */
    	   search:{
    	      type: searchResultsType.graphObj,
  	        description: 'Executes a search query.',
  	        args: {
  	           search: { type: searchInputType.graphObj },
              cache: {type: cacheInputType.graphObj}
  	        },
        	  resolve: function(root, search){
              const searchController = global.SixCRM.routes.include('controllers', 'endpoints/search.js');

              return searchController.search(search.search);
        	  }
    	   },
      	suggest:{
      	  type: suggestResultsType.graphObj,
      	  description: 'Retrieves string suggestions.',
      	  args: {
      	    suggest: { type: suggestInputType.graphObj},
            cache: {type: cacheInputType.graphObj}
      	  },
      	  resolve: function(root, suggest){
            const suggestController = global.SixCRM.routes.include('controllers', 'endpoints/suggest.js');

            return suggestController.suggest(suggest.suggest);
      	  }
      	},
        tokenlist: {
            type: tokenListType.graphObj,
            resolve: function(){

              const tokenHelperController = global.SixCRM.routes.include('helpers', 'token/Token.js');

              return tokenHelperController.list();
            }
        },
      	userintrospection:{
      	  type: userType.graphObj,
          description: 'Retrieves or creates a user.',
    	    resolve: function(){
            const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

            return userController.introspection();
    	     }
      	},
        userlist: {
            type: userListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, users){
                const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

                return userController.getUsersByAccount({pagination: users.pagination});
            }
        },
        trackerlistbyaffiliate: {
            type: trackerListType.graphObj,
            args: {
                affiliate: {type: GraphQLString},
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, args){
                const trackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');

                return trackerController.listByAffiliateID({affiliate: args.affiliate, pagination: args.pagination});
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
              const customerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');

      	      return customerNoteController.listByCustomer(customernote.customer, customernote.pagination);
            }
        },
        productschedulelistbyproduct: {
            type: productScheduleListType.graphObj,
            args: {
                product: {type: GraphQLString},
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, args){
              const productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

              return productScheduleController.listProductSchedulesByProduct(args);
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
              const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

              return customerController.listTransactionsByCustomer(transaction.customer, transaction.pagination);
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
                const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

                return customerController.listCustomerSessions(session.customer, session.pagination);
            }
        },
        sessionlistbyaffiliate: {
            type: sessionListType.graphObj,
            args: {
                affiliate: {
                    description: 'The affiliate identifier',
                    type: new GraphQLNonNull(GraphQLString)
                },
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, args){
                const sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

                return sessionController.listSessionsByAffiliate({affiliate: args.affiliate, pagination: args.pagination});
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
                const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

                return customerController.listCustomerRebills(rebill.customer, rebill.pagination);
            }
        },
        campaignlistbyproductschedule: {
            type: campaignListType.graphObj,
            args: {
              productschedule: {type: new GraphQLNonNull(GraphQLString)},
              pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, args){
              const campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

              return campaignController.listCampaignsByProductSchedule(args);
            }
        },
        campaignlistbyproduct: {
            type: campaignListType.graphObj,
            args: {
              product: {type: new GraphQLNonNull(GraphQLString)},
              pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, args){
              const campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

              return campaignController.listCampaignsByProduct(args);
            }
        },
        notificationcount: {
  	       type: notificationCountType.graphObj,
            resolve: function() {
                const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

                return notificationController.numberOfUnseenNotifications();
            }
        },
        notificationtest: {
            type: notificationTestType.graphObj,
            resolve: function() {
                const notificationProviderController = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider');

                return notificationProviderController.test();
            }
        },
        notificationlist: {
            type: notificationListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, notification) {
                const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

                return notificationController.listForCurrentUser(notification.pagination);
            }
        },
        notificationsettingdefault: {
            type: notificationSettingDefaultType.graphObj,
            resolve: () => {
                const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                return notificationSettingController.getDefaultProfile();
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
                const userDeviceTokenController = global.SixCRM.routes.include('controllers', 'entities/UserDeviceToken');

                return userDeviceTokenController.getUserDeviceTokensByUser(user_device_token.user);
            }
        },

        /*
        * Analytics Endpoints
        */

        listmerchantprovidersummaries: {
            type: listMerchantProviderSummariesType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj},
                pagination: {type: analyticsPaginationInputType.graphObj}
            },
            resolve: function(root, args){

              const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

              return analyticsController.executeAnalyticsFunction(args, 'getMerchantProviderSummaries');

            }
        },
        listbins: {
            type: listBINsType.graphObj,
            args: {
                binfilter: { type: analyticsBINFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj},
                pagination: {type: analyticsPaginationInputType.graphObj}
            },
            resolve: function(root, args){
              const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

              return analyticsController.executeAnalyticsFunction(args, 'getBINList');
            }
        },
        transactionsummary: {
            type: transactionSummaryType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getTransactionSummary');
            }
        },
        listtransactions: {
            type: listTransactionsType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                pagination: {type: analyticsPaginationInputType.graphObj},
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getTransactions');
            }
        },
        listevents: {
            type: listEventsType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                pagination: {type: analyticsPaginationInputType.graphObj},
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getEvents');
            }
        },
        eventsummary: {
            type: eventSummaryType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getEventSummary');
            }
        },
        transactionoverview: {
            type: transactionOverviewType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getTransactionOverview');
            }
        },
        eventfunnel: {
            type: eventFunnelType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj}

            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getEventFunnel');
            }
        },
        campaigndelta: {
            type: campaignDeltaType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getCampaignDelta');
            }
        },
        campaignsbyamount: {
            type: campaignsByAmountType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getCampaignsByAmount');
            }
        },
        eventsbyfacet: {
            type: eventsByFacetType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                pagination: {type: analyticsPaginationInputType.graphObj},
                cache: {type: cacheInputType.graphObj},
                facet:{
                    type: GraphQLString
                }
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getEventsByFacet');
            }
        },
        transactionsbyfacet: {
            type: transactionsByFacetType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                pagination: {type: analyticsPaginationInputType.graphObj},
                cache: {type: cacheInputType.graphObj},
                facet:{
                    type: GraphQLString
                }
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getTransactionsByFacet');
            }
        },
        merchantprovideramount: {
            type: merchantProviderAmountType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getMerchantProviderAmount');
            }
        },
        listactivity: {
            type: listActivityType.graphObj,
            args: {
                activityfilter: {type: analyticsActivityFilterInputType.graphObj},
                pagination: {type: analyticsPaginationInputType.graphObj},
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getActivity');
            }
        },
        listactivitybyidentifier: {
            type: listActivityType.graphObj,
            args: {
                activityfilter: {type: analyticsActivityFilterInputType.graphObj},
                pagination: {type: analyticsPaginationInputType.graphObj},
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getActivityByIdentifier');
            }
        },

        /*
        * Normal list and get calls
        */

      	transaction: {
          type: transactionType.graphObj,
          args: {
              id: {
                  description: 'id of the transaction',
                  type: new GraphQLNonNull(GraphQLString)
              }
          },
          resolve: function(root, transaction){
              const transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

              return transactionController.get({id: transaction.id});
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
                const shippingReceiptController = global.SixCRM.routes.include('controllers', 'entities/ShippingReceipt.js');

                return shippingReceiptController.get({id: shippingreceipt.id});
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
                const rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

                return rebillController.get({id: rebill.id});
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
                const sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

                return sessionController.get({id: session});
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
                const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

                return customerController.get({id:customer.id});
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
                const customerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');

                return customerNoteController.get({id:customernote.id});
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
                const productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');

                return productController.get({id: product.id});
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
                const emailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');

                return emailTemplateController.get({id: emailtemplate.id});
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
                const SMTPProviderController = global.SixCRM.routes.include('controllers', 'entities/SMTPProvider.js');

                return SMTPProviderController.get({id: smtpprovider.id});
            }
        },
        emailtemplatelist: {
            type: emailTemplateListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, emailtemplates){
                const emailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');

                return emailTemplateController.list({pagination: emailtemplates.pagination});
            }
        },
        smtpproviderlist: {
            type: SMTPProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, smtpproviders){
                const SMTPProviderController = global.SixCRM.routes.include('controllers', 'entities/SMTPProvider.js');

                return SMTPProviderController.list({pagination: smtpproviders.pagination});
            }
        },
        productlist: {
            type: productListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, products){
                const productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');

                return productController.list({pagination: products.pagination});
            }
        },
        useracllist: {
            type: userACLListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, useracl){
                const userACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');

                return userACLController.list({pagination: useracl.pagination});
            }
        },
        rebilllist: {
            type: rebillListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, rebill){
                const rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

      	       return rebillController.list({pagination: rebill.pagination});
            }
        },
        shippingreceiptlist: {
            type: shippingReceiptListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, shippingreceipt){
                const shippingReceiptController = global.SixCRM.routes.include('controllers', 'entities/ShippingReceipt.js');

                return shippingReceiptController.list({pagination: shippingreceipt.pagination}); }
        },
        affiliatelist: {
            type: affiliateListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, affiliate){
                const affiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

                return affiliateController.list({pagination: affiliate.pagination});
            }
        },
        trackerlist: {
            type: trackerListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, tracker){
                const trackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');

                return trackerController.list({pagination: tracker.pagination});
            }
        },
        creditcardlist: {
            type: creditCardListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, creditcard){
                const creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');

                return creditCardController.list({pagination: creditcard.pagination});
            }
        },
        merchantproviderlist: {
            type: merchantProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, merchantprovider){
                const merchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');

      	       return merchantProviderController.list({pagination: merchantprovider.pagination});
            }
        },
        fulfillmentproviderlist: {
            type: fulfillmentProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, fulfillmentprovider){
                const fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');

      	       return fulfillmentProviderController.list({pagination: fulfillmentprovider.pagination});
            }
        },
        accesskeylist: {
            type: accessKeyListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, accesskey){
                const accessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');

      	       return accessKeyController.list({pagination: accesskey.pagination});
            }
        },
        accountlist: {
            type: accountListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, account){
                const accountController = global.SixCRM.routes.include('controllers', 'entities/Account.js');

                return accountController.list({pagination: account.pagination});
            }
        },
        rolelist: {
            type: roleListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, role){
                const roleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');

      	       return roleController.list({pagination: role.pagination});
            }
        },
        customerlist: {
            type: customerListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, customer){
                const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

      	       return customerController.list({pagination: customer.pagination});
            }
        },
        customernotelist: {
            type: customerNoteListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, customernote){
                const customerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');

                return customerNoteController.list({pagination: customernote.pagination});
            }
        },
        loadbalancerlist: {
            type: loadBalancerListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, loadbalancer){
                const loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

      	       return loadBalancerController.list({pagination: loadbalancer.pagination});
            }
        },
        productschedulelist: {
            type: productScheduleListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, productschedule){

                const productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

      	       return productScheduleController.list({pagination: productschedule.pagination});
            }
        },
        transactionlist: {
            type: transactionListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, transaction){
                const transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

      	       return transactionController.list({pagination: transaction.pagination});
            }
        },
        campaignlist: {
            type: campaignListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, campaign){
                const campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

                return campaignController.list({pagination: campaign.pagination});
            }
        },
        sessionlist: {
            type: sessionListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, session){
                const sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

                return sessionController.list({pagination: session.pagination});
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
                const productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

            	return productScheduleController.get({id: productschedule.id});
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
                const merchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');

      	       return merchantProviderController.get({id: merchantprovider.id});
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
                const fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');

                return fulfillmentProviderController.get({id: fulfillmentprovider.id});
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
                const loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

                return loadBalancerController.get({id: loadbalancer.id});
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
                const creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');

                return creditCardController.get({id: creditcard.id});
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
                const campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

                return campaignController.get({id: campaign.id});
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
                const affiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

                return affiliateController.get({id: affiliate.id});
            }
        },
        tracker: {
            type: trackerType.graphObj,
            args: {
                id: {
                    description: 'id of the tracker',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: function(root, tracker){
                const trackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');

                return trackerController.get({id: tracker.id});
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
                const accessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');

                return accessKeyController.get({id: accesskey.id});
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
                const accountController = global.SixCRM.routes.include('controllers', 'entities/Account.js');

                return accountController.get({id: account.id});
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
                const roleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');

                return roleController.get({id: role.id});
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
                 const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

                 return userController.get({id: user.id});
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
                const userACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');

                return userACLController.get({id: useracl.id});
            }else{
                return null;
            }
            }
        },
        usersetting: {
            type: userSettingType.graphObj,
            args: {
                user: {
                    description: 'user email associated of the user settings',
                    type: GraphQLString
                },
                id: {
                    description: 'id of the user settings',
                    type: GraphQLString
                }
            },
            resolve: (root, usersetting) => {
                //Technical Debt:  This logic belongs in a controller.
                if (_.has(usersetting, 'user')) {
                    const userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');

                    return userSettingController.get({id: usersetting.user, primary_key: 'user'});
                } else {
                    const userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');

                    return userSettingController.get({id: usersetting.id, primary_key: 'id'});
                }
            }
        },
        usersettinglist: {
            type: userSettingListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, user_setting) {
                const userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');

                return userSettingController.list({pagination: user_setting.pagination});
            }
        },
        usersigningstring: {
            type: userSigningStringType.graphObj,
            args: {
                id: {
                    description: 'id of the user signing string',
                    type: GraphQLString
                }
            },
            resolve: (root, user_signing_string) => {
                const userSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');

                return userSigningStringController.get({id: user_signing_string.id});
            }
        },
        usersigningstringlist: {
            type: userSigningStringListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, user_signing_strings) {
                const userSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');

                return userSigningStringController.list({pagination: user_signing_strings.pagination});
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
                    const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

                    return notificationController.get({id: notification.id});
                } else {
                    return null;
                }
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
                //Technical Debt:  This logic belongs in a controller
                if (_.has(notificationsetting, 'user')) {
                    const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                    return notificationSettingController.get({id: notificationsetting.user, primary_key: 'user'});
                } else {
                    const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                    return notificationSettingController.get({id: notificationsetting.id, primary_key:'id'});
                }
            }
        },
        notificationsettinglist: {
            type: notificationSettingListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, notification_setting) {
                const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                return notificationSettingController.list({pagination: notification_setting.pagination});
            }
        },
        userdevicetokenlist: {
            type: userDeviceTokenListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, user_device_token) {
                const userDeviceTokenController = global.SixCRM.routes.include('controllers', 'entities/UserDeviceToken');

                return userDeviceTokenController.list({pagination: user_device_token.pagination});
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
                //Technical Debt:  This logic belongs in a controller
                if (_.has(user_device_token, 'id')) {
                    const userDeviceTokenController = global.SixCRM.routes.include('controllers', 'entities/UserDeviceToken');

                    return userDeviceTokenController.get({id: user_device_token.id});
                }else{
                    return null;
                }
            }
        }
    })
});
