'use strict';
let SMTPProviderInputType = require('./smtpprovider/SMTPProviderInputType');
let SMTPProviderType = require('./smtpprovider/SMTPProviderType');

let accessKeyInputType = require('./accesskey/accessKeyInputType');
let accessKeyType = require('./accesskey/accessKeyType');

let accountInputType = require('./account/accountInputType');
let accountType = require('./account/accountType');

let affiliateInputType = require('./affiliate/affiliateInputType');
let affiliateType = require('./affiliate/affiliateType');

let trackerInputType = require('./tracker/trackerInputType');
let trackerType = require('./tracker/trackerType');

let campaignInputType = require('./campaign/campaignInputType');
let campaignType = require('./campaign/campaignType');

let creditCardInputType = require('./creditcard/creditCardInputType');
let creditCardType = require('./creditcard/creditCardType');

let customerInputType = require('./customer/customerInputType');
let customerType = require('./customer/customerType');

let customerNoteInputType = require('./customernote/customerNoteInputType');
let customerNoteType = require('./customernote/customerNoteType');

let emailTemplateInputType = require('./emailtemplate/emailTemplateInputType');
let emailTemplateType = require('./emailtemplate/emailTemplateType');

let fulfillmentProviderInputType = require('./fulfillmentprovider/fulfillmentProviderInputType');
let fulfillmentProviderType = require('./fulfillmentprovider/fulfillmentProviderType');

let deleteOutputType = require('./general/deleteOutputType');

let loadBalancerInputType = require('./loadbalancer/loadBalancerInputType');
let loadBalancerType = require('./loadbalancer/loadBalancerType');

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

let roleInputType = require('./role/roleInputType');
let roleType = require('./role/roleType');

let shippingReceiptInputType = require('./shippingreceipt/shippingReceiptInputType');
let shippingReceiptType = require('./shippingreceipt/shippingReceiptType');

let inviteInputType = require('./user/inviteInputType');

let transactionInputType = require('./transaction/transactionInputType');
let transactionRefundInputType = require('./transaction/transactionRefundInputType');
let transactionType = require('./transaction/transactionType');

let userACLInputType = require('./useracl/userACLInputType');
let userACLType = require('./useracl/userACLType');
let userInputType  = require('./user/userInputType');
let userInviteInputType = require('./userinvite/userInviteInputType');
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

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

