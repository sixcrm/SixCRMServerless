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

let suggestInputType = require('./search/suggestInputType');
let suggestResultsType = require('./search/suggestResultsType');
let searchInputType = require('./search/searchInputType');
let searchResultsType = require('./search/searchResultsType');

let transactionSummaryType = require('./analytics/transactionSummaryType');
let listTransactionsType = require('./analytics/listTransactionsType');
let listEventsType = require('./analytics/listEventsType');
let eventSummaryType = require('./analytics/eventSummaryType');
let transactionOverviewType =  require('./analytics/transactionOverviewType');
let eventFunnelType =  require('./analytics/eventFunnelType');
let campaignDeltaType =  require('./analytics/campaignDeltaType');
let campaignsByAmountType =  require('./analytics/campaignsByAmountType');

let listActivityType = require('./analytics/listActivityType');

let eventsByFacetType =  require('./analytics/eventsByFacetType');
let transactionsByFacetType =  require('./analytics/transactionsByFacetType');

let merchantProviderAmountType =  require('./analytics/merchantProviderAmountType');
let analyticsFilterInputType = require('./analytics/analyticsFilterInputType');
let analyticsPaginationInputType = require('./analytics/analyticsPaginationInputType');
let analyticsActivityFilterInputType = require('./analytics/analyticsActivityFilterInputType');

