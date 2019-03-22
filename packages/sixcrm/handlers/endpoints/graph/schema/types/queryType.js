require('module-alias/register');
const _ = require('lodash');
const { getProductSetupService, getProductScheduleService, LegacyProduct, LegacyProductSchedule } = require('@6crm/sixcrm-product-setup');

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;

//Technical Debt:  All of these types frequently have the same fields (id, account, active, created_at, updated_at).  This would be a excellent usage of fragments...
const analyticsQueryType = require('./analytics/queryType');

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

let customerJWTType = require('./customer/customerJWTType');

let emailTemplateListType = require('./emailtemplate/emailTemplateListType');
let emailTemplateType = require('./emailtemplate/emailTemplateType');
let emailTemplateTestType = require('./emailtemplate/emailTemplateTestType');
let emailTemplatePreviewType = require('./emailtemplate/emailTemplatePreviewType');

let fulfillmentProviderListType = require('./fulfillmentprovider/fulfillmentProviderListType');
let fulfillmentProviderType = require('./fulfillmentprovider/fulfillmentProviderType');

let eventHookListType = require('./eventhook/eventHookListType');
let eventHookType = require('./eventhook/eventHookType');

let merchantProviderGroupType = require('./merchantprovidergroup/merchantProviderGroupType');
let merchantProviderGroupListType = require('./merchantprovidergroup/merchantProviderGroupListType');

let merchantProviderGroupAssociationType = require('./merchantprovidergroupassociation/merchantProviderGroupAssociationType');
let merchantProviderGroupAssociationListType = require('./merchantprovidergroupassociation/merchantProviderGroupAssociationListType');

let merchantProviderType = require('./merchantprovider/merchantProviderType');
let merchantProviderListType = require('./merchantprovider/merchantProviderListType');

let notificationListType = require('./notification/notificationListType');
let notificationCountType = require('./notification/notificationCountType');
let notificationTestType = require('./notification/notificationTestType');
let alertTestType = require('./notification/alertTestType');
let notificationType = require('./notification/notificationType');

let notificationSettingType = require('./notificationsetting/notificationSettingType');
let notificationSettingDefaultType = require('./notificationsetting/notificationSettingDefaultType');

let orderType = require('./order/orderType');
let orderListType = require('./order/orderListType');

let userType = require('./user/userType');
let userListType = require('./user/userListType');

let userSettingType = require('./usersetting/userSettingType');

let userSigningStringListType = require('./usersigningstring/userSigningStringListType');
let userSigningStringType = require('./usersigningstring/userSigningStringType');

let userACLType = require('./useracl/userACLType');
let userACLListType = require('./useracl/userACLListType');

let entityACLType = require('./entityacl/entityACLType');
let entityACLListType = require('./entityacl/entityACLListType');

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

let returnListType = require('./return/returnListType');
let returnType = require('./return/returnType');

let roleType = require('./role/roleType');
let roleListType = require('./role/roleListType');

let sessionListType = require('./session/sessionListType');
let sessionType = require('./session/sessionType');

let SMTPProviderListType = require('./smtpprovider/SMTPProviderListType');
let SMTPProviderType = require('./smtpprovider/SMTPProviderType');

let SMSProviderListType = require('./smsprovider/SMSProviderListType');
let SMSProviderType = require('./smsprovider/SMSProviderType');

let shippingReceiptType = require('./shippingreceipt/shippingReceiptType');
let shippingReceiptListType = require('./shippingreceipt/shippingReceiptListType');

let trackerType = require('./tracker/trackerType');
let trackerListType = require('./tracker/trackerListType');

let trialConfirmationType = require('./trialconfirmation/trialConfirmationType');

let tokenListType = require('./token/tokenListType');

let tagType = require('./tag/tagType');
let tagListType = require('./tag/tagListType');

const accountDetailsType = require('./accountdetails/accountDetailsType');

let suggestInputType = require('./search/suggestInputType');
let suggestResultsType = require('./search/suggestResultsType');
let searchInputType = require('./search/searchInputType');
let searchResultsType = require('./search/searchResultsType');

let binType = require('./bin/BINType');

let entitySearchInputType = require('./entity/searchInputType');
let paginationInputType = require('./pagination/paginationInputType');
let cacheInputType = require('./cache/cacheInputType');

/* End State machine */

const  secondaryIdentifierInputType = require('./general/secondaryIdentifierInputType');
const ipCheckType = require('./ipcheck/ipCheckType');
const connectionTestType = require('./test/connectionTestType.js');
const featureFlagsType = require('./featureflags/featureFlagsType');

let list_fatal = true;
let get_fatal = true;

// Entity Controllers

