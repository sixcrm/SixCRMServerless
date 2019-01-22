const { getProductSetupService } = require('@6crm/sixcrm-product-setup');
let SMTPProviderInputType = require('./smtpprovider/SMTPProviderInputType');
let SMTPProviderType = require('./smtpprovider/SMTPProviderType');

let accessKeyInputType = require('./accesskey/accessKeyInputType');
let accessKeyType = require('./accesskey/accessKeyType');

let accountInputType = require('./account/accountInputType');
let accountType = require('./account/accountType');
let accountActivationType = require('./account/accountActivationType');
let accountDeactivationType = require('./account/accountDeactivationType');
let accountCancelDeactivationType = require('./account/accountCancelDeactivationType');

let affiliateInputType = require('./affiliate/affiliateInputType');
let affiliateType = require('./affiliate/affiliateType');

let trackerInputType = require('./tracker/trackerInputType');
let trackerType = require('./tracker/trackerType');

let campaignInputType = require('./campaign/campaignInputType');
let campaignType = require('./campaign/campaignType');

let creditCardInputType = require('./creditcard/creditCardInputType');
let creditCardPartialInputType = require('./creditcard/creditCardPartialInputType');
let creditCardType = require('./creditcard/creditCardType');

let customerInputType = require('./customer/customerInputType');
let customerType = require('./customer/customerType');

let customerNoteInputType = require('./customernote/customerNoteInputType');
let customerNoteType = require('./customernote/customerNoteType');

let emailTemplateInputType = require('./emailtemplate/emailTemplateInputType');
let emailTemplateType = require('./emailtemplate/emailTemplateType');
let emailTemplateAssociationEntityTypeEnum = require('./emailtemplate/emailTemplateAssociationEntityTypeEnum');

let fulfillmentProviderInputType = require('./fulfillmentprovider/fulfillmentProviderInputType');
let fulfillmentProviderType = require('./fulfillmentprovider/fulfillmentProviderType');

let eventHookInputType = require('./eventhook/eventHookInputType');
let eventHookType = require('./eventhook/eventHookType');

let fulfillmentProviderValidationType = require('./fulfillmentprovider/fulfillmentProviderValidationType');

let deleteOutputType = require('./general/deleteOutputType');

let merchantProviderGroupInputType = require('./merchantprovidergroup/merchantProviderGroupInputType');
let merchantProviderGroupType = require('./merchantprovidergroup/merchantProviderGroupType');

let merchantProviderGroupAssociationInputType = require('./merchantprovidergroupassociation/merchantProviderGroupAssociationInputType');
let merchantProviderGroupAssociationType = require('./merchantprovidergroupassociation/merchantProviderGroupAssociationType');

let merchantProviderInputType = require('./merchantprovider/merchantProviderInputType');
let merchantProviderType = require('./merchantprovider/merchantProviderType');

let notificationInputType = require('./notification/notificationInputType');
let notificationType = require('./notification/notificationType');

let notificationSettingType = require('./notificationsetting/notificationSettingType');
let notificationSettingInputType = require('./notificationsetting/notificationSettingInputType');

let productInputType = require('./product/productInputType');
let productType = require('./product/productType');

let productScheduleInputType = require('./productschedule/productScheduleInputType');
let productScheduleType = require('./productschedule/productScheduleType');

let rebillInputType = require('./rebill/rebillInputType');
let rebillType = require('./rebill/rebillType');

let returnInputType = require('./return/returnInputType');
let returnType = require('./return/returnType');

let roleInputType = require('./role/roleInputType');
let roleType = require('./role/roleType');

let shippingReceiptInputType = require('./shippingreceipt/shippingReceiptInputType');
let shippingReceiptType = require('./shippingreceipt/shippingReceiptType');

let transactionChargebackInputType = require('./transaction/transactionChargebackInputType');
let transactionType = require('./transaction/transactionType');

let entityACLInputType = require('./entityacl/entityACLInputType');
let entityACLType = require('./entityacl/entityACLType');

let userACLInputType = require('./useracl/userACLInputType');
let userACLTermsAndConditionsInputType = require('./useracl/userACLTermsAndConditionsInputType');
let userACLType = require('./useracl/userACLType');
let userInputType = require('./user/userInputType');
let userInviteInputType = require('./userinvite/userInviteInputType');
let userInviteResendInputType = require('./userinvite/userInviteResendInputType');
let userInviteType = require('./userinvite/userInviteType');
let userType = require('./user/userType');
let userDeviceTokenType = require('./userdevicetoken/userDeviceTokenType');
let userDeviceTokenInputType = require('./userdevicetoken/userDeviceTokenInputType');
let userSettingType = require('./usersetting/userSettingType');
let userSettingInputType = require('./usersetting/userSettingInputType');

let userSigningStringType = require('./usersigningstring/userSigningStringType');
let userSigningStringInputType = require('./usersigningstring/userSigningStringInputType');

let sessionInputType = require('./session/sessionInputType');
let sessionType = require('./session/sessionType');
let sessionCancelInputType = require('./session/sessionCancelInputType');

const tagInputType = require('./tag/tagInputType');
const tagType = require('./tag/tagType');

const accountDetailsInputType = require('./accountdetails/accountDetailsInputType');
const accountDetailsType = require('./accountdetails/accountDetailsType');

//Register
let refundType = require('./register/refund/refundType');
let refundInputType = require('./register/refund/refundInputType');
let reverseType = require('./register/reverse/reverseType');
let reverseInputType = require('./register/reverse/reverseInputType');

let SMTPValidationInputType = require('./smtpvalidation/SMTPValidationInputType')
let SMTPValidationType = require('./smtpvalidation/SMTPValidationType');

let accountImageType = require('./accountimage/accountImageType');
let accountImageInputType = require('./accountimage/accountImageInputType');

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

// Entity Controllers
const CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
const CampaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
const CustomerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');
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
const NotificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');
const NotificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');
const AffiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');
const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
const UserACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');
const UserDeviceTokenController = global.SixCRM.routes.include('controllers', 'entities/UserDeviceToken');
const UserSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');
const UserSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');
const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
const ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const ReturnController = global.SixCRM.routes.include('controllers', 'entities/Return.js');
const RoleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
const SMTPProviderController = global.SixCRM.routes.include('entities', 'SMTPProvider.js');
const TagController = global.SixCRM.routes.include('controllers', 'entities/Tag.js');
const TrackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');
const AccountDetailsController = global.SixCRM.routes.include('controllers', 'entities/AccountDetails.js');

