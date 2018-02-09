'use strict';
const _  = require('underscore');

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLList = require('graphql').GraphQLList;

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
let alertTestType = require('./notification/alertTestType');
let notificationType = require('./notification/notificationType');

let notificationSettingType = require('./notificationsetting/notificationSettingType');
let notificationSettingDefaultType = require('./notificationsetting/notificationSettingDefaultType');

let userType = require('./user/userType');
let userListType = require('./user/userListType');

let termsAndConditionsType = require('./termsandconditions/termsAndConditionsType');

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

let billType = require('./bill/billType');
let billListType = require('./bill/billListType');

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

/* Reports */
let transactionSummaryReportType = require('./analytics/transaction_summary_report/transactionSummaryReportType');
let transactionSummaryReportSummaryType = require('./analytics/transaction_summary_report/transactionSummaryReportSummaryType');
let transactionsReportType = require('./analytics/transactions_report/transactionsReportType');
let merchantReportType = require('./analytics/merchant_report/merchantReportType');
let affiliateReportType = require('./analytics/affiliate_report/affiliateReportType');
let affiliateReportSummaryType = require('./analytics/affiliate_report/affiliateReportSummaryType');
let affiliateReportSubaffiliatesType = require('./analytics/affiliate_report/affiliateReportSubaffiliatesType');
/* End Reports */

let listActivityType = require('./analytics/listActivityType');

let eventsByFacetType =  require('./analytics/eventsByFacetType');
let transactionsByFacetType =  require('./analytics/transactionsByFacetType');

let merchantProviderAmountType =  require('./analytics/merchantProviderAmountType');
let analyticsFilterInputType = require('./analytics/filterInputType');
let analyticsPaginationInputType = require('./analytics/paginationInputType');
let analyticsActivityFilterInputType = require('./analytics/activityFilterInputType');
let analyticsBINFilterInputType = require('./analytics/BINFilterInputType');

let entitySearchInputType = require('./entity/searchInputType');
let paginationInputType = require('./pagination/paginationInputType');
let cacheInputType = require('./cache/cacheInputType');

/* Start state machine */

let queueSummaryType = require('./analytics/order_engine/queuesummary/queueSummaryType');
let currentQueueSummary = require('./analytics/order_engine/queuesummary/currentQueueSummaryType');

let rebillsInQueueType = require('./analytics/order_engine/queuesummary/rebillsInQueueType');

/* End State machine */

let listQueueMessageType = require('./queue/listQueueMessageType');

let secondaryIdentifierInputType = require('./general/secondaryIdentifierInputType');