const BinController = global.SixCRM.routes.include('controllers', 'entities/Bin.js');
const CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
const CampaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
const CustomerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');
const CustomerHelperController = global.SixCRM.routes.include('helpers', 'entities/customer/Customer.js');
const AccountController = global.SixCRM.routes.include('controllers', 'entities/Account.js');
const AccessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');
const CustomerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');
const EmailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');
const EntityACLController = global.SixCRM.routes.include('controllers', 'entities/EntityACL.js');
const EventHookController = global.SixCRM.routes.include('controllers', 'entities/EventHook.js');
const FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');
const MerchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');
const MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup.js');
const MerchantProviderGroupAssociationController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroupAssociation.js');
const NotificationController = global.SixCRM.routes.include('controllers', 'entities/Notification.js');
const NotificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');
const AffiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');
const TransactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');
const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
const UserACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');
const UserDeviceTokenController = global.SixCRM.routes.include('controllers', 'entities/UserDeviceToken');
const UserSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');
const UserSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const ReturnController = global.SixCRM.routes.include('controllers', 'entities/Return.js');
const RoleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
const ShippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');
const SMTPProviderController = global.SixCRM.routes.include('entities', 'SMTPProvider.js');
const SMSProviderController = global.SixCRM.routes.include('entities', 'SMSProvider.js');
const TagController = global.SixCRM.routes.include('controllers', 'entities/Tag.js');
const TrackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');
const TrialConfirmationController = global.SixCRM.routes.include('entities', 'TrialConfirmation.js');
const AccountDetailsController = global.SixCRM.routes.include('controllers', 'entities/AccountDetails.js');


// Helpers Controllers

const OrderHelperController = global.SixCRM.routes.include('helpers', 'order/Order.js');
const TokenHelperController = global.SixCRM.routes.include('helpers', 'token/Token.js');

// Providers Controllers

const SearchController = global.SixCRM.routes.include('controllers', 'providers/search/search.js');
const SuggestController = global.SixCRM.routes.include('controllers', 'providers/search/suggest.js');
const IPCheckController = global.SixCRM.routes.include('providers', 'ipcheck/IPCheck.js');

const FeatureFlagsHelperController = global.SixCRM.routes.include('helpers', 'entities/featureflag/FeatureFlag.js');