let paginationInputType = require('./pagination/paginationInputType');
let cacheInputType = require('./cache/cacheInputType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
    	   search:{
    	      type: searchResultsType.graphObj,
  	        description: 'Executes a search query.',
  	        args: {
  	           search: { type: searchInputType.graphObj },
              cache: {type: cacheInputType.graphObj}
  	        },
        	  resolve: function(root, search){
              const searchController = global.routes.include('controllers', 'endpoints/search.js');

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
            const suggestController = global.routes.include('controllers', 'endpoints/suggest.js');

            return suggestController.suggest(suggest.suggest);
      	  }
      	},
      	userintrospection:{
      	  type: userType.graphObj,
          description: 'Retrieves or creates a user.',
    	    resolve: function(){
            const userController = global.routes.include('controllers', 'entities/User.js');

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
              const transactionController = global.routes.include('controllers', 'entities/Transaction.js');

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
                const shippingReceiptController = global.routes.include('controllers', 'entities/ShippingReceipt.js');

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
                const rebillController = global.routes.include('controllers', 'entities/Rebill.js');

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
                const sessionController = global.routes.include('controllers', 'entities/Session.js');

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
                const customerController = global.routes.include('controllers', 'entities/Customer.js');

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
                const customerNoteController = global.routes.include('controllers', 'entities/CustomerNote.js');

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
                const productController = global.routes.include('controllers', 'entities/Product.js');

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
                const emailTemplateController = global.routes.include('controllers', 'entities/EmailTemplate.js');

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
                const SMTPProviderController = global.routes.include('controllers', 'entities/SMTPProvider.js');

                return SMTPProviderController.get(smtpprovider.id);
            }
        },
        emailtemplatelist: {
            type: emailTemplateListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, emailtemplates){
                const emailTemplateController = global.routes.include('controllers', 'entities/EmailTemplate.js');

                return emailTemplateController.list(emailtemplates.pagination);
            }
        },
        smtpproviderlist: {
            type: SMTPProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, smtpproviders){
                const SMTPProviderController = global.routes.include('controllers', 'entities/SMTPProvider.js');

                return SMTPProviderController.list(smtpproviders.pagination);
            }
        },
        productlist: {
            type: productListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, products){
                const productController = global.routes.include('controllers', 'entities/Product.js');

                return productController.list(products.pagination);
            }
        },
        userlist: {
            type: userListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, user){
                const userController = global.routes.include('controllers', 'entities/User.js');

                return userController.list(user.pagination);
            }
        },
        useracllist: {
            type: userACLListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, useracl){
                const userACLController = global.routes.include('controllers', 'entities/UserACL.js');

                return userACLController.list(useracl.pagination);
            }
        },
        rebilllist: {
            type: rebillListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, rebill){
                const rebillController = global.routes.include('controllers', 'entities/Rebill.js');

      	       return rebillController.list(rebill.pagination);
            }
        },
        shippingreceiptlist: {
            type: shippingReceiptListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, shippingreceipt){
                const shippingReceiptController = global.routes.include('controllers', 'entities/ShippingReceipt.js');

                return shippingReceiptController.list(shippingreceipt.pagination); }
        },
        affiliatelist: {
            type: affiliateListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, affiliate){
                const affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');

                return affiliateController.list(affiliate.pagination);
            }
        },
        trackerlist: {
            type: trackerListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, tracker){
                const trackerController = global.routes.include('controllers', 'entities/Tracker.js');

                return trackerController.list(tracker.pagination);
            }
        },
        trackerlistbyaffiliate: {
            type: trackerListType.graphObj,
            args: {
                affiliate: {type: GraphQLString},
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, args){
                const trackerController = global.routes.include('controllers', 'entities/Tracker.js');

                return trackerController.getByAffiliateID(args.affiliate, args.pagination);
            }
        },
        creditcardlist: {
            type: creditCardListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, creditcard){
                const creditCardController = global.routes.include('controllers', 'entities/CreditCard.js');

                return creditCardController.list(creditcard.pagination);
            }
        },
        merchantproviderlist: {
            type: merchantProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, merchantprovider){
                const merchantProviderController = global.routes.include('controllers', 'entities/MerchantProvider.js');

      	       return merchantProviderController.list(merchantprovider.pagination);
            }
        },
        fulfillmentproviderlist: {
            type: fulfillmentProviderListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, fulfillmentprovider){
                const fulfillmentProviderController = global.routes.include('controllers', 'entities/FulfillmentProvider.js');

      	       return fulfillmentProviderController.list(fulfillmentprovider.pagination);
            }
        },
        accesskeylist: {
            type: accessKeyListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, accesskey){
                const accessKeyController = global.routes.include('controllers', 'entities/AccessKey.js');

      	       return accessKeyController.list(accesskey.pagination);
            }
        },
        accountlist: {
            type: accountListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, account){
                const accountController = global.routes.include('controllers', 'entities/Account.js');

                return accountController.list(account.pagination);
            }
        },
        rolelist: {
            type: roleListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, role){
                const roleController = global.routes.include('controllers', 'entities/Role.js');

      	       return roleController.list(role.pagination);
            }
        },
        customerlist: {
            type: customerListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, customer){
                const customerController = global.routes.include('controllers', 'entities/Customer.js');

      	       return customerController.list(customer.pagination);
            }
        },
        customernotelist: {
            type: customerNoteListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, customernote){
                const customerNoteController = global.routes.include('controllers', 'entities/CustomerNote.js');

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
                const customerNoteController = global.routes.include('controllers', 'entities/CustomerNote.js');

      	      return customerNoteController.listByCustomer(customernote.customer, customernote.pagination);
            }
        },

        loadbalancerlist: {
            type: loadBalancerListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, loadbalancer){
                const loadBalancerController = global.routes.include('controllers', 'entities/LoadBalancer.js');

      	       return loadBalancerController.list(loadbalancer.pagination);
            }
        },
        productschedulelist: {
            type: productScheduleListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, productschedule){
                const productScheduleController = global.routes.include('controllers', 'entities/ProductSchedule.js');

      	       return productScheduleController.list(productschedule.pagination);
            }
        },
        transactionlist: {
            type: transactionListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, transaction){
                const transactionController = global.routes.include('controllers', 'entities/Transaction.js');

      	       return transactionController.list(transaction.pagination);
            }
        },
        transactionsummary: {
            type: transactionSummaryType.graphObj,
            args: {
                analyticsfilter: { type: analyticsFilterInputType.graphObj },
                cache: {type: cacheInputType.graphObj}
            },
            resolve: function(root, args){
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

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
                const analyticsController = global.routes.include('controllers', 'analytics/Analytics.js');

                return analyticsController.executeAnalyticsFunction(args, 'getActivityByIdentifier');
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
                const customerController = global.routes.include('controllers', 'entities/Customer.js');

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
                const customerController = global.routes.include('controllers', 'entities/Customer.js');

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
                const sessionController = global.routes.include('controllers', 'entities/Session.js');

                return sessionController.listSessionsByAffiliate(args.affiliate, args.pagination);
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
                const customerController = global.routes.include('controllers', 'entities/Customer.js');

                return customerController.listCustomerRebills(rebill.customer, rebill.pagination);
            }
        },
        campaignlist: {
            type: campaignListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, campaign){
                const campaignController = global.routes.include('controllers', 'entities/Campaign.js');

                return campaignController.list(campaign.pagination);
            }
        },
        sessionlist: {
            type: sessionListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, session){
                const sessionController = global.routes.include('controllers', 'entities/Session.js');

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
                const productScheduleController = global.routes.include('controllers', 'entities/ProductSchedule.js');

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
                const merchantProviderController = global.routes.include('controllers', 'entities/MerchantProvider.js');

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
                const fulfillmentProviderController = global.routes.include('controllers', 'entities/FulfillmentProvider.js');

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
                const loadBalancerController = global.routes.include('controllers', 'entities/LoadBalancer.js');

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
                const creditCardController = global.routes.include('controllers', 'entities/CreditCard.js');

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
                const campaignController = global.routes.include('controllers', 'entities/Campaign.js');

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
                const affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');

                return affiliateController.get(affiliate.id);
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
                const trackerController = global.routes.include('controllers', 'entities/Tracker.js');

                return trackerController.get(tracker.id);
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
                const accessKeyController = global.routes.include('controllers', 'entities/AccessKey.js');

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
                const accountController = global.routes.include('controllers', 'entities/Account.js');

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
                const roleController = global.routes.include('controllers', 'entities/Role.js');

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
                 const userController = global.routes.include('controllers', 'entities/User.js');

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
                const userACLController = global.routes.include('controllers', 'entities/UserACL.js');

                return userACLController.get(useracl.id);
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
                if (_.has(usersetting, 'user')) {
                    const userSettingController = global.routes.include('controllers', 'entities/UserSetting');

                    return userSettingController.get(usersetting.user, 'user');
                } else {
                    const userSettingController = global.routes.include('controllers', 'entities/UserSetting');

                    return userSettingController.get(usersetting.id, 'id');
                }
            }
        },
        usersettinglist: {
            type: userSettingListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, user_setting) {
                const userSettingController = global.routes.include('controllers', 'entities/UserSetting');

                return userSettingController.list(user_setting.pagination);
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
                const userSigningStringController = global.routes.include('controllers', 'entities/UserSigningString');

                return userSigningStringController.get(user_signing_string.id);
            }
        },
        usersigningstringlist: {
            type: userSigningStringListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, user_signing_strings) {
                const userSigningStringController = global.routes.include('controllers', 'entities/UserSigningString');

                return userSigningStringController.list(user_signing_strings.pagination);
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
                    const notificationController = global.routes.include('controllers', 'entities/Notification');

                    return notificationController.get(notification.id);
                } else {
                    return null;
                }
            }
        },
        notificationcount: {
  	       type: notificationCountType.graphObj,
            resolve: function() {
                const notificationController = global.routes.include('controllers', 'entities/Notification');

                return notificationController.numberOfUnseenNotifications();
            }
        },
        notificationtest: {
            type: notificationTestType.graphObj,
            resolve: function() {
                const notificationProviderController = global.routes.include('controllers', 'providers/notification/notification-provider');

                return notificationProviderController.test();
            }
        },
        notificationlist: {
            type: notificationListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, notification) {
                const notificationController = global.routes.include('controllers', 'entities/Notification');

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
                    const notificationSettingController = global.routes.include('controllers', 'entities/NotificationSetting');

                    return notificationSettingController.get(notificationsetting.user, 'user');
                } else {
                    const notificationSettingController = global.routes.include('controllers', 'entities/NotificationSetting');

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
                const notificationSettingController = global.routes.include('controllers', 'entities/NotificationSetting');

                return notificationSettingController.list(notification_setting.pagination);
            }
        },
        notificationsettingdefault: {
            type: notificationSettingDefaultType.graphObj,
            resolve: () => {
                const notificationSettingController = global.routes.include('controllers', 'entities/NotificationSetting');

                return notificationSettingController.getDefaultProfile();
            }
        },
        userdevicetokenlist: {
            type: userDeviceTokenListType.graphObj,
            args: {
                pagination: {type: paginationInputType.graphObj}
            },
            resolve: function(root, user_device_token) {
                const userDeviceTokenController = global.routes.include('controllers', 'entities/UserDeviceToken');

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
                const userDeviceTokenController = global.routes.include('controllers', 'entities/UserDeviceToken');

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
                    const userDeviceTokenController = global.routes.include('controllers', 'entities/UserDeviceToken');

                    return userDeviceTokenController.get(user_device_token.id);
                }else{
                    return null;
                }
            }
        }
    })
});