const InviteHelperController = global.SixCRM.routes.include('helpers', 'entities/invite/Invite.js');
const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Mutation',
	fields: () => ({
		putaccountimage: {
			type: accountImageType.graphObj,
			description: 'puts a account image',
			args: {
				accountimage: {
					type: accountImageInputType.graphObj
				}
			},
			resolve: (value, accountimage) => {
				const AccountImageHelperController = global.SixCRM.routes.include('helpers', 'resources/accountimages/AccountImages.js');
				let accountImageHelperController = new AccountImageHelperController();

				return accountImageHelperController.upload({
					data: accountimage.accountimage.data
				});
			}
		},
		markchargeback: {
			type: transactionType.graphObj,
			description: 'Sets the chargeback status of a customer transaction record.',
			args: {
				chargeback: {
					type: transactionChargebackInputType.graphObj
				}
			},
			resolve: (value, args) => {

				let TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
				let transactionHelperController = new TransactionHelperController();

				return transactionHelperController.markTransactionChargeback({
					transactionid: args.chargeback.transaction,
					chargeback_status: args.chargeback.chargeback_status
				});

			}
		},
		refund: {
			type: refundType.graphObj,
			description: 'Refunds a customer funds based on pre-existing customer transaction.',
			args: {
				refund: {
					type: refundInputType.graphObj
				}
			},
			resolve: (value, refund) => {
				const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
				let registerController = new RegisterController();

				return registerController.refundTransaction(refund.refund).then(refund => {
					return {
						transaction: refund.getTransactions()[0],
						processor_response: refund.getProcessorResponses()[0]
					}
				})
			}
		},
		reverse: {
			type: reverseType.graphObj,
			description: 'Reverses a customer transaction with the merchant provider.',
			args: {
				reverse: {
					type: reverseInputType.graphObj
				}
			},
			resolve: (value, reverse) => {
				const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
				let registerController = new RegisterController();

				return registerController.reverseTransaction(reverse.reverse);
			}
		},
		inviteuser: {
			type: userInviteType.graphObj,
			description: 'Invites a new user to the site.',
			args: {
				userinvite: {
					type: userInviteInputType.graphObj
				}
			},
			resolve: (value, userinvite) => {
				const inviteHelperController = new InviteHelperController();
				return inviteHelperController.invite({
					user_invite: userinvite.userinvite
				});
			}
		},
		inviteresend: {
			type: userInviteType.graphObj,
			description: 'Resend pending user invite.',
			args: {
				userinvite: {
					type: userInviteResendInputType.graphObj
				}
			},
			resolve: (value, userinvite) => {
				const inviteHelperController = new InviteHelperController();
				return inviteHelperController.inviteResend({
					user_invite: userinvite.userinvite
				});
			}
		},
		smtpvalidation: {
			type: SMTPValidationType.graphObj,
			description: 'Validates a SMTP Provider configuration',
			args: {
				smtpvalidation: {
					type: SMTPValidationInputType.graphObj
				}
			},
			resolve: function(root, args) {
				const smtpProviderController = new SMTPProviderController();

				return smtpProviderController.validateSMTPProvider(args.smtpvalidation);
			}
		},
		fulfillmentprovidervalidation: {
			type: fulfillmentProviderValidationType.graphObj,
			description: 'Validates a Fulfillment Provider configuration',
			args: {
				id: {
					type: GraphQLString
				}
			},
			resolve: function(root, args) {
				const FulfillmentProviderHelperController = global.SixCRM.routes.include('helpers', 'entities/fulfillmentprovider/FulfillmentProvider.js');
				let fulfillmentProviderHelperController = new FulfillmentProviderHelperController();

				return fulfillmentProviderHelperController.validate({
					fulfillment_provider_id: args.id
				});

			}
		},
		//Note: Fix
		createuser: {
			type: userType.graphObj,
			description: 'Adds a new user.',
			args: {
				user: {
					type: userInputType.graphObj
				}
			},
			resolve: (value, user) => {
				const userController = new UserController();

				return userController.create({
					entity: user.user
				});
			}
		},
		//Note: Fix
		createuserstrict: {
			type: userType.graphObj,
			description: 'Adds a new user.',
			args: {
				user: {
					type: userInputType.graphObj
				}
			},
			resolve: (value, user) => {
				const userController = new UserController();

				return userController.createStrict(user.user);
			}
		},
		updateuser: {
			type: userType.graphObj,
			description: 'Updates a user.',
			args: {
				user: {
					type: userInputType.graphObj
				}
			},
			resolve: (value, user) => {
				const userController = new UserController();

				return userController.update({
					entity: user.user
				});
			}
		},
		deleteuser: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a user.',
			args: {
				id: {
					description: 'id of the user',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, user) => {
				var id = user.id;
				const userController = new UserController();

				return userController.delete({
					id: id
				});
			}
		},
		createuseracl: {
			type: userACLType.graphObj,
			description: 'Adds a new user acl.',
			args: {
				useracl: {
					type: userACLInputType.graphObj
				}
			},
			resolve: (value, useracl) => {
				const userACLController = new UserACLController();

				return userACLController.create({
					entity: useracl.useracl
				});
			}
		},
		updateuseracl: {
			type: userACLType.graphObj,
			description: 'Updates a user acl.',
			args: {
				useracl: {
					type: userACLInputType.graphObj
				}
			},
			resolve: (value, useracl) => {
				const userACLController = new UserACLController();

				return userACLController.update({
					entity: useracl.useracl
				});
			}
		},
		updateuseracltermsandconditions: {
			type: userACLType.graphObj,
			description: 'Updates user acl terms and conditions.',
			args: {
				useracltermsandconditions: {
					type: userACLTermsAndConditionsInputType.graphObj
				}
			},
			resolve: (value, input) => {
				const userACLController = new UserACLController();

				return userACLController.updateTermsAndConditions(input.useracltermsandconditions);
			}
		},
		deleteuseracl: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a user acl.',
			args: {
				id: {
					description: 'id of the useracl',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, useracl) => {
				var id = useracl.id;
				const userACLController = new UserACLController();

				return userACLController.delete({
					id: id
				});
			}
		},
		createentityacl: {
			type: entityACLType.graphObj,
			description: 'Adds a new entity acl.',
			args: {
				entityacl: {
					type: entityACLInputType.graphObj
				}
			},
			resolve: (value, entityacl) => {
				const entityACLController = new EntityACLController();

				return entityACLController.create({
					entity: entityacl.entityacl
				});
			}
		},
		updateentityacl: {
			type: entityACLType.graphObj,
			description: 'Updates an entity acl.',
			args: {
				entityacl: {
					type: entityACLInputType.graphObj
				}
			},
			resolve: (value, entityacl) => {
				const entityACLController = new EntityACLController();

				return entityACLController.update({
					entity: entityacl.entityacl
				});
			}
		},
		deleteentityacl: {
			type: deleteOutputType.graphObj,
			description: 'Deletes an entity acl.',
			args: {
				entity: {
					description: 'id of the entityacl',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, entityacl) => {
				const entity = entityacl.entity;
				const entityACLController = new EntityACLController();

				return entityACLController.delete({
					id: entity
				});
			}
		},
		createproduct: {
			type: productType.graphObj,
			description: 'Adds a new product.',
			args: {
				product: {
					type: productInputType.graphObj
				}
			},
			resolve: async (value, { product }) => {
				const productSetupService = getProductSetupService();
				const { id } = await productSetupService.createProduct(product);
				return productSetupService.getProduct(id);
			}
		},
		updateproduct: {
			type: productType.graphObj,
			description: 'Updates a product.',
			args: {
				product: {
					type: productInputType.graphObj
				}
			},
			resolve: async (value, { product }) => {
				const productSetupService = getProductSetupService();
				await productSetupService.updateProduct(product);
				return productSetupService.getProduct(product.id);
			}
		},
		deleteproduct: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a product.',
			args: {
				id: {
					description: 'id of the product',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, { id }) => getProductSetupService().deleteProduct(id)
		},
		createaccesskey: {
			type: accessKeyType.graphObj,
			description: 'Adds a new accesskey.',
			args: {
				accesskey: {
					type: accessKeyInputType.graphObj
				}
			},
			resolve: (value, accesskey) => {
				const accessKeyController = new AccessKeyController();

				return accessKeyController.create({
					entity: accesskey.accesskey
				});
			}
		},
		updateaccesskey: {
			type: accessKeyType.graphObj,
			description: 'Updates a accesskey.',
			args: {
				accesskey: {
					type: accessKeyInputType.graphObj
				}
			},
			resolve: (value, accesskey) => {
				const accessKeyController = new AccessKeyController();

				return accessKeyController.update({
					entity: accesskey.accesskey
				});
			}
		},
		deleteaccesskey: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a accesskey.',
			args: {
				id: {
					description: 'id of the accesskey',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, accesskey) => {
				var id = accesskey.id;
				const accessKeyController = new AccessKeyController();

				return accessKeyController.delete({
					id: id
				});
			}
		},
		createnewaccount: {
			type: accountType.graphObj,
			description: 'Adds a new account.',
			args: {
				account: {
					type: accountInputType.graphObj
				},
				user: {
					type: userInputType.graphObj
				}
			},
			resolve: (value, args) => {
				const accountHelperController = new AccountHelperController();
				return accountHelperController.createNewAccount({account: args.account, user: args.user});
			}
		},
		createaccount: {
			type: accountType.graphObj,
			description: 'Adds a new account.',
			args: {
				account: {
					type: accountInputType.graphObj
				}
			},
			resolve: (value, account) => {
				const accountController = new AccountController();

				return accountController.create({
					entity: account.account
				});
			}
		},
		updateaccount: {
			type: accountType.graphObj,
			description: 'Updates a account.',
			args: {
				account: {
					type: accountInputType.graphObj
				}
			},
			resolve: (value, account) => {
				const accountController = new AccountController();

				return accountController.update({
					entity: account.account,
					ignore_updated_at: true
				});
			}
		},
		activateaccount:{
			type: accountActivationType.graphObj,
			description:  'Activates a account',
			args:{
				account: {
					type: new GraphQLNonNull(GraphQLString),
					description:  'The account to activate'
				},
				session:{
					type: new GraphQLNonNull(GraphQLString),
					description: 'The session containing subscription for activation'
				}
			},
			resolve:(value, args) => {
				const accountHelperController = new AccountHelperController();
				return accountHelperController.activateAccount({account: args.account, session: args.session});
			}
		},
		deactivateaccount:{
			type: accountDeactivationType.graphObj,
			description:  'Schedules a account for deactivation',
			args:{
				account: {
					type: new GraphQLNonNull(GraphQLString),
					description:  'The account to deactivate'
				}
			},
			resolve:(value, args) => {
				const accountHelperController = new AccountHelperController();
				return accountHelperController.deactivateAccount({account: args.account});
			}
		},
		cancelaccountdeactivation:{
			type: accountCancelDeactivationType.graphObj,
			description:  'Cancels account for deactivation',
			args:{
				account: {
					type: new GraphQLNonNull(GraphQLString),
					description:  'The account to cancel deactivation'
				}
			},
			resolve:(value, args) => {
				const accountHelperController = new AccountHelperController();
				return accountHelperController.cancelDeactivation({account: args.account});
			}
		},
		createrole: {
			type: roleType.graphObj,
			description: 'Adds a new role.',
			args: {
				role: {
					type: roleInputType.graphObj
				}
			},
			resolve: (value, role) => {
				const roleController = new RoleController();

				return roleController.create({
					entity: role.role
				});
			}
		},
		updaterole: {
			type: roleType.graphObj,
			description: 'Updates a role.',
			args: {
				role: {
					type: roleInputType.graphObj
				}
			},
			resolve: (value, role) => {
				const roleController = new RoleController();

				return roleController.update({
					entity: role.role
				});
			}
		},
		deleterole: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a role.',
			args: {
				id: {
					description: 'id of the role',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, role) => {
				var id = role.id;
				const roleController = new RoleController();

				return roleController.delete({
					id: id
				});
			}
		},
		createtracker: {
			type: trackerType.graphObj,
			description: 'Adds a new tracker.',
			args: {
				tracker: {
					type: trackerInputType.graphObj
				}
			},
			resolve: (value, tracker) => {
				const trackerController = new TrackerController();

				return trackerController.create({
					entity: tracker.tracker
				});
			}
		},
		updatetracker: {
			type: trackerType.graphObj,
			description: 'Updates a tracker.',
			args: {
				tracker: {
					type: trackerInputType.graphObj
				}
			},
			resolve: (value, tracker) => {
				const trackerController = new TrackerController();

				return trackerController.update({
					entity: tracker.tracker
				});
			}
		},
		deletetracker: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a tracker.',
			args: {
				id: {
					description: 'id of the tracker',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, tracker) => {
				var id = tracker.id;
				const trackerController = new TrackerController();

				return trackerController.delete({
					id: id
				});
			}
		},
		createaffiliate: {
			type: affiliateType.graphObj,
			description: 'Adds a new affiliate.',
			args: {
				affiliate: {
					type: affiliateInputType.graphObj
				}
			},
			resolve: (value, affiliate) => {
				const affiliateController = new AffiliateController();

				return affiliateController.create({
					entity: affiliate.affiliate
				});
			}
		},
		updateaffiliate: {
			type: affiliateType.graphObj,
			description: 'Updates a affiliate.',
			args: {
				affiliate: {
					type: affiliateInputType.graphObj
				}
			},
			resolve: (value, affiliate) => {
				const affiliateController = new AffiliateController();

				return affiliateController.update({
					entity: affiliate.affiliate
				});
			}
		},
		deleteaffiliate: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a affiliate.',
			args: {
				id: {
					description: 'id of the affiliate',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, affiliate) => {
				var id = affiliate.id;
				const affiliateController = new AffiliateController();

				return affiliateController.delete({
					id: id
				});
			}
		},
		createsmtpprovider: {
			type: SMTPProviderType.graphObj,
			description: 'Adds a new SMTP Provider.',
			args: {
				smtpprovider: {
					type: SMTPProviderInputType.graphObj
				}
			},
			resolve: (value, smtpprovider) => {
				const smtpProviderController = new SMTPProviderController();

				return smtpProviderController.create({
					entity: smtpprovider.smtpprovider
				});
			}
		},
		updatesmtpprovider: {
			type: SMTPProviderType.graphObj,
			description: 'Updates a SMTP Provider.',
			args: {
				smtpprovider: {
					type: SMTPProviderInputType.graphObj
				}
			},
			resolve: (value, smtpprovider) => {
				const smtpProviderController = new SMTPProviderController();

				return smtpProviderController.update({
					entity: smtpprovider.smtpprovider
				});
			}
		},
		deletesmtpprovider: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a SMTP Provider.',
			args: {
				id: {
					description: 'id of the smtpprovider',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, smtpprovider) => {
				var id = smtpprovider.id;
				const smtpProviderController = new SMTPProviderController();

				return smtpProviderController.delete({
					id: id
				});
			}
		},
		createmerchantprovider: {
			type: merchantProviderType.graphObj,
			description: 'Adds a new Merchant Provider.',
			args: {
				merchantprovider: {
					type: merchantProviderInputType.graphObj
				}
			},
			resolve: (value, merchantprovider) => {
				const merchantProviderController = new MerchantProviderController();

				return merchantProviderController.create({
					entity: merchantprovider.merchantprovider
				});
			}
		},
		updatemerchantprovider: {
			type: merchantProviderType.graphObj,
			description: 'Updates a Merchant Provider.',
			args: {
				merchantprovider: {
					type: merchantProviderInputType.graphObj
				}
			},
			resolve: (value, merchantprovider) => {
				const merchantProviderController = new MerchantProviderController();

				return merchantProviderController.update({
					entity: merchantprovider.merchantprovider
				});
			}
		},
		deletemerchantprovider: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a Merchant Provider.',
			args: {
				id: {
					description: 'id of the merchantprovider',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, merchantprovider) => {
				var id = merchantprovider.id;
				const merchantProviderController = new MerchantProviderController();

				return merchantProviderController.delete({
					id: id
				});
			}
		},
		createeventhook: {
			type: eventHookType.graphObj,
			description: 'Adds a new Event Hook.',
			args: {
				eventhook: {
					type: eventHookInputType.graphObj
				}
			},
			resolve: (value, eventhook) => {
				const eventHookController = new EventHookController();

				return eventHookController.create({
					entity: eventhook.eventhook
				});
			}
		},
		updateeventhook: {
			type: eventHookType.graphObj,
			description: 'Updates a Event Hook.',
			args: {
				eventhook: {
					type: eventHookInputType.graphObj
				}
			},
			resolve: (value, eventhook) => {
				const eventHookController = new EventHookController();

				return eventHookController.update({
					entity: eventhook.eventhook
				});
			}
		},
		deleteeventhook: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a Event Hook.',
			args: {
				id: {
					description: 'id of the event hook',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, eventhook) => {
				var id = eventhook.id;
				const eventHookController = new EventHookController();

				return eventHookController.delete({
					id: id
				});
			}
		},
		createfulfillmentprovider: {
			type: fulfillmentProviderType.graphObj,
			description: 'Adds a new Fulfillment Provider.',
			args: {
				fulfillmentprovider: {
					type: fulfillmentProviderInputType.graphObj
				}
			},
			resolve: (value, fulfillmentprovider) => {
				const fulfillmentProviderController = new FulfillmentProviderController();

				return fulfillmentProviderController.create({
					entity: fulfillmentprovider.fulfillmentprovider
				});
			}
		},
		updatefulfillmentprovider: {
			type: fulfillmentProviderType.graphObj,
			description: 'Updates a Fulfillment Provider.',
			args: {
				fulfillmentprovider: {
					type: fulfillmentProviderInputType.graphObj
				}
			},
			resolve: (value, fulfillmentprovider) => {
				const fulfillmentProviderController = new FulfillmentProviderController();

				return fulfillmentProviderController.update({
					entity: fulfillmentprovider.fulfillmentprovider
				});
			}
		},
		deletefulfillmentprovider: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a Fulfillment Provider.',
			args: {
				id: {
					description: 'id of the fulfillmentprovider',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, fulfillmentprovider) => {
				var id = fulfillmentprovider.id;
				const fulfillmentProviderController = new FulfillmentProviderController();

				return fulfillmentProviderController.delete({
					id: id
				});
			}
		},
		createemailtemplate: {
			type: emailTemplateType.graphObj,
			description: 'Adds a new email template.',
			args: {
				emailtemplate: {
					type: emailTemplateInputType.graphObj
				}
			},
			resolve: (value, emailtemplate) => {
				const emailTemplateController = new EmailTemplateController();

				return emailTemplateController.create({
					entity: emailtemplate.emailtemplate
				});
			}
		},
		updateemailtemplate: {
			type: emailTemplateType.graphObj,
			description: 'Updates a Email Template.',
			args: {
				emailtemplate: {
					type: emailTemplateInputType.graphObj
				}
			},
			resolve: (value, emailtemplate) => {
				const emailTemplateController = new EmailTemplateController();

				return emailTemplateController.update({
					entity: emailtemplate.emailtemplate
				});
			}
		},
		updatebuiltinemailtemplate: {
			type: emailTemplateType.graphObj,
			description: 'Updates a Email Template.',
			args: {
				emailtemplate: {
					type: emailTemplateInputType.graphObj
				}
			},
			resolve: (value, emailtemplate) => {
				const emailTemplateController = new EmailTemplateController();

				return emailTemplateController.updateBuiltIn({
					entity: emailtemplate.emailtemplate
				});
			}
		},
		deleteemailtemplate: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a Email Template.',
			args: {
				id: {
					description: 'id of the email template',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, emailtemplate) => {
				var id = emailtemplate.id;
				const emailTemplateController = new EmailTemplateController();

				return emailTemplateController.delete({
					id: id
				});
			}
		},
		addemailtemplateassociation: {
			type: emailTemplateType.graphObj,
			args: {
				emailtemplateid: {
					type: new GraphQLNonNull(GraphQLString)
				},
				entitytype: {
					type: new GraphQLNonNull(emailTemplateAssociationEntityTypeEnum.graphObj)
				},
				entityid: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, args) => {
				const emailTemplateController = new EmailTemplateController();

				return emailTemplateController.get({
					id: args.emailtemplateid, fatal: true
				}).then(emailtemplate => {
					if (emailtemplate.built_in && global.account !== '*') {
						const disallowedTypes = ['products', 'product_schedules'];
						if (disallowedTypes.includes(args.entitytype)) {
							throw new Error('This association is not allowed for built-in template.');
						}
					}

					emailtemplate[args.entitytype] = [...(emailtemplate[args.entitytype] || []).filter(i => i !== args.entityid), args.entityid];

					return emailTemplateController.updateAssociation({entity: emailtemplate})
				});
			}
		},
		removeemailtemplateassociation: {
			type: emailTemplateType.graphObj,
			args: {
				emailtemplateid: {
					type: new GraphQLNonNull(GraphQLString)
				},
				entitytype: {
					type: new GraphQLNonNull(emailTemplateAssociationEntityTypeEnum.graphObj)
				},
				entityid: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, args) => {
				const emailTemplateController = new EmailTemplateController();

				return emailTemplateController.get({
					id: args.emailtemplateid
				}).then(emailtemplate => {
					emailtemplate[args.entitytype] = (emailtemplate[args.entitytype] || []).filter(i => i !== args.entityid);

					return emailTemplateController.updateAssociation({entity: emailtemplate})
				});
			}
		},
		createcreditcard: {
			type: creditCardType.graphObj,
			description: 'Adds a new credit card.',
			args: {
				creditcard: {
					type: creditCardInputType.graphObj
				}
			},
			resolve: (value, creditcard) => {
				const creditCardController = new CreditCardController();

				return creditCardController.create({
					entity: creditcard.creditcard
				});
			}
		},
		updatecreditcard: {
			type: creditCardType.graphObj,
			description: 'Updates a Credit Card.',
			args: {
				creditcard: {
					type: creditCardInputType.graphObj
				}
			},
			resolve: (value, creditcard) => {
				const creditCardController = new CreditCardController();

				return creditCardController.update({
					entity: creditcard.creditcard
				});
			}
		},
		updatecreditcardpartial: {
			type: creditCardType.graphObj,
			description: 'Updates a Credit Card Partially.',
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLString)
				},
				creditcard: {
					type: creditCardPartialInputType.graphObj
				}
			},
			resolve: (value, args) => {
				const creditCardController = new CreditCardController();

				return creditCardController.updateProperties({
					id: args.id,
					properties: args.creditcard
				});
			}
		},
		deletecreditcard: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a Credit Card.',
			args: {
				id: {
					description: 'id of the creditcard',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, creditcard) => {
				var id = creditcard.id;
				const creditCardController = new CreditCardController();

				return creditCardController.delete({
					id: id
				});
			}
		},
		createcustomer: {
			type: customerType.graphObj,
			description: 'Adds a new customer.',
			args: {
				customer: {
					type: customerInputType.graphObj
				}
			},
			resolve: (value, customer) => {
				const customerController = new CustomerController();

				return customerController.create({
					entity: customer.customer
				});
			}
		},
		updatecustomer: {
			type: customerType.graphObj,
			description: 'Updates a customer.',
			args: {
				customer: {
					type: customerInputType.graphObj
				}
			},
			resolve: (value, customer) => {
				const customerController = new CustomerController();

				return customerController.update({
					entity: customer.customer
				});
			}
		},
		deletecustomer: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a customer.',
			args: {
				id: {
					description: 'id of the customer',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, customer) => {
				var id = customer.id;
				const customerController = new CustomerController();

				return customerController.delete({
					id: id
				});
			}
		},
		createcustomernote: {
			type: customerNoteType.graphObj,
			description: 'Adds a new customernote.',
			args: {
				customernote: {
					type: customerNoteInputType.graphObj
				}
			},
			resolve: (value, customernote) => {
				const customerNoteController = new CustomerNoteController();

				return customerNoteController.create({
					entity: customernote.customernote
				});
			}
		},
		updatecustomernote: {
			type: customerNoteType.graphObj,
			description: 'Updates a customer note.',
			args: {
				customernote: {
					type: customerNoteInputType.graphObj
				}
			},
			resolve: (value, customernote) => {
				const customerNoteController = new CustomerNoteController();

				return customerNoteController.update({
					entity: customernote.customernote
				});
			}
		},
		deletecustomernote: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a customer note.',
			args: {
				id: {
					description: 'id of the customer note',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, customernote) => {
				var id = customernote.id;
				const customerNoteController = new CustomerNoteController();

				return customerNoteController.delete({
					id: id
				});
			}
		},
		createmerchantprovidergroup: {
			type: merchantProviderGroupType.graphObj,
			description: 'Adds a new merchantprovidergroup.',
			args: {
				merchantprovidergroup: {
					type: merchantProviderGroupInputType.graphObj
				}
			},
			resolve: (value, merchantprovidergroup) => {
				const merchantProviderGroupController = new MerchantProviderGroupController();

				return merchantProviderGroupController.create({
					entity: merchantprovidergroup.merchantprovidergroup
				});
			}
		},
		updatemerchantprovidergroup: {
			type: merchantProviderGroupType.graphObj,
			description: 'Updates a merchantprovidergroup.',
			args: {
				merchantprovidergroup: {
					type: merchantProviderGroupInputType.graphObj
				}
			},
			resolve: (value, merchantprovidergroup) => {
				const merchantProviderGroupController = new MerchantProviderGroupController();

				return merchantProviderGroupController.update({
					entity: merchantprovidergroup.merchantprovidergroup
				});
			}
		},
		deletemerchantprovidergroup: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a merchantprovidergroup.',
			args: {
				id: {
					description: 'id of the merchantprovidergroup',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, merchantprovidergroup) => {
				var id = merchantprovidergroup.id;
				const merchantProviderGroupController = new MerchantProviderGroupController();

				return merchantProviderGroupController.delete({
					id: id
				});
			}
		},
		createmerchantprovidergroupassociation: {
			type: merchantProviderGroupAssociationType.graphObj,
			description: 'Adds a new merchantprovidergroup association.',
			args: {
				merchantprovidergroupassociation: {
					type: merchantProviderGroupAssociationInputType.graphObj
				}
			},
			resolve: (value, merchantprovidergroupassociation) => {
				const merchantProviderGroupAssociationController = new MerchantProviderGroupAssociationController();

				return merchantProviderGroupAssociationController.create({
					entity: merchantprovidergroupassociation.merchantprovidergroupassociation
				});
			}
		},
		updatemerchantprovidergroupassociation: {
			type: merchantProviderGroupAssociationType.graphObj,
			description: 'Updates a merchantprovidergroup association.',
			args: {
				merchantprovidergroupassociation: {
					type: merchantProviderGroupAssociationInputType.graphObj
				}
			},
			resolve: (value, merchantprovidergroupassociation) => {
				const merchantProviderGroupAssociationController = new MerchantProviderGroupAssociationController();

				return merchantProviderGroupAssociationController.update({
					entity: merchantprovidergroupassociation.merchantprovidergroupassociation
				});
			}
		},
		deletemerchantprovidergroupassociation: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a merchantprovidergroup association.',
			args: {
				id: {
					description: 'id of the merchantprovidergroup association',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, merchantprovidergroupassociation) => {
				let id = merchantprovidergroupassociation.id;
				const merchantProviderGroupAssociationController = new MerchantProviderGroupAssociationController();

				return merchantProviderGroupAssociationController.delete({
					id: id
				});
			}
		},
		createproductschedule: {
			type: productScheduleType.graphObj,
			description: 'Adds a new product schedule.',
			args: {
				productschedule: {
					type: productScheduleInputType.graphObj
				}
			},
			resolve: (value, productschedule) => {
				const productScheduleController = new ProductScheduleController();

				return productScheduleController.create({
					entity: productschedule.productschedule
				});
			}
		},
		updateproductschedule: {
			type: productScheduleType.graphObj,
			description: 'Updates a product schedule.',
			args: {
				productschedule: {
					type: productScheduleInputType.graphObj
				}
			},
			resolve: (value, productschedule) => {
				const productScheduleController = new ProductScheduleController();

				return productScheduleController.update({
					entity: productschedule.productschedule
				});
			}
		},
		deleteproductschedule: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a product schedule.',
			args: {
				id: {
					description: 'id of the product schedule',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, productschedule) => {
				var id = productschedule.id;
				const productScheduleController = new ProductScheduleController();

				return productScheduleController.delete({
					id: id
				});
			}
		},
		createreturn: {
			type: returnType.graphObj,
			description: 'Adds a new return.',
			args: {
				'return': {
					type: returnInputType.graphObj
				}
			},
			resolve: (value, args) => {
				const returnController = new ReturnController();
				return returnController.create({
					entity: args.return
				});
			}
		},
		updatereturn: {
			type: returnType.graphObj,
			description: 'Updates a return',
			args: {
				'return': {
					type: returnInputType.graphObj
				}
			},
			resolve: (value, args) => {
				const returnController = new ReturnController();

				return returnController.update({
					entity: args.return
				});
			}
		},
		deletereturn: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a return.',
			args: {
				id: {
					description: 'id of the return',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, args) => {
				var id = args.id;
				const returnController = new ReturnController();

				return returnController.delete({
					id: id
				});
			}
		},
		createrebill: {
			type: rebillType.graphObj,
			description: 'Adds a new rebill.',
			args: {
				rebill: {
					type: rebillInputType.graphObj
				}
			},
			resolve: (value, rebill) => {
				const rebillController = new RebillController();

				return rebillController.create({
					entity: rebill.rebill
				});
			}
		},
		updaterebill: {
			type: rebillType.graphObj,
			description: 'Updates a rebill.',
			args: {
				rebill: {
					type: rebillInputType.graphObj
				}
			},
			resolve: (value, rebill) => {
				const rebillController = new RebillController();

				return rebillController.update({
					entity: rebill.rebill
				});
			}
		},
		deleterebill: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a rebill.',
			args: {
				id: {
					description: 'id of the rebill',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, rebill) => {
				var id = rebill.id;
				const rebillController = new RebillController();

				return rebillController.delete({
					id: id
				});
			}
		},
		createcampaign: {
			type: campaignType.graphObj,
			description: 'Adds a new campaign.',
			args: {
				campaign: {
					type: campaignInputType.graphObj
				}
			},
			resolve: (value, campaign) => {
				const campaignController = new CampaignController();

				return campaignController.create({
					entity: campaign.campaign
				});
			}
		},
		updatecampaign: {
			type: campaignType.graphObj,
			description: 'Updates a campaign.',
			args: {
				campaign: {
					type: campaignInputType.graphObj
				}
			},
			resolve: (value, campaign) => {
				const campaignController = new CampaignController();

				return campaignController.update({
					entity: campaign.campaign
				});
			}
		},
		deletecampaign: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a campaign.',
			args: {
				id: {
					description: 'id of the campaign',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, campaign) => {
				var id = campaign.id;
				const campaignController = new CampaignController();

				return campaignController.delete({
					id: id
				});
			}
		},
		createsession: {
			type: sessionType.graphObj,
			description: 'Adds a new session.',
			args: {
				session: {
					type: sessionInputType.graphObj
				}
			},
			resolve: (value, session) => {
				const sessionController = new SessionController();

				return sessionController.create({
					entity: session.session
				});
			}
		},
		updatesession: {
			type: sessionType.graphObj,
			description: 'Updates a session.',
			args: {
				session: {
					type: sessionInputType.graphObj
				}
			},
			resolve: (value, session) => {
				const sessionController = new SessionController();

				return sessionController.update({
					entity: session.session
				});
			}
		},
		deletesession: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a session.',
			args: {
				id: {
					description: 'id of the session',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, session) => {
				var id = session.id;
				const sessionController = new SessionController();

				return sessionController.delete({
					id: id
				});
			}
		},
		cancelsession: {
			type: sessionType.graphObj,
			description: 'Sets session to cancelled',
			args: {
				session: {
					type: sessionCancelInputType.graphObj
				}
			},
			resolve: (value, session) => {
				const sessionController = new SessionController();

				return sessionController.cancelSession({
					entity: session.session
				});

			}
		},
		createshippingreceipt: {
			type: shippingReceiptType.graphObj,
			description: 'Adds a new shippingreceipt.',
			args: {
				shippingreceipt: {
					type: shippingReceiptInputType.graphObj
				}
			},
			resolve: (value, shippingreceipt) => {
				const shippingReceiptController = new ShippingReceiptController();

				return shippingReceiptController.create({
					entity: shippingreceipt.shippingreceipt
				});
			}
		},
		updateshippingreceipt: {
			type: shippingReceiptType.graphObj,
			description: 'Updates a shippingreceipt.',
			args: {
				shippingreceipt: {
					type: shippingReceiptInputType.graphObj
				}
			},
			resolve: (value, shippingreceipt) => {

				const shippingReceiptController = new ShippingReceiptController();

				return shippingReceiptController.update({
					entity: shippingreceipt.shippingreceipt
				});
			}
		},
		deleteshippingreceipt: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a shippingreceipt.',
			args: {
				id: {
					description: 'id of the shippingreceipt',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, shippingreceipt) => {
				var id = shippingreceipt.id;
				const shippingReceiptController = new ShippingReceiptController();

				return shippingReceiptController.delete({
					id: id
				});
			}
		},
		createnotification: {
			type: notificationType.graphObj,
			description: 'Creates a new notification.',
			args: {
				notification: {
					type: notificationInputType.graphObj
				}
			},
			resolve: (value, notification) => {
				const notificationController = new NotificationController();

				return notificationController.create({
					entity: notification.notification
				});
			}
		},
		updatenotification: {
			type: notificationType.graphObj,
			description: 'Updates a notification.',
			args: {
				notification: {
					type: notificationInputType.graphObj
				}
			},
			resolve: (value, notification) => {
				const notificationController = new NotificationController();

				return notificationController.update({
					entity: notification.notification
				});
			}
		},
		deletenotification: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a notification.',
			args: {
				id: {
					description: 'id of the notification',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, notification) => {
				const notificationController = new NotificationController();

				return notificationController.delete({
					id: notification.id
				});
			}
		},
		createnotificationsetting: {
			type: notificationSettingType.graphObj,
			description: 'Creates a new notification setting.',
			args: {
				notificationsetting: {
					type: notificationSettingInputType.graphObj
				}
			},
			resolve: (value, notificationsetting) => {
				const notificationSettingController = new NotificationSettingController();

				return notificationSettingController.create({
					entity: notificationsetting.notificationsetting
				});
			}
		},
		updatenotificationsetting: {
			type: notificationSettingType.graphObj,
			description: 'Updates a notification setting.',
			args: {
				notificationsetting: {
					type: notificationSettingInputType.graphObj
				}
			},
			resolve: (value, notificationsetting) => {
				const notificationSettingController = new NotificationSettingController();

				return notificationSettingController.update({
					entity: notificationsetting.notificationsetting
				});
			}
		},
		storenotificationsetting: {
			type: notificationSettingType.graphObj,
			description: 'Updates a notification setting.',
			args: {
				notificationsetting: {
					type: notificationSettingInputType.graphObj
				}
			},
			resolve: (value, notificationsetting) => {
				const notificationSettingController = new NotificationSettingController();

				return notificationSettingController.store({
					entity: notificationsetting.notificationsetting
				});
			}
		},
		deletenotificationsetting: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a notification setting.',
			args: {
				id: {
					description: 'User associated with the notification setting',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, notificationsetting) => {
				const notificationSettingController = new NotificationSettingController();

				return notificationSettingController.delete({
					id: notificationsetting.id
				});
			}
		},
		createuserdevicetoken: {
			type: userDeviceTokenType.graphObj,
			description: 'Creates a new user device token.',
			args: {
				userdevicetoken: {
					type: userDeviceTokenInputType.graphObj
				}
			},
			resolve: (value, userdevicetoken) => {
				const userDeviceTokenController = new UserDeviceTokenController();

				return userDeviceTokenController.create({
					entity: userdevicetoken.userdevicetoken
				});
			}
		},
		updateuserdevicetoken: {
			type: userDeviceTokenType.graphObj,
			description: 'Updates a user device token.',
			args: {
				userdevicetoken: {
					type: userDeviceTokenInputType.graphObj
				}
			},
			resolve: (value, userdevicetoken) => {
				const userDeviceTokenController = new UserDeviceTokenController();

				return userDeviceTokenController.update({
					entity: userdevicetoken.userdevicetoken
				});
			}
		},
		storeuserdevicetoken: {
			type: userDeviceTokenType.graphObj,
			description: 'Stores a user device token.',
			args: {
				userdevicetoken: {
					type: userDeviceTokenInputType.graphObj
				}
			},
			resolve: (value, userdevicetoken) => {
				const userDeviceTokenController = new UserDeviceTokenController();

				return userDeviceTokenController.store({
					entity: userdevicetoken.userdevicetoken
				});
			}
		},
		deleteuserdevicetoken: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a user device token.',
			args: {
				id: {
					description: 'ID associated with a user device token.',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, userdevicetoken) => {
				const userDeviceTokenController = new UserDeviceTokenController();

				return userDeviceTokenController.delete({
					id: userdevicetoken.id
				});
			}
		},
		createusersetting: {
			type: userSettingType.graphObj,
			description: 'Creates a new user setting.',
			args: {
				usersetting: {
					type: userSettingInputType.graphObj
				}
			},
			resolve: (value, usersetting) => {
				const userSettingController = new UserSettingController();

				return userSettingController.create({
					entity: usersetting.usersetting
				});
			}
		},
		updateusersetting: {
			type: userSettingType.graphObj,
			description: 'Updates a user setting.',
			args: {
				usersetting: {
					type: userSettingInputType.graphObj
				}
			},
			resolve: (value, usersetting) => {
				const userSettingController = new UserSettingController();

				return userSettingController.update({
					entity: usersetting.usersetting
				});
			}
		},
		storeusersetting: {
			type: userSettingType.graphObj,
			description: 'Updates a user setting.',
			args: {
				usersetting: {
					type: userSettingInputType.graphObj
				}
			},
			resolve: (value, usersetting) => {
				const userSettingController = new UserSettingController();

				return userSettingController.store({
					entity: usersetting.usersetting
				});
			}
		},
		deleteusersetting: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a user setting.',
			args: {
				id: {
					description: 'User associated with the user setting',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, usersetting) => {
				const userSettingController = new UserSettingController();

				return userSettingController.delete({
					id: usersetting.id
				});
			}
		},
		createusersigningstring: {
			type: userSigningStringType.graphObj,
			description: 'Creates a new user signing string.',
			args: {
				usersigningstring: {
					type: userSigningStringInputType.graphObj
				}
			},
			resolve: (value, usersigningstring) => {
				const userSigningStringController = new UserSigningStringController();

				return userSigningStringController.create({
					entity: usersigningstring.usersigningstring
				});
			}
		},
		updateusersigningstring: {
			type: userSigningStringType.graphObj,
			description: 'Updates a user signing string.',
			args: {
				usersigningstring: {
					type: userSigningStringInputType.graphObj
				}
			},
			resolve: (value, usersigningstring) => {
				const userSigningStringController = new UserSigningStringController();

				return userSigningStringController.update({
					entity: usersigningstring.usersigningstring
				});
			}
		},
		//Technical Debt:  Where is this used?
		storeusersigningstring: {
			type: userSigningStringType.graphObj,
			description: 'Updates a user signing string.',
			args: {
				usersigningstring: {
					type: userSigningStringInputType.graphObj
				}
			},
			resolve: (value, usersigningstring) => {
				const userSigningStringController = new UserSigningStringController();

				return userSigningStringController.store({
					entity: usersigningstring.usersigningstring
				});
			}
		},
		deleteusersigningstring: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a user signing string.',
			args: {
				id: {
					description: 'Id of the user signing string',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, usersigningstring) => {
				const userSigningStringController = new UserSigningStringController();

				return userSigningStringController.delete({
					id: usersigningstring.id
				});
			}
		},
		createtag: {
			type: tagType.graphObj,
			description: 'Creates a tag.',
			args: {
				tag: {
					type: tagInputType.graphObj
				}
			},
			resolve: (value, tag) => {
				const tagController = new TagController();

				return tagController.create({
					entity: tag.tag
				});
			}
		},
		updatetag: {
			type: tagType.graphObj,
			description: 'Updates a tag.',
			args: {
				tag: {
					type: tagInputType.graphObj
				}
			},
			resolve: (value, tag) => {
				const tagController = new TagController();

				return tagController.update({
					entity: tag.tag
				});
			}
		},
		deletetag: {
			type: deleteOutputType.graphObj,
			description: 'Deletes a tag.',
			args: {
				id: {
					description: 'id of the tag',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, tag) => {
				const tagController = new TagController();

				return tagController.delete({
					id: tag.id
				});
			}
		},
		createaccountdetails: {
			type: accountDetailsType.graphObj,
			description: 'Creates an accoundetails.',
			args: {
				accountdetails: {
					type: accountDetailsInputType.graphObj
				}
			},
			resolve: (value, accoundetails) => {
				const accountDetailsController = new AccountDetailsController();

				return accountDetailsController.create({
					entity: accoundetails.accountdetails
				});
			}
		},
		updateaccountdetails: {
			type: accountDetailsType.graphObj,
			description: 'Updates an accoundetails.',
			args: {
				accountdetails: {
					type: accountDetailsInputType.graphObj
				}
			},
			resolve: (value, accoundetails) => {
				const accountDetailsController = new AccountDetailsController();

				return accountDetailsController.update({
					entity: accoundetails.accountdetails,
					ignore_updated_at: true
				});
			}
		},
		deleteaccountdetails: {
			type: deleteOutputType.graphObj,
			description: 'Deletes an accoundetails.',
			args: {
				id: {
					description: 'id of the accoundetails',
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (value, accoundetails) => {
				const accountDetailsController = new AccountDetailsController();

				return accountDetailsController.delete({
					id: accoundetails.id
				});
			}
		}
	})
});