const fields = Object.assign({}, {
	featureflag: {
		type: featureFlagsType.graphObj,
		description: 'Site Feature Flags',
		args: {
			environment: {
				type: new GraphQLNonNull(GraphQLString)
			}
		},
		resolve: function(root, args) {
			const featureFlagsHelperController = new FeatureFlagsHelperController();
			return featureFlagsHelperController.getFeatureFlag(args).then((result) => { return {configuration: result} });
		}
	},
	search: {
		type: searchResultsType.graphObj,
		description: 'Executes a search query.',
		args: {
			search: {
				type: searchInputType.graphObj
			},
			cache: {
				type: cacheInputType.graphObj
			}
		},
		resolve: function(root, search) {
			const searchController = new SearchController();

			return searchController.search(search.search);
		}
	},
	suggest: {
		type: suggestResultsType.graphObj,
		description: 'Retrieves string suggestions.',
		args: {
			suggest: {
				type: suggestInputType.graphObj
			},
			cache: {
				type: cacheInputType.graphObj
			}
		},
		resolve: function(root, suggest) {
			const suggestController = new SuggestController();

			return suggestController.suggest(suggest.suggest);
		}
	},
	tokenlist: {
		type: tokenListType.graphObj,
		resolve: function() {

			const tokenHelperController = new TokenHelperController();

			return tokenHelperController.getTokensSchema({
				fatal: list_fatal
			});

		}
	},
	userintrospection: {
		type: userType.graphObj,
		description: 'Retrieves or creates a user.',
		resolve: function() {
			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			let userHelperController = new UserHelperController();
			return userHelperController.introspection();
		}
	},
	userlist: {
		type: userListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, users) {
			const userController = new UserController();
			return userController.getUsersByAccount({
				pagination: users.pagination,
				fatal: list_fatal,
				search: users.search
			});
		}
	},
	trackerlistbyaffiliate: {
		type: trackerListType.graphObj,
		args: {
			affiliate: {
				type: GraphQLString
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, args) {
			const trackerController = new TrackerController();

			return trackerController.listByAffiliate({
				affiliate: args.affiliate,
				pagination: args.pagination,
				fatal: list_fatal
			});
		}
	},
	notificationlistbytype: {
		type: notificationListType.graphObj,
		args: {
			type: {
				type: GraphQLString
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, args) {
			const notificationController = new NotificationController();

			return notificationController.listByType({
				type: args.type,
				pagination: args.pagination,
				fatal: list_fatal
			});
		}
	},
	customernotelistbycustomer: {
		type: customerNoteListType.graphObj,
		args: {
			customer: {
				description: 'The customer identifier',
				type: new GraphQLNonNull(GraphQLString)
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, customernote) {
			const customerNoteController = new CustomerNoteController();

			return customerNoteController.listByCustomer({
				customer: customernote.customer,
				pagination: customernote.pagination,
				fatal: list_fatal
			});
		}
	},
	transactionlistbycustomer: {
		type: transactionListType.graphObj,
		args: {
			customer: {
				description: 'The customer identifier',
				type: new GraphQLNonNull(GraphQLString)
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, transaction) {
			const transactionController = new TransactionController();

			return transactionController.listByCustomer({
				customer: transaction.customer,
				pagination: transaction.pagination,
				fatal: list_fatal
			});
		}
	},
	sessionbycustomerandsecondaryidentifier: {
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
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, args) {
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
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, session) {
			const customerController = new CustomerController();

			return customerController.listCustomerSessions({
				customer: session.customer,
				pagination: session.pagination,
				fatal: list_fatal
			});
		}
	},
	sessionlistbyaffiliate: {
		type: sessionListType.graphObj,
		args: {
			affiliate: {
				description: 'The affiliate identifier',
				type: new GraphQLNonNull(GraphQLString)
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, args) {
			const sessionController = new SessionController();
			//here

			return sessionController.listByAffiliate({
				affiliate: args.affiliate,
				pagination: args.pagination,
				fatal: list_fatal
			});
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
		resolve: function(root, rebill) {
			const customerController = new CustomerController();

			return customerController.listCustomerRebills({
				customer: rebill.customer,
				pagination: rebill.pagination,
				fatal: list_fatal
			});
		}
	},
	pastrebillsforcustomer: {
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
		resolve: function(root, rebill) {
			const customerHelper = new CustomerHelperController();
			return customerHelper.getPastRebills({
				customer: rebill.customer,
				pagination: rebill.pagination
			});
		}
	},
	pendingrebillsforcustomer: {
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
		resolve: function(root, rebill) {
			const customerHelper = new CustomerHelperController();
			return customerHelper.getPendingRebills({
				customer: rebill.customer,
				pagination: rebill.pagination
			});
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
		resolve: function(root, args) {
			const rebillController = new RebillController();

			return rebillController.listByState({
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
			productschedule: {
				type: new GraphQLNonNull(GraphQLString)
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, args) {
			const campaignController = new CampaignController();

			return campaignController.listCampaignsByProductSchedule({
				productschedule: args.productschedule,
				pagination: args.pagination,
				fatal: list_fatal
			});
		}
	},
	campaignlistbyproduct: {
		type: campaignListType.graphObj,
		args: {
			product: {
				type: new GraphQLNonNull(GraphQLString)
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, args) {
			const campaignController = new CampaignController();

			return campaignController.listCampaignsByProduct({
				product: args.product,
				pagination: args.pagination,
				fatal: list_fatal
			});
		}
	},
	campaignlistbyaffiliateallowed: {
		type: campaignListType.graphObj,
		args: {
			affiliate: {
				type: new GraphQLNonNull(GraphQLString)
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, args) {
			const campaignController = new CampaignController();

			return campaignController.listByAffiliateAllow({
				affiliate: args.affiliate,
				pagination: args.pagination
			});
		}
	},
	notificationcount: {
		type: notificationCountType.graphObj,
		resolve: function() {
			const notificationController = new NotificationController();

			return notificationController.numberOfUnseenNotifications({
				fatal: list_fatal
			});
		}
	},
	notificationtest: {
		type: notificationTestType.graphObj,
		resolve: function() {

			let context = {
				user: global.user,
				account: global.account
			};

			let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			return new EventPushHelperController().pushEvent({
				event_type: 'test',
				context: context
			}).then(() => { return {result: 'OK'} });

		}
	},
	alerttest: {
		type: alertTestType.graphObj,
		resolve: function() {

			let context = {
				user: global.user,
				account: global.account
			};

			let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			return new EventPushHelperController().pushEvent({
				event_type: 'testalert',
				context: context
			}).then(() => { return {result: 'OK'} });

		}
	},
	notificationlist: {
		type: notificationListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, notification) {
			const notificationController = new NotificationController();

			return notificationController.listByUser({
				pagination: notification.pagination,
				reverse_order: true,
				fatal: list_fatal,
				search: notification.search,
				append_account_filter: true
			});
		}
	},
	notificationsettingdefault: {
		type: notificationSettingDefaultType.graphObj,
		resolve: () => {
			const notificationSettingController = new NotificationSettingController();

			return notificationSettingController.getDefaultProfile({
				fatal: get_fatal
			});
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
			const userDeviceTokenController = new UserDeviceTokenController();

			return userDeviceTokenController.getUserDeviceTokensByUser({
				user: user_device_token.user,
				fatal: list_fatal
			});
		}
	},

	bin: {
		type: binType.graphObj,
		args: {
			binnumber: {
				description: 'binnumber of the creditcard',
				type: new GraphQLNonNull(GraphQLInt)
			}
		},
		resolve: function(root, args) {

			const binController = new BinController();

			return binController.getCreditCardProperties({
				binnumber: args.binnumber
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
		resolve: function(root, transaction) {
			const transactionController = new TransactionController();

			return transactionController.get({
				id: transaction.id,
				fatal: get_fatal
			});
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
		resolve: function(root, shippingreceipt) {
			const shippingReceiptController = new ShippingReceiptController();

			return shippingReceiptController.get({
				id: shippingreceipt.id,
				fatal: get_fatal
			});
		}
	},
	shippingreceiptbycustomerlist: {
		type: shippingReceiptListType.graphObj,
		args: {
			customer: {
				description: 'id of the customer',
				type: new GraphQLNonNull(GraphQLString)
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, shippingreceipt) {
			const shippingReceiptHelper = new ShippingReceiptHelperController();

			return shippingReceiptHelper.listByCustomer({
				customer: shippingreceipt.customer,
				pagination: shippingreceipt.pagination,
				fatal: get_fatal
			});
		}
	},
	return: {
		type: returnType.graphObj,
		args: {
			id: {
				description: 'id of the return',
				type: new GraphQLNonNull(GraphQLString)
			}
		},
		resolve: function(root, returnentity) {
			const returnController = new ReturnController();

			return returnController.get({
				id: returnentity.id,
				fatal: get_fatal
			});
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
		resolve: function(root, rebill) {
			const rebillController = new RebillController();

			return rebillController.get({
				id: rebill.id,
				fatal: get_fatal
			});
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
		resolve: function(root, session) {
			const sessionController = new SessionController();

			return sessionController.get({
				id: session,
				fatal: get_fatal
			});
		}
	},
	trialconfirmation: {
		type: trialConfirmationType.graphObj,
		args: {
			id: {
				description: 'id of the trial confirmation',
				type: GraphQLString
			}
		},
		resolve: function(root, trial_confirmation) {
			const trialConfirmationController = new TrialConfirmationController();

			return trialConfirmationController.get({
				id: trial_confirmation,
				fatal: get_fatal
			});
		}
	},
	trialconfirmationbycode: {
		type: trialConfirmationType.graphObj,
		args: {
			code: {
				description: 'code of the trial confirmation',
				type: GraphQLString
			}
		},
		resolve: function(root, trial_confirmation) {
			const trialConfirmationController = new TrialConfirmationController();

			return trialConfirmationController.getByCode({
				code: trial_confirmation
			});
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
		resolve: function(root, customer) {
			const customerController = new CustomerController();

			return customerController.get({
				id: customer.id,
				fatal: get_fatal
			});
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
		resolve: function(root, customernote) {
			const customerNoteController = new CustomerNoteController();

			return customerNoteController.get({
				id: customernote.id,
				fatal: get_fatal
			});
		}
	},
	getcustomerjwt: {
		type: customerJWTType.graphObj,
		args: {
			customer: {
				description: 'id of the customer',
				type: GraphQLString
			},
			session: {
				description: 'id of the session',
				type: GraphQLString
			}
		},
		resolve: function(root, args) {

			const customerHelperController = new CustomerHelperController();

			return customerHelperController.getCustomerJWT(args);

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
		resolve: async (root, { id }) => {
			const product = await getProductSetupService().getProduct(id);
			return LegacyProduct.hybridFromProduct(product);
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
		resolve: function(root, emailtemplate) {
			const emailTemplateController = new EmailTemplateController();

			return emailTemplateController.get({
				id: emailtemplate.id,
				fatal: get_fatal
			});
		}
	},
	emailtemplatetest: {
		type: emailTemplateTestType.graphObj,
		args: {
			id: {
				description: 'id of the email template',
				type: GraphQLString
			}
		},
		resolve: function(root, id) {
			let helper = require('@lib/controllers/helpers/emailtemplates/EmailTemplateSender.js').default;
			return new helper().sendEmailWithTemplate({template_id: id}).then(() => { return {result: 'OK'} });

		}
	},
	emailtemplatepreview: {
		type: emailTemplatePreviewType.graphObj,
		args: {
			body: {
				description: 'body of the email template',
				type: GraphQLString
			}
		},
		resolve: function(root, body) {

			let helper = require('@lib/controllers/helpers/emailtemplates/EmailTemplateSender.js').default;
			return new helper().compileBodyWithExampleData({template: body}).then(result => { return {result}});

		}
	},
	sharedemailtemplate: {
		type: emailTemplateType.graphObj,
		args: {
			id: {
				description: 'id of the email template',
				type: GraphQLString
			}
		},
		resolve: function(root, emailtemplate) {
			const emailTemplateController = new EmailTemplateController();

			return emailTemplateController.getShared({
				id: emailtemplate.id
			});
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
		resolve: function(root, smtpprovider) {
			const smtpProviderController = new SMTPProviderController();

			return smtpProviderController.get({
				id: smtpprovider.id,
				fatal: get_fatal
			});
		}
	},
	smsprovider: {
		type: SMSProviderType.graphObj,
		args: {
			id: {
				description: 'id of the SMS Provider',
				type: GraphQLString
			}
		},
		resolve: function(root, smsprovider) {
			const smsProviderController = new SMSProviderController();

			return smsProviderController.get({
				id: smsprovider.id,
				fatal: get_fatal
			});
		}
	},
	emailtemplatelist: {
		type: emailTemplateListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, emailtemplates) {
			const emailTemplateController = new EmailTemplateController();

			return emailTemplateController.listByAccount({
				pagination: emailtemplates.pagination,
				fatal: list_fatal,
				search: emailtemplates.search
			});
		}
	},
	sharedemailtemplatelist: {
		type: emailTemplateListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, emailtemplates) {
			const emailTemplateController = new EmailTemplateController();

			return emailTemplateController.listShared({
				pagination: emailtemplates.pagination
			});
		}
	},
	emailtemplatelistbysmtpprovider: {
		type: emailTemplateListType.graphObj,
		args: {
			smtpprovider: {
				type: new GraphQLNonNull(GraphQLString)
			},
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, args) {
			const emailTemplateController = new EmailTemplateController();

			return emailTemplateController.listBySMTPProvider({
				smtpprovider: args.smtpprovider,
				pagination: args.pagination
			});
		}
	},
	smtpproviderlist: {
		type: SMTPProviderListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, smtpproviders) {
			const smtpProviderController = new SMTPProviderController();

			return smtpProviderController.listByAccount({
				pagination: smtpproviders.pagination,
				fatal: list_fatal,
				search: smtpproviders.search
			});
		}
	},
	smsproviderlist: {
		type: SMSProviderListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, smsproviders) {
			const smsProviderController = new SMSProviderController();

			return smsProviderController.listByAccount({
				pagination: smsproviders.pagination,
				fatal: list_fatal,
				search: smsproviders.search
			});
		}
	},
	productlist: {
		type: productListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: async (root, params) => {
			const limit = params && params.pagination && params.pagination.limit;

			const productSetupService = getProductSetupService();
			const products = (await productSetupService.getAllProducts(limit)).map(product =>
				LegacyProduct.hybridFromProduct(product)
			);

			return {
				products,
				pagination: {
					count: products.length,
					end_cursor: '',
					has_next_page: 'false',
					last_evaluated: ''
				}
			};
		}
	},
	useracllist: {
		type: userACLListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, useracl) {
			const userACLController = new UserACLController();

			return userACLController.listByAccount({
				pagination: useracl.pagination,
				fatal: list_fatal,
				search: useracl.search
			});
		}
	},
	useracllistbyrole: {
		type: userACLListType.graphObj,
		args: {
			role: {
				type: new GraphQLNonNull(GraphQLString)
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, useracl) {
			const userACLController = new UserACLController();

			return userACLController.listByRole({
				pagination: useracl.pagination,
				fatal: list_fatal,
				role: useracl.role
			});
		}
	},
	entityacllist: {
		type: entityACLListType.graphObj,
		args: {
			type: {
				type: new GraphQLNonNull(GraphQLString),
				description: 'type of entities'
			},
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, entityacl) {
			const entityACLController = new EntityACLController();
			const {
				type,
				pagination,
				search
			} = entityacl;

			return entityACLController.listByType({
				type,
				pagination,
				search,
				fatal: list_fatal
			});
		}
	},
	returnlist: {
		type: returnListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, returnentity) {
			const returnController = new ReturnController();

			return returnController.listByAccount({
				pagination: returnentity.pagination,
				fatal: list_fatal,
				search: returnentity.search
			});
		}
	},
	rebilllist: {
		type: rebillListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, rebill) {
			const rebillController = new RebillController();

			return rebillController.listByAccount({
				pagination: rebill.pagination,
				fatal: list_fatal,
				search: rebill.search
			});
		}
	},
	rebillpendinglist: {
		type: rebillListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, rebill) {
			const rebillController = new RebillController();

			return rebillController.getPendingRebills({
				pagination: rebill.pagination,
				fatal: list_fatal,
				search: rebill.search
			});
		}
	},
	shippingreceiptlist: {
		type: shippingReceiptListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, shippingreceipt) {
			const shippingReceiptController = new ShippingReceiptController();

			return shippingReceiptController.listByAccount({
				pagination: shippingreceipt.pagination,
				fatal: list_fatal,
				search: shippingreceipt.search
			});
		}
	},
	affiliatelist: {
		type: affiliateListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, affiliate) {
			const affiliateController = new AffiliateController();

			return affiliateController.listByAccount({
				pagination: affiliate.pagination,
				fatal: list_fatal,
				search: affiliate.search
			});
		}
	},
	trackerlist: {
		type: trackerListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, tracker) {
			const trackerController = new TrackerController();

			return trackerController.listByAccount({
				pagination: tracker.pagination,
				fatal: list_fatal,
				search: tracker.search
			});
		}
	},
	creditcardlist: {
		type: creditCardListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, creditcard) {
			const creditCardController = new CreditCardController();

			return creditCardController.listByAccount({
				pagination: creditcard.pagination,
				fatal: list_fatal,
				search: creditcard.search
			});
		}
	},
	merchantproviderlist: {
		type: merchantProviderListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, merchantprovider) {
			const merchantProviderController = new MerchantProviderController();

			return merchantProviderController.listByAccount({
				pagination: merchantprovider.pagination,
				fatal: list_fatal,
				search: merchantprovider.search
			});
		}
	},
	fulfillmentproviderlist: {
		type: fulfillmentProviderListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, fulfillmentprovider) {
			const fulfillmentProviderController = new FulfillmentProviderController();

			return fulfillmentProviderController.listByAccount({
				pagination: fulfillmentprovider.pagination,
				fatal: list_fatal,
				search: fulfillmentprovider.search
			});
		}
	},
	eventhooklist: {
		type: eventHookListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, eventhook) {
			const eventHookController = new EventHookController();

			return eventHookController.listByAccount({
				pagination: eventhook.pagination,
				fatal: list_fatal,
				search: eventhook.search
			});
		}
	},
	eventhooksharedlist: {
		type: eventHookListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, eventhook) {
			const eventHookController = new EventHookController();

			return eventHookController.listShared({
				pagination: eventhook.pagination
			});
		}
	},
	accesskeylist: {
		type: accessKeyListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, accesskey) {
			const accessKeyController = new AccessKeyController();

			return accessKeyController.listByAccount({
				pagination: accesskey.pagination,
				fatal: list_fatal,
				search: accesskey.search
			});
		}
	},
	accountlist: {
		type: accountListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, account) {
			const accountController = new AccountController();

			//Technical Debt: Needs consideration...
			return accountController.list({
				pagination: account.pagination,
				fatal: list_fatal
			});
		}
	},
	rolelist: {
		type: roleListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, role) {
			const roleController = new RoleController();

			return roleController.list({
				pagination: role.pagination,
				search: role.search,
				fatal: list_fatal
			});
		}
	},
	sharedrolelist: {
		type: roleListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: function(root, role) {
			const roleController = new RoleController();

			return roleController.listShared({
				pagination: role.pagination
			});
		}
	},
	customerlist: {
		type: customerListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, customer) {
			const customerController = new CustomerController();

			return customerController.listByAccount({
				pagination: customer.pagination,
				fatal: list_fatal,
				search: customer.search
			});
		}
	},
	customernotelist: {
		type: customerNoteListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, customernote) {
			const customerNoteController = new CustomerNoteController();

			return customerNoteController.listByAccount({
				pagination: customernote.pagination,
				fatal: list_fatal,
				search: customernote.search
			});
		}
	},
	merchantprovidergrouplist: {
		type: merchantProviderGroupListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, merchantprovidergroup) {
			const merchantProviderGroupController = new MerchantProviderGroupController();

			return merchantProviderGroupController.listByAccount({
				pagination: merchantprovidergroup.pagination,
				fatal: list_fatal,
				search: merchantprovidergroup.search
			});
		}
	},
	merchantprovidergroupassociationlist: {
		type: merchantProviderGroupAssociationListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, merchantprovidergroupassociation) {
			const merchantProviderGroupAssociationController = new MerchantProviderGroupAssociationController();

			return merchantProviderGroupAssociationController.listByAccount({
				pagination: merchantprovidergroupassociation.pagination,
				fatal: list_fatal,
				search: merchantprovidergroupassociation.search
			});
		}
	},
	merchantprovidergroupassociationbyentitylist: {
		type: merchantProviderGroupAssociationListType.graphObj,
		args: {
			entity: {
				type: new GraphQLNonNull(GraphQLString)
			},
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, merchantprovidergroupassociation) {
			const merchantProviderGroupAssociationController = new MerchantProviderGroupAssociationController();

			return merchantProviderGroupAssociationController.listByEntity({
				entity: merchantprovidergroupassociation.entity,
				pagination: merchantprovidergroupassociation.pagination,
				fatal: list_fatal,
				search: merchantprovidergroupassociation.search
			});
		}
	},
	productschedulelist: {
		type: productScheduleListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: async (root, { pagination: { limit } = {} }) => {
			const productSchedules = (await getProductScheduleService().getAll(
				limit
			)).map(productSchedule =>
				LegacyProductSchedule.hybridFromProductSchedule(productSchedule)
			);

			return {
				productschedules: productSchedules,
				pagination: {
					count: productSchedules.length,
					end_cursor: '',
					has_next_page: 'false',
					last_evaluated: ''
				}
			};
		}
	},
	transactionlist: {
		type: transactionListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, transaction) {

			const transactionController = new TransactionController();

			return transactionController.listByAccount({
				pagination: transaction.pagination,
				fatal: list_fatal,
				search: transaction.search
			});

		}
	},
	campaignlist: {
		type: campaignListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, campaign) {
			const campaignController = new CampaignController();

			return campaignController.listByAccount({
				pagination: campaign.pagination,
				fatal: list_fatal,
				search: campaign.search
			});
		}
	},
	sessionlist: {
		type: sessionListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, session) {
			const sessionController = new SessionController();

			return sessionController.listByAccount({
				pagination: session.pagination,
				fatal: list_fatal,
				search: session.search
			});
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
		resolve: async (root, { id }) => {
			const productSchedule = await getProductScheduleService().get(id);
			return LegacyProductSchedule.hybridFromProductSchedule(productSchedule);
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
		resolve: function(root, merchantprovider) {
			const merchantProviderController = new MerchantProviderController();

			return merchantProviderController.get({
				id: merchantprovider.id,
				fatal: get_fatal
			});
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
		resolve: function(root, fulfillmentprovider) {
			const fulfillmentProviderController = new FulfillmentProviderController();

			return fulfillmentProviderController.get({
				id: fulfillmentprovider.id,
				fatal: get_fatal
			});
		}
	},
	eventhook: {
		type: eventHookType.graphObj,
		args: {
			id: {
				description: 'id of the event hook',
				type: new GraphQLNonNull(GraphQLString)
			}
		},
		resolve: function(root, eventhook) {
			const eventHookController = new EventHookController();

			return eventHookController.get({
				id: eventhook.id,
				fatal: get_fatal
			});
		}
	},
	eventhookshared: {
		type: eventHookType.graphObj,
		args: {
			id: {
				description: 'id of the event hook',
				type: new GraphQLNonNull(GraphQLString)
			}
		},
		resolve: function(root, eventhook) {
			const eventHookController = new EventHookController();

			return eventHookController.getShared({
				id: eventhook.id
			});
		}
	},
	merchantprovidergroup: {
		type: merchantProviderGroupType.graphObj,
		args: {
			id: {
				description: 'id of the merchantprovidergroup',
				type: new GraphQLNonNull(GraphQLString)
			}
		},
		resolve: function(root, merchantprovidergroup) {
			const merchantProviderGroupController = new MerchantProviderGroupController();

			return merchantProviderGroupController.get({
				id: merchantprovidergroup.id,
				fatal: get_fatal
			});
		}
	},
	merchantprovidergroupassociation: {
		type: merchantProviderGroupAssociationType.graphObj,
		args: {
			id: {
				description: 'id of the merchantprovidergroup association',
				type: new GraphQLNonNull(GraphQLString)
			}
		},
		resolve: function(root, merchantprovidergroupassociation) {
			const merchantProviderGroupAssociationController = new MerchantProviderGroupAssociationController();

			return merchantProviderGroupAssociationController.get({
				id: merchantprovidergroupassociation.id,
				fatal: get_fatal
			});
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
		resolve: function(root, creditcard) {
			const creditCardController = new CreditCardController();

			return creditCardController.get({
				id: creditcard.id,
				fatal: get_fatal
			});
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
		resolve: function(root, campaign) {
			const campaignController = new CampaignController();

			return campaignController.get({
				id: campaign.id,
				fatal: get_fatal
			});
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
		resolve: function(root, affiliate) {
			const affiliateController = new AffiliateController();

			return affiliateController.get({
				id: affiliate.id,
				fatal: get_fatal
			});
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
		resolve: function(root, tracker) {
			const trackerController = new TrackerController();

			return trackerController.get({
				id: tracker.id,
				fatal: get_fatal
			});
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
		resolve: function(root, accesskey) {
			const accessKeyController = new AccessKeyController();

			return accessKeyController.get({
				id: accesskey.id,
				fatal: get_fatal
			});
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
		resolve: function(root, account) {
			const accountController = new AccountController();

			return accountController.get({
				id: account.id,
				fatal: get_fatal
			});
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
		resolve: function(root, role) {
			const roleController = new RoleController();

			return roleController.get({
				id: role.id,
				fatal: get_fatal
			});
		}
	},
	sharedrole: {
		type: roleType.graphObj,
		args: {
			id: {
				description: 'id of the role',
				type: GraphQLString
			}
		},
		resolve: function(root, role) {
			const roleController = new RoleController();

			return roleController.getShared({
				id: role.id
			});
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
		resolve: function(root, user) {
			//Technical Debt:  What is this logic for?
			if (_.has(user, "id")) {
				const userController = new UserController();

				return userController.get({
					id: user.id,
					fatal: get_fatal
				});
			} else {
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
		resolve: function(root, useracl) {
			//Technical Debt:  What is this logic for?
			if (_.has(useracl, 'id')) {
				const userACLController = new UserACLController();

				return userACLController.get({
					id: useracl.id,
					fatal: get_fatal
				});
			} else {
				return null;
			}
		}
	},
	entityacl: {
		type: entityACLType.graphObj,
		args: {
			entity: {
				description: 'id of the entityacl',
				type: GraphQLString
			}
		},
		resolve: function(root, entityacl) {
			if (_.has(entityacl, 'entity')) {
				const entityACLController = new EntityACLController();

				return entityACLController.get({
					id: entityacl.entity,
					fatal: get_fatal
				});
			} else {
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
			const userSettingController = new UserSettingController();
			if (_.has(usersetting, 'user')) {
				return userSettingController.get({
					id: usersetting.user,
					primary_key: 'user',
					fatal: get_fatal
				});
			} else {
				return userSettingController.get({
					id: usersetting.id,
					primary_key: 'id',
					fatal: get_fatal
				});
			}
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
			const userSigningStringController = new UserSigningStringController();

			return userSigningStringController.get({
				id: user_signing_string.id,
				fatal: get_fatal
			});
		}
	},
	//Note:  These are user bound
	usersigningstringlist: {
		type: userSigningStringListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, user_signing_strings) {
			const userSigningStringController = new UserSigningStringController();

			return userSigningStringController.listByUser({
				pagination: user_signing_strings.pagination,
				fatal: list_fatal,
				search: user_signing_strings.search
			});
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
				const notificationController = new NotificationController();

				return notificationController.get({
					id: notification.id,
					fatal: get_fatal
				});
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
				const notificationSettingController = new NotificationSettingController();

				return notificationSettingController.get({
					id: notificationsetting.user,
					primary_key: 'user',
					fatal: get_fatal
				});
			} else {
				const notificationSettingController = new NotificationSettingController();

				return notificationSettingController.get({
					id: notificationsetting.id,
					primary_key: 'id',
					fatal: get_fatal
				});
			}
		}
	},
	userdevicetokenlist: {
		type: userDeviceTokenListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: function(root, user_device_token) {

			const userDeviceTokenController = new UserDeviceTokenController();

			return userDeviceTokenController.listByUser({
				pagination: user_device_token.pagination,
				fatal: list_fatal,
				search: user_device_token.search
			});

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
				const userDeviceTokenController = new UserDeviceTokenController();

				return userDeviceTokenController.get({
					id: user_device_token.id,
					fatal: get_fatal
				});
			} else {
				return null;
			}
		}
	},
	tag: {
		type: tagType.graphObj,
		args: {
			id: {
				description: 'id of the tag',
				type: GraphQLString
			}
		},
		resolve: (root, tag) => {
			const tagController = new TagController();

			return tagController.get({
				id: tag.id,
				fatal: get_fatal
			});
		}
	},
	taglist: {
		type: tagListType.graphObj,
		args: {
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: (root, tags) => {
			const tagController = new TagController();
			const {
				pagination,
				search
			} = tags;

			return tagController.listByAccount({
				pagination,
				search,
				fatal: list_fatal
			});
		}
	},
	taglistbyentity: {
		type: tagListType.graphObj,
		args: {
			id: {
				type: new GraphQLNonNull(GraphQLString),
				description: 'id of the associated entity'
			},
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: (root, tags) => {
			const tagController = new TagController();
			const {
				id,
				pagination
			} = tags;

			return tagController.listByEntity({
				id,
				pagination,
				fatal: list_fatal
			});
		}
	},
	taglistbykey: {
		type: tagListType.graphObj,
		args: {
			key: {
				type: new GraphQLNonNull(GraphQLString),
				description: 'key of the tag'
			},
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: (root, tags) => {
			const tagController = new TagController();
			const {
				key,
				pagination,
				search
			} = tags;

			return tagController.listByKey({
				key,
				pagination,
				search
			});
		}
	},
	taglistbykeyfuzzy: {
		type: tagListType.graphObj,
		args: {
			key: {
				type: new GraphQLNonNull(GraphQLString),
				description: 'key of the tag'
			},
			pagination: {
				type: paginationInputType.graphObj
			},
			search: {
				type: entitySearchInputType.graphObj
			}
		},
		resolve: (root, tags) => {
			const tagController = new TagController();
			const {
				key,
				pagination,
				search
			} = tags;

			return tagController.listByKeyFuzzy({
				key,
				pagination,
				search
			});
		}
	},
	order: {
		type: orderType.graphObj,
		args: {
			id: {
				type: new GraphQLNonNull(GraphQLString),
				description: 'The order id.'
			}
		},
		resolve: (root, order) => {
			const orderHelperController = new OrderHelperController();
			return orderHelperController.getOrder(order);
		}
	},
	orderbysessionlist: {
		type: orderListType.graphObj,
		args: {
			session: {
				type: new GraphQLNonNull(GraphQLString),
				description: 'The session id.'
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: (root, order) => {
			const {session, pagination} = order;
			const orderHelperController = new OrderHelperController();
			return orderHelperController.listBySession({session_id: session, pagination});
		}
	},
	orderbycustomerlist: {
		type: orderListType.graphObj,
		args: {
			customer: {
				type: new GraphQLNonNull(GraphQLString),
				description: 'The customer id.'
			},
			pagination: {
				type: paginationInputType.graphObj
			}
		},
		resolve: (root, order) => {
			const {customer, pagination} = order;
			const orderHelperController = new OrderHelperController();
			return orderHelperController.listByCustomer({customer_id: customer, pagination});
		}
	},
	ipcheck: {
		type: ipCheckType.graphObj,
		args: {},
		resolve: () => {
			const ipCheckController = new IPCheckController();

			return ipCheckController.checkIP();
		}
	},
	connectiontest: {
		type: connectionTestType.graphObj,
		args: {},
		resolve:() => {
			return true;
		}
	},
	accountdetails: {
		type: accountDetailsType.graphObj,
		resolve: () => {
			const accountDetailsController = new AccountDetailsController();

			return accountDetailsController.getOrCreate();
		}
	},
}, analyticsQueryType)

module.exports.graphObj = new GraphQLObjectType({
	name: 'Query',
	fields: () => fields
});