const sessionController = global.routes.include('controllers', 'entities/Session.js');
const productController = global.routes.include('controllers', 'entities/Product.js');
const customerController = global.routes.include('controllers', 'entities/Customer.js');
const customerNoteController = global.routes.include('controllers', 'entities/CustomerNote.js');
const transactionController = global.routes.include('controllers', 'entities/Transaction.js');
const rebillController = global.routes.include('controllers', 'entities/Rebill.js');
const creditCardController = global.routes.include('controllers', 'entities/CreditCard.js');
const productScheduleController = global.routes.include('controllers', 'entities/ProductSchedule.js');
const merchantProviderController = global.routes.include('controllers', 'entities/MerchantProvider.js');
const loadBalancerController = global.routes.include('controllers', 'entities/LoadBalancer.js');
const campaignController = global.routes.include('controllers', 'entities/Campaign.js');
const affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');
const trackerController = global.routes.include('controllers', 'entities/Tracker.js');
const fulfillmentProviderController = global.routes.include('controllers', 'entities/FulfillmentProvider.js');
const accessKeyController = global.routes.include('controllers', 'entities/AccessKey.js');
const userController = global.routes.include('controllers', 'entities/User.js');
const userACLController = global.routes.include('controllers', 'entities/UserACL.js');
const userSigningStringController = global.routes.include('controllers', 'entities/UserSigningString');
const emailTemplateController = global.routes.include('controllers', 'entities/EmailTemplate.js');
const SMTPProviderController = global.routes.include('controllers', 'entities/SMTPProvider.js');
const shippingReceiptController = global.routes.include('controllers', 'entities/ShippingReceipt.js');
const accountController = global.routes.include('controllers', 'entities/Account.js');
const roleController = global.routes.include('controllers', 'entities/Role.js');
const notificationController = global.routes.include('controllers', 'entities/Notification');
const notificationSettingController = global.routes.include('controllers', 'entities/NotificationSetting');
const userSettingController = global.routes.include('controllers', 'entities/UserSetting');
const userDeviceTokenController = global.routes.include('controllers', 'entities/UserDeviceToken.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        acceptinvite:{
            type: userType.graphObj,
            description: 'Completes a user invite.',
            args: {
                invite: { type: inviteInputType.graphObj}
            },
            resolve: (value, invite) => {
                return userController.acceptInvite(invite.invite);
            }
        },
        inviteuser:{
            type: userInviteType.graphObj,
            description: 'Invites a new user to the site.',
            args: {
                userinvite: { type: userInviteInputType .graphObj}
            },
            resolve: (value, userinvite) => {
                return userController.invite(userinvite.userinvite);
            }
        },
        createuser:{
            type: userType.graphObj,
            description: 'Adds a new user.',
            args: {
                user: { type: userInputType .graphObj}
            },
            resolve: (value, user) => {
                return userController.create(user.user);
            }
        },
        createuserstrict:{
            type: userType.graphObj,
            description: 'Adds a new user.',
            args: {
                user: { type: userInputType.graphObj }
            },
            resolve: (value, user) => {
                return userController.createStrict(user.user);
            }
        },
        updateuser:{
            type: userType.graphObj,
            description: 'Updates a user.',
            args: {
                user: { type: userInputType.graphObj }
            },
            resolve: (value, user) => {
                return userController.update(user.user);
            }
        },
        deleteuser:{
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

                return userController.delete(id);
            }
        },
        createuseracl:{
            type: userACLType.graphObj,
            description: 'Adds a new user acl.',
            args: {
                useracl: { type: userACLInputType.graphObj }
            },
            resolve: (value, useracl) => {
                return userACLController.create(useracl.useracl);
            }
        },
        updateuseracl:{
            type: userACLType.graphObj,
            description: 'Updates a user acl.',
            args: {
                useracl: { type: userACLInputType.graphObj }
            },
            resolve: (value, useracl) => {
                return userACLController.update(useracl.useracl);
            }
        },
        deleteuseracl:{
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

                return userACLController.delete(id);
            }
        },
        createproduct:{
            type: productType.graphObj,
            description: 'Adds a new product.',
            args: {
                product: { type: productInputType.graphObj}
            },
            resolve: (value, product) => {
                return productController.create(product.product);
            }
        },
        updateproduct:{
            type: productType.graphObj,
            description: 'Updates a product.',
            args: {
                product: { type: productInputType.graphObj }
            },
            resolve: (value, product) => {
                return productController.update(product.product);
            }
        },
        deleteproduct:{
            type: deleteOutputType.graphObj,
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
            type: accessKeyType.graphObj,
            description: 'Adds a new accesskey.',
            args: {
                accesskey: { type: accessKeyInputType .graphObj}
            },
            resolve: (value, accesskey) => {
                return accessKeyController.create(accesskey.accesskey);
            }
        },
        updateaccesskey:{
            type: accessKeyType.graphObj,
            description: 'Updates a accesskey.',
            args: {
                accesskey: { type: accessKeyInputType.graphObj }
            },
            resolve: (value, accesskey) => {
                return accessKeyController.update(accesskey.accesskey);
            }
        },
        deleteaccesskey:{
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

                return accessKeyController.delete(id);
            }
        },
        createaccount:{
            type: accountType.graphObj,
            description: 'Adds a new account.',
            args: {
                account: { type: accountInputType.graphObj }
            },
            resolve: (value, account) => {
                return accountController.create(account.account);
            }
        },
        updateaccount:{
            type: accountType.graphObj,
            description: 'Updates a account.',
            args: {
                account: { type: accountInputType.graphObj }
            },
            resolve: (value, account) => {
                return accountController.update(account.account);
            }
        },
        deleteaccount:{
            type: deleteOutputType.graphObj,
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
            type: roleType.graphObj,
            description: 'Adds a new role.',
            args: {
                role: { type: roleInputType.graphObj }
            },
            resolve: (value, role) => {
                return roleController.create(role.role);
            }
        },
        updaterole:{
            type: roleType.graphObj,
            description: 'Updates a role.',
            args: {
                role: { type: roleInputType.graphObj }
            },
            resolve: (value, role) => {
                return roleController.update(role.role);
            }
        },
        deleterole:{
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

                return roleController.delete(id);
            }
        },
        createtracker:{
            type: trackerType.graphObj,
            description: 'Adds a new tracker.',
            args: {
                tracker: { type: trackerInputType .graphObj}
            },
            resolve: (value, tracker) => {
                return trackerController.create(tracker.tracker);
            }
        },
        updatetracker:{
            type: trackerType.graphObj,
            description: 'Updates a tracker.',
            args: {
                tracker: { type: trackerInputType.graphObj }
            },
            resolve: (value, tracker) => {
                return trackerController.update(tracker.tracker);
            }
        },
        deletetracker:{
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

                return trackerController.delete(id);
            }
        },
        createaffiliate:{
            type: affiliateType.graphObj,
            description: 'Adds a new affiliate.',
            args: {
                affiliate: { type: affiliateInputType .graphObj}
            },
            resolve: (value, affiliate) => {
                return affiliateController.create(affiliate.affiliate);
            }
        },
        updateaffiliate:{
            type: affiliateType.graphObj,
            description: 'Updates a affiliate.',
            args: {
                affiliate: { type: affiliateInputType.graphObj }
            },
            resolve: (value, affiliate) => {
                return affiliateController.update(affiliate.affiliate);
            }
        },
        deleteaffiliate:{
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

                return affiliateController.delete(id);
            }
        },
        createsmtpprovider:{
            type: SMTPProviderType.graphObj,
            description: 'Adds a new SMTP Provider.',
            args: {
                smtpprovider: { type: SMTPProviderInputType.graphObj}
            },
            resolve: (value, smtpprovider) => {
                return SMTPProviderController.create(smtpprovider.smtpprovider);
            }
        },
        updatesmtpprovider:{
            type: SMTPProviderType.graphObj,
            description: 'Updates a SMTP Provider.',
            args: {
                smtpprovider: { type: SMTPProviderInputType.graphObj }
            },
            resolve: (value, smtpprovider) => {
                return SMTPProviderController.update(smtpprovider.smtpprovider);
            }
        },
        deletesmtpprovider:{
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

                return SMTPProviderController.delete(id);
            }
        },
        createmerchantprovider:{
            type: merchantProviderType.graphObj,
            description: 'Adds a new Merchant Provider.',
            args: {
                merchantprovider: { type: merchantProviderInputType.graphObj}
            },
            resolve: (value, merchantprovider) => {
                return merchantProviderController.create(merchantprovider.merchantprovider);
            }
        },
        updatemerchantprovider:{
            type: merchantProviderType.graphObj,
            description: 'Updates a Merchant Provider.',
            args: {
                merchantprovider: { type: merchantProviderInputType.graphObj }
            },
            resolve: (value, merchantprovider) => {
                return merchantProviderController.update(merchantprovider.merchantprovider);
            }
        },
        deletemerchantprovider:{
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

                return merchantProviderController.delete(id);
            }
        },
        createfulfillmentprovider:{
            type: fulfillmentProviderType.graphObj,
            description: 'Adds a new Fulfillment Provider.',
            args: {
                fulfillmentprovider: { type: fulfillmentProviderInputType.graphObj}
            },
            resolve: (value, fulfillmentprovider) => {
                return fulfillmentProviderController.create(fulfillmentprovider.fulfillmentprovider);
            }
        },
        updatefulfillmentprovider:{
            type: fulfillmentProviderType.graphObj,
            description: 'Updates a Fulfillment Provider.',
            args: {
                fulfillmentprovider: { type: fulfillmentProviderInputType.graphObj }
            },
            resolve: (value, fulfillmentprovider) => {
                return fulfillmentProviderController.update(fulfillmentprovider.fulfillmentprovider);
            }
        },
        deletefulfillmentprovider:{
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

                return fulfillmentProviderController.delete(id);
            }
        },
        createemailtemplate:{
            type: emailTemplateType.graphObj,
            description: 'Adds a new email template.',
            args: {
                emailtemplate: { type: emailTemplateInputType.graphObj }
            },
            resolve: (value, emailtemplate) => {
                return emailTemplateController.create(emailtemplate.emailtemplate);
            }
        },
        updateemailtemplate:{
            type: emailTemplateType.graphObj,
            description: 'Updates a Email Template.',
            args: {
                emailtemplate: { type: emailTemplateInputType.graphObj }
            },
            resolve: (value, emailtemplate) => {
                return emailTemplateController.update(emailtemplate.emailtemplate);
            }
        },
        deleteemailtemplate:{
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

                return emailTemplateController.delete(id);
            }
        },
        createcreditcard:{
            type: creditCardType.graphObj,
            description: 'Adds a new credit card.',
            args: {
                creditcard: { type: creditCardInputType .graphObj}
            },
            resolve: (value, creditcard) => {
                return creditCardController.create(creditcard.creditcard);
            }
        },
        updatecreditcard:{
            type: creditCardType.graphObj,
            description: 'Updates a Credit Card.',
            args: {
                creditcard: { type: creditCardInputType.graphObj }
            },
            resolve: (value, creditcard) => {
                return creditCardController.update(creditcard.creditcard);
            }
        },
        deletecreditcard:{
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

                return creditCardController.delete(id);
            }
        },
        createcustomer:{
            type: customerType.graphObj,
            description: 'Adds a new customer.',
            args: {
                customer: { type: customerInputType .graphObj}
            },
            resolve: (value, customer) => {
                return customerController.create(customer.customer);
            }
        },
        updatecustomer:{
            type: customerType.graphObj,
            description: 'Updates a customer.',
            args: {
                customer: { type: customerInputType.graphObj }
            },
            resolve: (value, customer) => {
                return customerController.update(customer.customer);
            }
        },
        deletecustomer:{
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

                return customerController.delete(id);
            }
        },
        createcustomernote:{
            type: customerNoteType.graphObj,
            description: 'Adds a new customernote.',
            args: {
                customernote: { type: customerNoteInputType .graphObj}
            },
            resolve: (value, customernote) => {
                return customerNoteController.create(customernote.customernote);
            }
        },
        updatecustomernote:{
            type: customerNoteType.graphObj,
            description: 'Updates a customer note.',
            args: {
                customernote: { type: customerNoteInputType.graphObj }
            },
            resolve: (value, customernote) => {
                return customerNoteController.update(customernote.customernote);
            }
        },
        deletecustomernote:{
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

                return customerNoteController.delete(id);
            }
        },
        createloadbalancer:{
            type: loadBalancerType.graphObj,
            description: 'Adds a new loadbalancer.',
            args: {
                loadbalancer: { type:loadBalancerInputType.graphObj }
            },
            resolve: (value, loadbalancer) => {
                return loadBalancerController.create(loadbalancer.loadbalancer);
            }
        },
        updateloadbalancer:{
            type: loadBalancerType.graphObj,
            description: 'Updates a loadbalancer.',
            args: {
                loadbalancer: { type:loadBalancerInputType.graphObj }
            },
            resolve: (value, loadbalancer) => {
                return loadBalancerController.update(loadbalancer.loadbalancer);
            }
        },
        deleteloadbalancer:{
            type: deleteOutputType.graphObj,
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
            type:productScheduleType.graphObj,
            description: 'Adds a new product schedule.',
            args: {
                productschedule: { type:productScheduleInputType.graphObj }
            },
            resolve: (value, productschedule) => {
                return productScheduleController.create(productschedule.productschedule);
            }
        },
        updateproductschedule:{
            type:productScheduleType.graphObj,
            description: 'Updates a product schedule.',
            args: {
                productschedule: { type: productScheduleInputType.graphObj }
            },
            resolve: (value, productschedule) => {
                return productScheduleController.update(productschedule.productschedule);
            }
        },
        deleteproductschedule:{
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

                return productScheduleController.delete(id);
            }
        },
        createrebill:{
            type: rebillType.graphObj,
            description: 'Adds a new rebill.',
            args: {
                rebill: { type: rebillInputType.graphObj }
            },
            resolve: (value, rebill) => {
                return rebillController.create(rebill.rebill);
            }
        },
        updaterebill:{
            type: rebillType.graphObj,
            description: 'Updates a rebill.',
            args: {
                rebill: { type: rebillInputType.graphObj }
            },
            resolve: (value, rebill) => {
                return rebillController.update(rebill.rebill);
            }
        },
        deleterebill:{
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

                return rebillController.delete(id);
            }
        },
        createtransaction:{
            type: transactionType.graphObj,
            description: 'Adds a new transaction.',
            args: {
                transaction: { type: transactionInputType.graphObj }
            },
            resolve: (value, transaction) => {
                return transactionController.createTransaction(transaction.transaction);
            }
        },
        updatetransaction:{
            type: transactionType.graphObj,
            description: 'Updates a transaction.',
            args: {
                transaction: { type: transactionInputType.graphObj }
            },
            resolve: (value, transaction) => {
                return transactionController.updateTransaction(transaction.transaction);
            }
        },
        deletetransaction:{
            type: deleteOutputType.graphObj,
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
        refundtransaction:{
            type: transactionType.graphObj,
            description: 'Refunds a transaction.',
            args: {
                transaction: { type: transactionInputType.graphObj },
                refund: { type: transactionRefundInputType.graphObj }
            },
            resolve: (value, args) => {
                return transactionController.refundTransaction(args);
            }
        },
        createcampaign:{
            type: campaignType.graphObj,
            description: 'Adds a new campaign.',
            args: {
                campaign: { type: campaignInputType.graphObj }
            },
            resolve: (value, campaign) => {
                return campaignController.create(campaign.campaign);
            }
        },
        updatecampaign:{
            type: campaignType.graphObj,
            description: 'Updates a campaign.',
            args: {
                campaign: { type: campaignInputType.graphObj }
            },
            resolve: (value, campaign) => {
                return campaignController.update(campaign.campaign);
            }
        },
        deletecampaign:{
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

                return campaignController.delete(id);
            }
        },
        createsession:{
            type: sessionType.graphObj,
            description: 'Adds a new session.',
            args: {
                session: { type: sessionInputType.graphObj }
            },
            resolve: (value, session) => {
                return sessionController.create(session.session);
            }
        },
        updatesession:{
            type: sessionType.graphObj,
            description: 'Updates a session.',
            args: {
                session: { type: sessionInputType.graphObj }
            },
            resolve: (value, session) => {
                return sessionController.update(session.session);
            }
        },
        deletesession:{
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

                return sessionController.delete(id);
            }
        },
        createshippingreceipt:{
            type: shippingReceiptType.graphObj,
            description: 'Adds a new shippingreceipt.',
            args: {
                shippingreceipt: { type: shippingReceiptInputType.graphObj }
            },
            resolve: (value, shippingreceipt) => {
                return shippingReceiptController.create(shippingreceipt.shippingreceipt);
            }
        },
        updateshippingreceipt:{
            type: shippingReceiptType.graphObj,
            description: 'Updates a shippingreceipt.',
            args: {
                shippingreceipt: { type: shippingReceiptInputType.graphObj }
            },
            resolve: (value, shippingreceipt) => {
                return shippingReceiptController.update(shippingreceipt.shippingreceipt);
            }
        },
        deleteshippingreceipt:{
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

                return shippingReceiptController.delete(id);
            }
        },
        createnotification:{
            type: notificationType.graphObj,
            description: 'Creates a new notification.',
            args: {
                notification: { type: notificationInputType.graphObj }
            },
            resolve: (value, notification) => {
                return notificationController.create(notification.notification);
            }
        },
        updatenotification:{
            type: notificationType.graphObj,
            description: 'Updates a notification.',
            args: {
                notification: { type: notificationInputType.graphObj }
            },
            resolve: (value, notification) => {
                return notificationController.update(notification.notification);
            }
        },
        deletenotification:{
            type: deleteOutputType.graphObj,
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
        },
        createnotificationsetting:{
            type: notificationSettingType.graphObj,
            description: 'Creates a new notification setting.',
            args: {
                notificationsetting: { type: notificationSettingInputType.graphObj }
            },
            resolve: (value, notificationsetting) => {
                return notificationSettingController.create(notificationsetting.notificationsetting);
            }
        },
        updatenotificationsetting:{
            type: notificationSettingType.graphObj,
            description: 'Updates a notification setting.',
            args: {
                notificationsetting: { type: notificationSettingInputType.graphObj }
            },
            resolve: (value, notificationsetting) => {
                return notificationSettingController.update(notificationsetting.notificationsetting);
            }
        },
        storenotificationsetting:{
            type: notificationSettingType.graphObj,
            description: 'Updates a notification setting.',
            args: {
                notificationsetting: { type: notificationSettingInputType.graphObj }
            },
            resolve: (value, notificationsetting) => {
                return notificationSettingController.store(notificationsetting.notificationsetting);
            }
        },
        deletenotificationsetting:{
            type: deleteOutputType.graphObj,
            description: 'Deletes a notification setting.',
            args: {
                id: {
                    description: 'User associated with the notification setting',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (value, notificationsetting) => {
                return notificationSettingController.delete(notificationsetting.id);
            }
        },
        createuserdevicetoken:{
            type: userDeviceTokenType.graphObj,
            description: 'Creates a new user device token.',
            args: {
                userdevicetoken: { type: userDeviceTokenInputType.graphObj }
            },
            resolve: (value, userdevicetoken) => {
                return userDeviceTokenController.create(userdevicetoken.userdevicetoken);
            }
        },
        updateuserdevicetoken:{
            type: userDeviceTokenType.graphObj,
            description: 'Updates a user device token.',
            args: {
                userdevicetoken : { type: userDeviceTokenInputType.graphObj }
            },
            resolve: (value, userdevicetoken) => {
                return userDeviceTokenController.update(userdevicetoken.userdevicetoken);
            }
        },
        storeuserdevicetoken:{
            type: userDeviceTokenType.graphObj,
            description: 'Stores a user device token.',
            args: {
                userdevicetoken: { type: userDeviceTokenInputType.graphObj }
            },
            resolve: (value, userdevicetoken) => {
                return userDeviceTokenController.store(userdevicetoken.userdevicetoken);
            }
        },
        deleteuserdevicetoken:{
            type: deleteOutputType.graphObj,
            description: 'Deletes a user device token.',
            args: {
                id: {
                    description: 'ID associated with a user device token.',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (value, userdevicetoken) => {
                return userDeviceTokenController.delete(userdevicetoken.id);
            }
        },
        createusersetting:{
            type: userSettingType.graphObj,
            description: 'Creates a new user setting.',
            args: {
                usersetting: { type: userSettingInputType.graphObj }
            },
            resolve: (value, usersetting) => {
                return userSettingController.create(usersetting.usersetting);
            }
        },
        updateusersetting:{
            type: userSettingType.graphObj,
            description: 'Updates a user setting.',
            args: {
                usersetting: { type: userSettingInputType.graphObj }
            },
            resolve: (value, usersetting) => {
                return userSettingController.update(usersetting.usersetting);
            }
        },
        storeusersetting:{
            type: userSettingType.graphObj,
            description: 'Updates a user setting.',
            args: {
                usersetting: { type: userSettingInputType.graphObj }
            },
            resolve: (value, usersetting) => {
                return userSettingController.store(usersetting.usersetting);
            }
        },
        deleteusersetting:{
            type: deleteOutputType.graphObj,
            description: 'Deletes a user setting.',
            args: {
                id: {
                    description: 'User associated with the user setting',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (value, usersetting) => {
                return userSettingController.delete(usersetting.id);
            }
        },
        createusersigningstring:{
            type: userSigningStringType.graphObj,
            description: 'Creates a new user signing string.',
            args: {
                usersigningstring: { type: userSigningStringInputType.graphObj }
            },
            resolve: (value, usersigningstring) => {
                return userSigningStringController.create(usersigningstring.usersigningstring);
            }
        },
        updateusersigningstring:{
            type: userSigningStringType.graphObj,
            description: 'Updates a user signing string.',
            args: {
                usersigningstring: { type: userSigningStringInputType.graphObj }
            },
            resolve: (value, usersigningstring) => {
                return userSigningStringController.update(usersigningstring.usersigningstring);
            }
        },
        storeusersigningstring:{
            type: userSigningStringType.graphObj,
            description: 'Updates a user signing string.',
            args: {
                usersigningstring: { type: userSigningStringInputType.graphObj }
            },
            resolve: (value, usersigningstring) => {
                return userSigningStringController.store(usersigningstring.usersigningstring);
            }
        },
        deleteusersigningstring:{
            type: deleteOutputType.graphObj,
            description: 'Deletes a user signing string.',
            args: {
                id: {
                    description: 'Id of the user signing string',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (value, usersigningstring) => {
                return userSigningStringController.delete(usersigningstring.id);
            }
        }
    })
});