let list_fatal = true;
let get_fatal = true;

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
              const searchController = global.SixCRM.routes.include('controllers', 'providers/search/search.js');

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
            const suggestController = global.SixCRM.routes.include('controllers', 'providers/search/suggest.js');

            return suggestController.suggest(suggest.suggest);
      	  }
      	},
        tokenlist: {
            type: tokenListType.graphObj,
            resolve: function(){

              const tokenHelperController = global.SixCRM.routes.include('helpers', 'token/Token.js');

              return tokenHelperController.getTokensSchema({fatal:list_fatal});

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
        latesttermsandconditions:{
          type: termsAndConditionsType.graphObj,
          description: 'Retrieves latest terms and conditions.',
          args: {
            role: {type: GraphQLString}
          },
          resolve: function(root, args){
            const termsAndConditionsController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');

            return termsAndConditionsController.getLatestTermsAndConditions(args.role);
          }
        },
        userlist: {
            type: userListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, users){
              const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

              return userController.getUsersByAccount({pagination: users.pagination, fatal: list_fatal, search: users.search});
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

              return trackerController.listByAffiliate({affiliate: args.affiliate, pagination: args.pagination, fatal: list_fatal});
            }
        },
        notificationlistbytypes: {
          type: notificationListType.graphObj,
          args: {
              types: {type: new GraphQLList(GraphQLString)},
              onlyUnexpired: {type: GraphQLBoolean},
              user: {type: GraphQLBoolean},
              pagination: {type: paginationInputType.graphObj}
          },
          resolve: function(root, args){
            const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification.js');

            return notificationController.listByTypes({types: args.types, user: args.user, onlyUnexpired: args.onlyUnexpired, pagination: args.pagination, fatal: list_fatal});
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

      	      return customerNoteController.listByCustomer({customer: customernote.customer, pagination: customernote.pagination, fatal: list_fatal});
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

              return productScheduleController.listByProduct({product: args.product, pagination: args.pagination, fatal: list_fatal});
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
              const transactionsController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

              return transactionsController.listByCustomer({customer: transaction.customer, pagination: transaction.pagination, fatal: list_fatal});
            }
        },
        sessionbycustomerandsecondaryidentifier:{
          type: sessionType.graphObj,
          args: {
            customer: {
              description: 'The customer identifier',
              type: new GraphQLNonNull(GraphQLString)
            },
            secondary_identifier: {
              type: secondaryIdentifierInputType.graphObj,
              description: 'The secondary identifier'
            },
            pagination: {type: paginationInputType.graphObj}
          },
          resolve: function(root, args){
            const CustomerHelperController = global.SixCRM.routes.include('helpers', 'entities/customer/Customer.js');
            let customerHelperController = new CustomerHelperController();

            return customerHelperController.customerSessionBySecondaryIdentifier({
              customer: args.customer,
              secondary_identifier: args.secondary_identifier
            });
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

                return customerController.listCustomerSessions({customer: session.customer, pagination: session.pagination, fatal: list_fatal});
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
                //here

                return sessionController.listByAffiliate({affiliate: args.affiliate, pagination: args.pagination, fatal: list_fatal});
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

                return customerController.listCustomerRebills({customer: rebill.customer, pagination: rebill.pagination, fatal: list_fatal});
            }
        },
      rebilllistbystate: {
            type: rebillListType.graphObj,
            args: {
                state: {
                    description: 'The state Rebill is currently at.',
                    type: GraphQLString
                },
                state_changed_after: {
                  description: 'ISO8601 datetime after when state was changed',
                  type: GraphQLString
                },
                state_changed_before: {
                  description: 'ISO8601 datetime before when state was changed',
                  type: GraphQLString
                },
                pagination: {
                  type: paginationInputType.graphObj
                }
            },
            resolve: function(root, args){
                const rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

                return rebillController.listByState(
                  {
                    state: args.state,
                    state_changed_after: args.state_changed_after,
                    state_changed_before: args.state_changed_before,
                    pagination: args.pagination
                  });
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

              return campaignController.listCampaignsByProductSchedule({productschedule: args.productschedule, pagination: args.pagination, fatal: list_fatal});
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

              return campaignController.listCampaignsByProduct({product: args.product, pagination: args.pagination, fatal: list_fatal});
            }
        },
        campaignlistbyaffiliateallowed: {
          type: campaignListType.graphObj,
          args: {
            affiliate: {type: new GraphQLNonNull(GraphQLString)},
            pagination: {type: paginationInputType.graphObj}
          },
          resolve: function(root, args){
            const campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

            return campaignController.listByAffiliateAllow({affiliate: args.affiliate, pagination: args.pagination});
          }
        },
        notificationcount: {
  	       type: notificationCountType.graphObj,
            resolve: function() {
                const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

                return notificationController.numberOfUnseenNotifications({fatal: list_fatal});
            }
        },
        notificationtest: {
            type: notificationTestType.graphObj,
            resolve: function() {
                const notificationProviderController = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider');

                return notificationProviderController.test({fatal: get_fatal});
            }
        },
        alerttest: {
            type: alertTestType.graphObj,
            resolve: function() {
                const notificationProviderController = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider');

                return notificationProviderController.test({fatal: get_fatal, type: 'alert'});
            }
        },
        notificationlist: {
            type: notificationListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, notification) {
                const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

                return notificationController.listByUser({pagination: notification.pagination, reverse_order: true, fatal: list_fatal, search: notification.search, append_account_filter: true});
            }
        },
        notificationsettingdefault: {
            type: notificationSettingDefaultType.graphObj,
            resolve: () => {
                const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                return notificationSettingController.getDefaultProfile({fatal: get_fatal});
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

                return userDeviceTokenController.getUserDeviceTokensByUser({user: user_device_token.user, fatal: list_fatal});
            }
        },

        /*
        * Analytics Endpoints
        */
        affiliatereportsubaffiliates: {
          type: affiliateReportSubaffiliatesType.graphObj,
          args: {
              analyticsfilter: { type: analyticsFilterInputType.graphObj },
              cache: {type: cacheInputType.graphObj},
              pagination: {type: analyticsPaginationInputType.graphObj}
          },
          resolve: function(root, args){
            const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.executeAnalyticsFunction(args, 'getAffiliateReportSubaffiliates');
          }
        },
        affiliatereportsummary: {
          type: affiliateReportSummaryType.graphObj,
          args: {
              analyticsfilter: { type: analyticsFilterInputType.graphObj },
              cache: {type: cacheInputType.graphObj}
          },
          resolve: function(root, args){
            const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.executeAnalyticsFunction(args, 'getAffiliateReportSummary');
          }
        },
        affiliatereport: {
          type: affiliateReportType.graphObj,
          args: {
              analyticsfilter: { type: analyticsFilterInputType.graphObj },
              cache: {type: cacheInputType.graphObj},
              pagination: {type: analyticsPaginationInputType.graphObj}
          },
          resolve: function(root, args){
            const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.executeAnalyticsFunction(args, 'getAffiliateReport');
          }
        },
        merchantreport: {
            type: merchantReportType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj},
                pagination: {type: analyticsPaginationInputType.graphObj}
            },
            resolve: function(root, args){
              const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

              return analyticsController.executeAnalyticsFunction(args, 'getMerchantReport');
            }
        },
        transactionsummaryreport: {
            type: transactionSummaryReportType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj},
                pagination: {type: analyticsPaginationInputType.graphObj}
            },
            resolve: function(root, args){

              const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

              return analyticsController.executeAnalyticsFunction(args, 'getTransactionSummaryReport');

            }
        },
        queuesummary: {
          type: queueSummaryType.graphObj,
          args: {
            analyticsfilter: { type: analyticsFilterInputType.graphObj },
            pagination: {type: analyticsPaginationInputType.graphObj},
            queuename: {
              description: 'Name of a queue',
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve: function(root, args){
            const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.executeAnalyticsFunction(args, 'getQueueSummary');
          }
        },
        rebillsummary: {
          type: queueSummaryType.graphObj,
          args: {
            analyticsfilter: { type: analyticsFilterInputType.graphObj },
            pagination: {type: analyticsPaginationInputType.graphObj},
            queuename: {
              description: 'Name of a queue',
              type: new GraphQLNonNull(GraphQLString)
            },
            period: {
              description: 'Period of granularity',
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve: function(root, args){
            const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.executeAnalyticsFunction(args, 'getRebillSummary');
          }
        },
        rebillsinqueue: {
            type: rebillsInQueueType.graphObj,
            args: {
                queuename: {
                    description: 'Name of a queue',
                    type: new GraphQLNonNull(GraphQLString)
                },
                pagination: {type: analyticsPaginationInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getRebillsInQueue');
            }
        },
        currentqueuesummary: {
          type: currentQueueSummary.graphObj,
          args: {
            queuename: {
              description: 'Name of a queue',
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve: function(root, args){
            const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.executeAnalyticsFunction(args, 'getCurrentQueueSummary');
          }
        },
        transactionsummaryreportsummary: {
            type: transactionSummaryReportSummaryType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){

              const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

              let result = analyticsController.executeAnalyticsFunction(args, 'getTransactionSummaryReportSummary');

              return Promise.resolve(result).then(result => {

                return result;

              });

            }
        },
        transactionsreport: {
            type: transactionsReportType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj},
                pagination: {type: analyticsPaginationInputType.graphObj}
            },
            resolve: function(root, args){

              const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

              let result = analyticsController.executeAnalyticsFunction(args, 'getTransactionsReport');

              return Promise.resolve(result).then(result => {

                return result;

              });

            }
        },
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

                return analyticsController.executeAnalyticsFunction(args, 'getTransactionOverviewWithRebills');
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
        listqueuemessage: {
            type: listQueueMessageType.graphObj,
            args: {
                queuename: {
                  description: 'Name of a queue',
                  type: new GraphQLNonNull(GraphQLString)
                },
            },
            resolve: function(root, args){
                const queueController = global.SixCRM.routes.include('controllers', 'helpers/queue/Queue.js');

                return queueController.listMessages(args.queuename).then(messages => {
                  return Promise.resolve({queuemessages: messages})
                });
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

              return transactionController.get({id: transaction.id, fatal: get_fatal});
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

                return shippingReceiptController.get({id: shippingreceipt.id, fatal: get_fatal});
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

                return rebillController.get({id: rebill.id, fatal: get_fatal});
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

                return sessionController.get({id: session, fatal: get_fatal});
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

                return customerController.get({id:customer.id, fatal: get_fatal});
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

                return customerNoteController.get({id:customernote.id, fatal: get_fatal});
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

                return productController.get({id: product.id, fatal: get_fatal});
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

                return emailTemplateController.get({id: emailtemplate.id, fatal: get_fatal});
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

                return SMTPProviderController.get({id: smtpprovider.id, fatal: get_fatal});
            }
        },
        emailtemplatelist: {
            type: emailTemplateListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, emailtemplates){
                const emailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');

                return emailTemplateController.listByAccount({pagination: emailtemplates.pagination, fatal:list_fatal, search: emailtemplates.search});
            }
        },
        emailtemplatelistbysmtpprovider: {
          type: emailTemplateListType.graphObj,
          args: {
            smtpprovider: {type: new GraphQLNonNull(GraphQLString)},
            pagination: {type: paginationInputType.graphObj},
            search: {type: entitySearchInputType.graphObj}
          },
          resolve: function(root, args){
            const emailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');

            return emailTemplateController.listBySMTPProvider({smtpprovider: args.smtpprovider, pagination: args.pagination});
          }
        },
        smtpproviderlist: {
            type: SMTPProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, smtpproviders){
                const SMTPProviderController = global.SixCRM.routes.include('controllers', 'entities/SMTPProvider.js');

                return SMTPProviderController.listByAccount({pagination: smtpproviders.pagination, fatal:list_fatal, search: smtpproviders.search});
            }
        },
        productlist: {
            type: productListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, products){
                const productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');

                return productController.listByAccount({pagination: products.pagination, fatal:list_fatal, search: products.search});
            }
        },
        useracllist: {
            type: userACLListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, useracl){
                const userACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');

                return userACLController.listByAccount({pagination: useracl.pagination, fatal:list_fatal, search: useracl.search});
            }
        },
        rebilllist: {
            type: rebillListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, rebill){
                const rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

      	       return rebillController.listByAccount({pagination: rebill.pagination, fatal:list_fatal, search: rebill.search});
            }
        },
        shippingreceiptlist: {
            type: shippingReceiptListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, shippingreceipt){
                const shippingReceiptController = global.SixCRM.routes.include('controllers', 'entities/ShippingReceipt.js');

                return shippingReceiptController.listByAccount({pagination: shippingreceipt.pagination, fatal:list_fatal, search: shippingreceipt.search}); }
        },
        affiliatelist: {
            type: affiliateListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, affiliate){
              const affiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

              return affiliateController.listByAccount({pagination: affiliate.pagination, fatal:list_fatal, search: affiliate.search});
            }
        },
        trackerlist: {
            type: trackerListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, tracker){
                const trackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');

                return trackerController.listByAccount({pagination: tracker.pagination, fatal:list_fatal, search: tracker.search});
            }
        },
        billlist: {
            type: billListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, bill){
                const billController = global.SixCRM.routes.include('controllers', 'entities/Bill.js');

                return billController.listByAccount({pagination: bill.pagination, fatal:list_fatal, search: bill.search});
            }
        },
        creditcardlist: {
            type: creditCardListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, creditcard){
                const creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');

                return creditCardController.listByAccount({pagination: creditcard.pagination, fatal:list_fatal, search: creditcard.search});
            }
        },
        merchantproviderlist: {
            type: merchantProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, merchantprovider){
                const merchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');

      	       return merchantProviderController.listByAccount({pagination: merchantprovider.pagination, fatal:list_fatal, search: merchantprovider.search});
            }
        },
        fulfillmentproviderlist: {
            type: fulfillmentProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, fulfillmentprovider){
                const fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');

      	       return fulfillmentProviderController.listByAccount({pagination: fulfillmentprovider.pagination, fatal:list_fatal, search: fulfillmentprovider.search});
            }
        },
        accesskeylist: {
          type: accessKeyListType.graphObj,
          args: {
              pagination: {type: paginationInputType.graphObj},
              search: {type: entitySearchInputType.graphObj}
          },
          resolve: function(root, accesskey){
            const accessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');

    	      return accessKeyController.listByAccount({pagination: accesskey.pagination, fatal:list_fatal, search: accesskey.search});
          }
        },
        accountlist: {
            type: accountListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, account){
                const accountController = global.SixCRM.routes.include('controllers', 'entities/Account.js');

                //Technical Debt: Needs consideration...
                return accountController.list({pagination: account.pagination, fatal: list_fatal});
            }
        },
        rolelist: {
            type: roleListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, role){
              const roleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');

      	      return roleController.list({pagination: role.pagination, fatal:list_fatal});
            }
        },
        customerlist: {
            type: customerListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, customer){
                const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

      	       return customerController.listByAccount({pagination: customer.pagination, fatal:list_fatal, search: customer.search});
            }
        },
        customernotelist: {
            type: customerNoteListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, customernote){
                const customerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');

                return customerNoteController.listByAccount({pagination: customernote.pagination, fatal:list_fatal, search: customernote.search});
            }
        },
        loadbalancerlist: {
            type: loadBalancerListType.graphObj,
            args: {
              pagination: {type: paginationInputType.graphObj},
              search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, loadbalancer){
                const loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

      	       return loadBalancerController.listByAccount({pagination: loadbalancer.pagination, fatal:list_fatal, search: loadbalancer.search});
            }
        },
        productschedulelist: {
            type: productScheduleListType.graphObj,
            args: {
              pagination: {type: paginationInputType.graphObj},
              search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, productschedule){

                const productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

      	       return productScheduleController.listByAccount({pagination: productschedule.pagination, fatal:list_fatal, search: productschedule.search});
            }
        },
        transactionlist: {
            type: transactionListType.graphObj,
            args: {
              pagination: {type: paginationInputType.graphObj},
              search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, transaction){

              const transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

              return transactionController.listByAccount({pagination: transaction.pagination, fatal:list_fatal, search: transaction.search});

            }
        },
        campaignlist: {
            type: campaignListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, campaign){
                const campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

                return campaignController.listByAccount({pagination: campaign.pagination, fatal:list_fatal, search: campaign.search});
            }
        },
        sessionlist: {
            type: sessionListType.graphObj,
            args: {
              pagination: {type: paginationInputType.graphObj},
              search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, session){
              const sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

              return sessionController.listByAccount({pagination: session.pagination, fatal:list_fatal, search: session.search});
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

            	return productScheduleController.get({id: productschedule.id, fatal: get_fatal});
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

      	       return merchantProviderController.get({id: merchantprovider.id, fatal: get_fatal});
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

                return fulfillmentProviderController.get({id: fulfillmentprovider.id, fatal: get_fatal});
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

                return loadBalancerController.get({id: loadbalancer.id, fatal: get_fatal});
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

                return creditCardController.get({id: creditcard.id, fatal: get_fatal});
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

                return campaignController.get({id: campaign.id, fatal: get_fatal});
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

                return affiliateController.get({id: affiliate.id, fatal: get_fatal});
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

                return trackerController.get({id: tracker.id, fatal: get_fatal});
            }
        },
        bill: {
          type: billType.graphObj,
          args: {
            id: {
              description: 'id of the bill',
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve: function(root, bill){
            const billController = global.SixCRM.routes.include('controllers', 'entities/Bill.js');

            return billController.get({id: bill.id, fatal: get_fatal});
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

                return accessKeyController.get({id: accesskey.id, fatal: get_fatal});
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

                return accountController.get({id: account.id, fatal: get_fatal});
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

                return roleController.get({id: role.id, fatal: get_fatal});
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

                 return userController.get({id: user.id, fatal: get_fatal});
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

                return userACLController.get({id: useracl.id, fatal: get_fatal});
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

                    return userSettingController.get({id: usersetting.user, primary_key: 'user', fatal: get_fatal});
                } else {
                    const userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');

                    return userSettingController.get({id: usersetting.id, primary_key: 'id', fatal: get_fatal});
                }
            }
        },
        /*
        //Technical Debt:  User settings are always queried by the user.  And the user setting is unique to the user.
        usersettinglist: {
            type: userSettingListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, user_setting) {
                const userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');

                return userSettingController.list({pagination: user_setting.pagination, fatal:list_fatal});
            }
        },
        */
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

                return userSigningStringController.get({id: user_signing_string.id, fatal: get_fatal});
            }
        },
        //Note:  These are user bound
        usersigningstringlist: {
            type: userSigningStringListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, user_signing_strings) {
              const userSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');

              return userSigningStringController.listByUser({pagination: user_signing_strings.pagination, fatal:list_fatal, search: user_signing_strings.search});
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

                    return notificationController.get({id: notification.id, fatal: get_fatal});
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

                    return notificationSettingController.get({id: notificationsetting.user, primary_key: 'user', fatal: get_fatal});
                } else {
                    const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                    return notificationSettingController.get({id: notificationsetting.id, primary_key:'id', fatal: get_fatal});
                }
            }
        },
        /*
        Note:  These entities do not require a list
        notificationsettinglist: {
            type: notificationSettingListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, notification_setting) {
                const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                return notificationSettingController.list({pagination: notification_setting.pagination, fatal:list_fatal});
            }
        },
        */

        userdevicetokenlist: {
            type: userDeviceTokenListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj},
                search: {type: entitySearchInputType.graphObj}
            },
            resolve: function(root, user_device_token) {

              const userDeviceTokenController = global.SixCRM.routes.include('controllers', 'entities/UserDeviceToken');

              return userDeviceTokenController.listByUser({pagination: user_device_token.pagination, fatal:list_fatal, search: user_device_token.search});

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

                    return userDeviceTokenController.get({id: user_device_token.id, fatal: get_fatal});
                }else{
                    return null;
                }
            }
        }
    })
});
