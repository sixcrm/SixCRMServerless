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
let fulfillmentProviderValidationType = require('./fulfillmentprovider/fulfillmentProviderValidationType');

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

let billInputType = require('./bill/billInputType');
let billType = require('./bill/billType');

let roleInputType = require('./role/roleInputType');
let roleType = require('./role/roleType');

let shippingReceiptInputType = require('./shippingreceipt/shippingReceiptInputType');
let shippingReceiptType = require('./shippingreceipt/shippingReceiptType');

let inviteInputType = require('./user/inviteInputType');
let transactionRefundInputType = require('./transaction/transactionRefundInputType');

let transactionChargebackInputType = require('./transaction/transactionChargebackInputType');
let transactionType = require('./transaction/transactionType');

let userACLInputType = require('./useracl/userACLInputType');
let userACLTermsAndConditionsInputType = require('./useracl/userACLTermsAndConditionsInputType');
let userACLType = require('./useracl/userACLType');
let userInputType  = require('./user/userInputType');
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

let identifierInputType = require('./general/identifierInputType');

//Register
let refundType = require('./register/refund/refundType');
let refundInputType = require('./register/refund/refundInputType');
let reverseType = require('./register/reverse/reverseType');
let reverseInputType = require('./register/reverse/reverseInputType');

let SMTPValidationInputType = require('./smtpvalidation/SMTPValidationInputType')
let SMTPValidationType = require('./smtpvalidation/SMTPValidationType');

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    markchargeback:{
      type: transactionType.graphObj,
      description: 'Sets the chargeback status of a customer transaction record.',
      args:{
        chargeback: {
          type: transactionChargebackInputType.graphObj
        }
      },
      resolve: (value, args) => {

        let TransactionHelperController = global.SixCRM.routes.include('helpers','entities/transaction/Transaction.js');
        let transactionHelperController = new TransactionHelperController();

        return transactionHelperController.markTransactionChargeback({transactionid: args.chargeback.transaction, chargeback_status: args.chargeback.chargeback_status});

      }
    },
    refund:{
      type: refundType.graphObj,
      description: 'Refunds a customer funds based on pre-existing customer transaction.',
      args: {
        refund: { type: refundInputType.graphObj }
      },
      resolve: (value, refund) => {
        const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
        let registerController = new RegisterController();

        return registerController.refundTransaction(refund.refund);
      }
    },
    reverse: {
      type: reverseType.graphObj,
      description: 'Reverses a customer transaction with the merchant provider.',
      args: {
        reverse: { type: reverseInputType.graphObj }
      },
      resolve: (value, reverse) => {
        const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
        let registerController = new RegisterController();

        return registerController.reverseTransaction(reverse.reverse);
      }
    },
        //Technical Debt:  See below??
        //Note: Fix
        acceptinvite:{
            type: userType.graphObj,
            description: 'Completes a user invite.',
            args: {
                invite: { type: inviteInputType.graphObj}
            },
            resolve: (value, invite) => {
                const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

                return userController.acceptInvite(invite.invite);
            }
        },
        //Technical Debt:  See below??
        //Note: Fix
        inviteuser:{
            type: userInviteType.graphObj,
            description: 'Invites a new user to the site.',
            args: {
                userinvite: { type: userInviteInputType.graphObj}
            },
            resolve: (value, userinvite) => {
                const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

                return userController.invite(userinvite.userinvite);
            }
        },
        inviteresend:{
            type: userInviteType.graphObj,
            description: 'Resend pending user invite.',
            args: {
                userinvite: { type: userInviteResendInputType.graphObj}
            },
            resolve: (value, userinvite) => {
                const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

                return userController.inviteResend(userinvite.userinvite);
            }
        },
        smtpvalidation: {
            type: SMTPValidationType.graphObj,
            description:  'Validates a SMTP Provider configuration',
            args: {
              smtpvalidation: { type: SMTPValidationInputType.graphObj }
            },
            resolve: function(root, args){
              const SMTPProviderController = global.SixCRM.routes.include('controllers', 'entities/SMTPProvider.js');

              return SMTPProviderController.validateSMTPProvider(args.smtpvalidation);
            }
        },
        fulfillmentprovidervalidation: {
          type: fulfillmentProviderValidationType.graphObj,
          description:  'Validates a Fulfillment Provider configuration',
          args: {
            id: {
              type: GraphQLString
            }
          },
          resolve: function(root, args){
            const FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider.js');
            let fulfillmentProviderController = new FulfillmentProviderController({fulfillment_provider: args.id});

            return fulfillmentProviderController.validate();
          }
        },
        //Note: Fix
        createuser:{
            type: userType.graphObj,
            description: 'Adds a new user.',
            args: {
                user: { type: userInputType .graphObj}
            },
            resolve: (value, user) => {
                const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

                return userController.createUserWithAlias(user.user);
            }
        },
        //Note: Fix
        createuserstrict:{
            type: userType.graphObj,
            description: 'Adds a new user.',
            args: {
                user: { type: userInputType.graphObj }
            },
            resolve: (value, user) => {
                const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

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
                const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

                return userController.update({entity: user.user});
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
                const userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

                return userController.delete({id: id});
            }
        },
        createuseracl:{
            type: userACLType.graphObj,
            description: 'Adds a new user acl.',
            args: {
                useracl: { type: userACLInputType.graphObj }
            },
            resolve: (value, useracl) => {
                const userACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');

                return userACLController.create({entity: useracl.useracl});
            }
        },
        updateuseracl:{
            type: userACLType.graphObj,
            description: 'Updates a user acl.',
            args: {
                useracl: { type: userACLInputType.graphObj }
            },
            resolve: (value, useracl) => {
                const userACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');

                return userACLController.update({entity: useracl.useracl});
            }
        },
        updateuseracltermsandconditions:{
            type: userACLType.graphObj,
            description: 'Updates user acl terms and conditions.',
            args: {
              useracltermsandconditions: { type: userACLTermsAndConditionsInputType.graphObj }
            },
            resolve: (value, input) => {
              const userACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');

              return userACLController.updateTermsAndConditions(input.useracltermsandconditions);
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
                const userACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');

                return userACLController.delete({id: id});
            }
        },
        createproduct:{
            type: productType.graphObj,
            description: 'Adds a new product.',
            args: {
                product: { type: productInputType.graphObj}
            },
            resolve: (value, product) => {
                const productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');

                return productController.create({entity: product.product});
            }
        },
        updateproduct:{
            type: productType.graphObj,
            description: 'Updates a product.',
            args: {
                product: { type: productInputType.graphObj }
            },
            resolve: (value, product) => {
                const productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');

                return productController.update({entity:product.product});
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
                const productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');

                return productController.delete({id: id});
            }
        },
        createaccesskey:{
            type: accessKeyType.graphObj,
            description: 'Adds a new accesskey.',
            args: {
                accesskey: { type: accessKeyInputType .graphObj}
            },
            resolve: (value, accesskey) => {
                const accessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');

                return accessKeyController.create({entity: accesskey.accesskey});
            }
        },
        updateaccesskey:{
            type: accessKeyType.graphObj,
            description: 'Updates a accesskey.',
            args: {
                accesskey: { type: accessKeyInputType.graphObj }
            },
            resolve: (value, accesskey) => {
                const accessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');

                return accessKeyController.update({entity:accesskey.accesskey});
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
                const accessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');

                return accessKeyController.delete({id:id});
            }
        },
        createaccount:{
            type: accountType.graphObj,
            description: 'Adds a new account.',
            args: {
                account: { type: accountInputType.graphObj }
            },
            resolve: (value, account) => {
                const accountController = global.SixCRM.routes.include('controllers', 'entities/Account.js');

                return accountController.create({entity: account.account});
            }
        },
        updateaccount:{
            type: accountType.graphObj,
            description: 'Updates a account.',
            args: {
                account: { type: accountInputType.graphObj }
            },
            resolve: (value, account) => {
                const accountController = global.SixCRM.routes.include('controllers', 'entities/Account.js');

                return accountController.update({entity:account.account});
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
                const accountController = global.SixCRM.routes.include('controllers', 'entities/Account.js');

                return accountController.delete({id: id});
            }
        },
        createrole:{
            type: roleType.graphObj,
            description: 'Adds a new role.',
            args: {
                role: { type: roleInputType.graphObj }
            },
            resolve: (value, role) => {
                const roleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');

                return roleController.create({entity: role.role});
            }
        },
        updaterole:{
            type: roleType.graphObj,
            description: 'Updates a role.',
            args: {
                role: { type: roleInputType.graphObj }
            },
            resolve: (value, role) => {
                const roleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');

                return roleController.update({entity:role.role});
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
                const roleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');

                return roleController.delete({id:id});
            }
        },
        createtracker:{
            type: trackerType.graphObj,
            description: 'Adds a new tracker.',
            args: {
                tracker: { type: trackerInputType.graphObj}
            },
            resolve: (value, tracker) => {
              const trackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');

              return trackerController.create({entity: tracker.tracker});
            }
        },
        updatetracker:{
            type: trackerType.graphObj,
            description: 'Updates a tracker.',
            args: {
                tracker: { type: trackerInputType.graphObj }
            },
            resolve: (value, tracker) => {
                const trackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');

                return trackerController.update({entity:tracker.tracker});
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
                const trackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');

                return trackerController.delete({id:id});
            }
        },
        createaffiliate:{
            type: affiliateType.graphObj,
            description: 'Adds a new affiliate.',
            args: {
                affiliate: { type: affiliateInputType .graphObj}
            },
            resolve: (value, affiliate) => {
                const affiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

                return affiliateController.create({entity: affiliate.affiliate});
            }
        },
        updateaffiliate:{
            type: affiliateType.graphObj,
            description: 'Updates a affiliate.',
            args: {
                affiliate: { type: affiliateInputType.graphObj }
            },
            resolve: (value, affiliate) => {
                const affiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

                return affiliateController.update({entity:affiliate.affiliate});
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
                const affiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

                return affiliateController.delete({id:id});
            }
        },
        createsmtpprovider:{
            type: SMTPProviderType.graphObj,
            description: 'Adds a new SMTP Provider.',
            args: {
                smtpprovider: { type: SMTPProviderInputType.graphObj}
            },
            resolve: (value, smtpprovider) => {
                const SMTPProviderController = global.SixCRM.routes.include('controllers', 'entities/SMTPProvider.js');

                return SMTPProviderController.create({entity: smtpprovider.smtpprovider});
            }
        },
        updatesmtpprovider:{
            type: SMTPProviderType.graphObj,
            description: 'Updates a SMTP Provider.',
            args: {
                smtpprovider: { type: SMTPProviderInputType.graphObj }
            },
            resolve: (value, smtpprovider) => {
                const SMTPProviderController = global.SixCRM.routes.include('controllers', 'entities/SMTPProvider.js');

                return SMTPProviderController.update({entity:smtpprovider.smtpprovider});
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
                const SMTPProviderController = global.SixCRM.routes.include('controllers', 'entities/SMTPProvider.js');

                return SMTPProviderController.delete({id:id});
            }
        },
        createmerchantprovider:{
            type: merchantProviderType.graphObj,
            description: 'Adds a new Merchant Provider.',
            args: {
                merchantprovider: { type: merchantProviderInputType.graphObj}
            },
            resolve: (value, merchantprovider) => {
                const merchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');

                return merchantProviderController.create({entity: merchantprovider.merchantprovider});
            }
        },
        updatemerchantprovider:{
            type: merchantProviderType.graphObj,
            description: 'Updates a Merchant Provider.',
            args: {
                merchantprovider: { type: merchantProviderInputType.graphObj }
            },
            resolve: (value, merchantprovider) => {
                const merchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');

                return merchantProviderController.update({entity:merchantprovider.merchantprovider});
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
                const merchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');

                return merchantProviderController.delete({id:id});
            }
        },
        createfulfillmentprovider:{
            type: fulfillmentProviderType.graphObj,
            description: 'Adds a new Fulfillment Provider.',
            args: {
                fulfillmentprovider: { type: fulfillmentProviderInputType.graphObj}
            },
            resolve: (value, fulfillmentprovider) => {
                const fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');

                return fulfillmentProviderController.create({entity: fulfillmentprovider.fulfillmentprovider});
            }
        },
        updatefulfillmentprovider:{
            type: fulfillmentProviderType.graphObj,
            description: 'Updates a Fulfillment Provider.',
            args: {
                fulfillmentprovider: { type: fulfillmentProviderInputType.graphObj }
            },
            resolve: (value, fulfillmentprovider) => {
                const fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');

                return fulfillmentProviderController.update({entity:fulfillmentprovider.fulfillmentprovider});
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
                const fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');

                return fulfillmentProviderController.delete({id:id});
            }
        },
        createemailtemplate:{
            type: emailTemplateType.graphObj,
            description: 'Adds a new email template.',
            args: {
                emailtemplate: { type: emailTemplateInputType.graphObj }
            },
            resolve: (value, emailtemplate) => {
                const emailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');

                return emailTemplateController.create({entity: emailtemplate.emailtemplate});
            }
        },
        updateemailtemplate:{
            type: emailTemplateType.graphObj,
            description: 'Updates a Email Template.',
            args: {
                emailtemplate: { type: emailTemplateInputType.graphObj }
            },
            resolve: (value, emailtemplate) => {
                const emailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');

                return emailTemplateController.update({entity:emailtemplate.emailtemplate});
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
                const emailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');

                return emailTemplateController.delete({id:id});
            }
        },
        createcreditcard:{
            type: creditCardType.graphObj,
            description: 'Adds a new credit card.',
            args: {
                creditcard: { type: creditCardInputType .graphObj}
            },
            resolve: (value, creditcard) => {
                const creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');

                return creditCardController.create({entity: creditcard.creditcard});
            }
        },
        updatecreditcard:{
            type: creditCardType.graphObj,
            description: 'Updates a Credit Card.',
            args: {
                creditcard: { type: creditCardInputType.graphObj }
            },
            resolve: (value, creditcard) => {
                const creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');

                return creditCardController.update({entity:creditcard.creditcard});
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
                const creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');

                return creditCardController.delete({id:id});
            }
        },
        createcustomer:{
            type: customerType.graphObj,
            description: 'Adds a new customer.',
            args: {
                customer: { type: customerInputType .graphObj}
            },
            resolve: (value, customer) => {
                const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

                return customerController.create({entity: customer.customer});
            }
        },
        updatecustomer:{
            type: customerType.graphObj,
            description: 'Updates a customer.',
            args: {
                customer: { type: customerInputType.graphObj }
            },
            resolve: (value, customer) => {
                const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

                return customerController.update({entity:customer.customer});
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
                const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

                return customerController.delete({id:id});
            }
        },
        createcustomernote:{
            type: customerNoteType.graphObj,
            description: 'Adds a new customernote.',
            args: {
                customernote: { type: customerNoteInputType .graphObj}
            },
            resolve: (value, customernote) => {
                const customerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');

                return customerNoteController.create({entity: customernote.customernote});
            }
        },
        updatecustomernote:{
            type: customerNoteType.graphObj,
            description: 'Updates a customer note.',
            args: {
                customernote: { type: customerNoteInputType.graphObj }
            },
            resolve: (value, customernote) => {
                const customerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');

                return customerNoteController.update({entity:customernote.customernote});
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
                const customerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');

                return customerNoteController.delete({id:id});
            }
        },
        createloadbalancer:{
            type: loadBalancerType.graphObj,
            description: 'Adds a new loadbalancer.',
            args: {
                loadbalancer: { type:loadBalancerInputType.graphObj }
            },
            resolve: (value, loadbalancer) => {
                const loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

                return loadBalancerController.create({entity: loadbalancer.loadbalancer});
            }
        },
        updateloadbalancer:{
            type: loadBalancerType.graphObj,
            description: 'Updates a loadbalancer.',
            args: {
                loadbalancer: { type:loadBalancerInputType.graphObj }
            },
            resolve: (value, loadbalancer) => {
                const loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

                return loadBalancerController.update({entity:loadbalancer.loadbalancer});
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
                const loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

                return loadBalancerController.delete({id:id});
            }
        },
        createproductschedule:{
            type:productScheduleType.graphObj,
            description: 'Adds a new product schedule.',
            args: {
                productschedule: { type:productScheduleInputType.graphObj }
            },
            resolve: (value, productschedule) => {
                const productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

                return productScheduleController.create({entity: productschedule.productschedule});
            }
        },
        updateproductschedule:{
            type:productScheduleType.graphObj,
            description: 'Updates a product schedule.',
            args: {
                productschedule: { type: productScheduleInputType.graphObj }
            },
            resolve: (value, productschedule) => {
                const productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

                return productScheduleController.update({entity:productschedule.productschedule});
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
                const productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

                return productScheduleController.delete({id:id});
            }
        },
        createbill:{
          type: billType.graphObj,
          description: 'Adds a new bill.',
          args: {
            bill: { type: billInputType.graphObj }
          },
          resolve: (value, bill) => {
            const billController = global.SixCRM.routes.include('controllers', 'entities/Bill.js');

            return billController.create({entity: bill.bill});
          }
        },
        updatebill:{
          type: billType.graphObj,
          description: 'Updates a bill.',
          args: {
            bill: { type: billInputType.graphObj }
          },
          resolve: (value, bill) => {
            const billController = global.SixCRM.routes.include('controllers', 'entities/Bill.js');

            return billController.update({entity:bill.bill});
          }
        },
        deletebill:{
          type: deleteOutputType.graphObj,
          description: 'Deletes a bill.',
          args: {
            id: {
			        description: 'id of the bill',
			        type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve: (value, bill) => {
            var id = bill.id;
            const billController = global.SixCRM.routes.include('controllers', 'entities/Bill.js');

            return billController.delete({id:id});
          }
        },
        updatebillwithpaymenttoken:{
          type: billType.graphObj,
          description: 'Updates a bill with a payment token.',
          args: {
            id: {
			        description: 'id of the bill',
			        type: new GraphQLNonNull(GraphQLString)
            },
            token:{
              description: 'The payment token.',
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve: (value, bill) => {
            const BillHelperController = global.SixCRM.routes.include('helpers', 'entities/bill/Bill.js');
            let billHelperController =  new BillHelperController();

            return billHelperController.setPayment({id: bill.id, token: bill.token});
          }
        },
        createrebill:{
            type: rebillType.graphObj,
            description: 'Adds a new rebill.',
            args: {
                rebill: { type: rebillInputType.graphObj }
            },
            resolve: (value, rebill) => {
                const rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

                return rebillController.create({entity: rebill.rebill});
            }
        },
        updaterebill:{
            type: rebillType.graphObj,
            description: 'Updates a rebill.',
            args: {
                rebill: { type: rebillInputType.graphObj }
            },
            resolve: (value, rebill) => {
                const rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

                return rebillController.update({entity:rebill.rebill});
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
                const rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

                return rebillController.delete({id:id});
            }
        },
        createcampaign:{
            type: campaignType.graphObj,
            description: 'Adds a new campaign.',
            args: {
                campaign: { type: campaignInputType.graphObj }
            },
            resolve: (value, campaign) => {
                const campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

                return campaignController.create({entity: campaign.campaign});
            }
        },
        updatecampaign:{
            type: campaignType.graphObj,
            description: 'Updates a campaign.',
            args: {
                campaign: { type: campaignInputType.graphObj }
            },
            resolve: (value, campaign) => {
                const campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

                return campaignController.update({entity:campaign.campaign});
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
                const campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

                return campaignController.delete({id:id});
            }
        },
        createsession:{
            type: sessionType.graphObj,
            description: 'Adds a new session.',
            args: {
                session: { type: sessionInputType.graphObj }
            },
            resolve: (value, session) => {
                const sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

                return sessionController.create({entity: session.session});
            }
        },
        updatesession:{
            type: sessionType.graphObj,
            description: 'Updates a session.',
            args: {
                session: { type: sessionInputType.graphObj }
            },
            resolve: (value, session) => {
                const sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

                return sessionController.update({entity:session.session});
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
                const sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

                return sessionController.delete({id:id});
            }
        },
        createshippingreceipt:{
            type: shippingReceiptType.graphObj,
            description: 'Adds a new shippingreceipt.',
            args: {
                shippingreceipt: { type: shippingReceiptInputType.graphObj }
            },
            resolve: (value, shippingreceipt) => {
                const shippingReceiptController = global.SixCRM.routes.include('controllers', 'entities/ShippingReceipt.js');

                return shippingReceiptController.create({entity: shippingreceipt.shippingreceipt});
            }
        },
        updateshippingreceipt:{
            type: shippingReceiptType.graphObj,
            description: 'Updates a shippingreceipt.',
            args: {
                shippingreceipt: { type: shippingReceiptInputType.graphObj }
            },
            resolve: (value, shippingreceipt) => {
                const shippingReceiptController = global.SixCRM.routes.include('controllers', 'entities/ShippingReceipt.js');

                return shippingReceiptController.update({entity:shippingreceipt.shippingreceipt});
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
                const shippingReceiptController = global.SixCRM.routes.include('controllers', 'entities/ShippingReceipt.js');

                return shippingReceiptController.delete({id:id});
            }
        },
        createnotification:{
            type: notificationType.graphObj,
            description: 'Creates a new notification.',
            args: {
                notification: { type: notificationInputType.graphObj }
            },
            resolve: (value, notification) => {
                const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

                return notificationController.create({entity: notification.notification});
            }
        },
        updatenotification:{
            type: notificationType.graphObj,
            description: 'Updates a notification.',
            args: {
                notification: { type: notificationInputType.graphObj }
            },
            resolve: (value, notification) => {
                const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

                return notificationController.update({entity:notification.notification});
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
                const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

                return notificationController.delete({id:notification.id});
            }
        },
        createnotificationsetting:{
            type: notificationSettingType.graphObj,
            description: 'Creates a new notification setting.',
            args: {
                notificationsetting: { type: notificationSettingInputType.graphObj }
            },
            resolve: (value, notificationsetting) => {
                const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                return notificationSettingController.create({entity: notificationsetting.notificationsetting});
            }
        },
        updatenotificationsetting:{
            type: notificationSettingType.graphObj,
            description: 'Updates a notification setting.',
            args: {
                notificationsetting: { type: notificationSettingInputType.graphObj }
            },
            resolve: (value, notificationsetting) => {
                const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                return notificationSettingController.update({entity:notificationsetting.notificationsetting});
            }
        },
        storenotificationsetting:{
            type: notificationSettingType.graphObj,
            description: 'Updates a notification setting.',
            args: {
                notificationsetting: { type: notificationSettingInputType.graphObj }
            },
            resolve: (value, notificationsetting) => {
                const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                return notificationSettingController.store({entity: notificationsetting.notificationsetting});
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
                const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');

                return notificationSettingController.delete({id: notificationsetting.id});
            }
        },
        createuserdevicetoken:{
            type: userDeviceTokenType.graphObj,
            description: 'Creates a new user device token.',
            args: {
                userdevicetoken: { type: userDeviceTokenInputType.graphObj }
            },
            resolve: (value, userdevicetoken) => {
                const userDeviceTokenController = global.SixCRM.routes.include('controllers', 'entities/UserDeviceToken.js');

                return userDeviceTokenController.create({entity: userdevicetoken.userdevicetoken});
            }
        },
        updateuserdevicetoken:{
            type: userDeviceTokenType.graphObj,
            description: 'Updates a user device token.',
            args: {
                userdevicetoken : { type: userDeviceTokenInputType.graphObj }
            },
            resolve: (value, userdevicetoken) => {
                const userDeviceTokenController = global.SixCRM.routes.include('controllers', 'entities/UserDeviceToken.js');

                return userDeviceTokenController.update({entity:userdevicetoken.userdevicetoken});
            }
        },
        storeuserdevicetoken:{
            type: userDeviceTokenType.graphObj,
            description: 'Stores a user device token.',
            args: {
                userdevicetoken: { type: userDeviceTokenInputType.graphObj }
            },
            resolve: (value, userdevicetoken) => {
                const userDeviceTokenController = global.SixCRM.routes.include('controllers', 'entities/UserDeviceToken.js');

                return userDeviceTokenController.store({entity: userdevicetoken.userdevicetoken});
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
                const userDeviceTokenController = global.SixCRM.routes.include('controllers', 'entities/UserDeviceToken.js');

                return userDeviceTokenController.delete({id: userdevicetoken.id});
            }
        },
        createusersetting:{
            type: userSettingType.graphObj,
            description: 'Creates a new user setting.',
            args: {
                usersetting: { type: userSettingInputType.graphObj }
            },
            resolve: (value, usersetting) => {
                const userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');

                return userSettingController.create({entity: usersetting.usersetting});
            }
        },
        updateusersetting:{
            type: userSettingType.graphObj,
            description: 'Updates a user setting.',
            args: {
                usersetting: { type: userSettingInputType.graphObj }
            },
            resolve: (value, usersetting) => {
                const userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');

                return userSettingController.update({entity:usersetting.usersetting});
            }
        },
        storeusersetting:{
            type: userSettingType.graphObj,
            description: 'Updates a user setting.',
            args: {
                usersetting: { type: userSettingInputType.graphObj }
            },
            resolve: (value, usersetting) => {
                const userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');

                return userSettingController.store({entity: usersetting.usersetting});
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
                const userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');

                return userSettingController.delete({id: usersetting.id});
            }
        },
        createusersigningstring:{
            type: userSigningStringType.graphObj,
            description: 'Creates a new user signing string.',
            args: {
                usersigningstring: { type: userSigningStringInputType.graphObj }
            },
            resolve: (value, usersigningstring) => {
                const userSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');

                return userSigningStringController.create({entity: usersigningstring.usersigningstring});
            }
        },
        updateusersigningstring:{
            type: userSigningStringType.graphObj,
            description: 'Updates a user signing string.',
            args: {
                usersigningstring: { type: userSigningStringInputType.graphObj }
            },
            resolve: (value, usersigningstring) => {
                const userSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');

                return userSigningStringController.update({entity:usersigningstring.usersigningstring});
            }
        },
        storeusersigningstring:{
            type: userSigningStringType.graphObj,
            description: 'Updates a user signing string.',
            args: {
                usersigningstring: { type: userSigningStringInputType.graphObj }
            },
            resolve: (value, usersigningstring) => {
                const userSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');

                return userSigningStringController.store({entity: usersigningstring.usersigningstring});
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
                const userSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');

                return userSigningStringController.delete({id: usersigningstring.id});
            }
        }
    })
});
