const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const InviteController = global.SixCRM.routes.include('entities', 'Invite.js');
const HelperController = global.SixCRM.routes.include('helpers', 'Helper.js');

module.exports = class InviteUtilities extends HelperController{

	constructor(){

		super();

	}

	async executeSendInviteEmail(invite_object){

		du.debug('Execute Send Invite Email');

		const link = await this._createInviteLink(invite_object);
		const sent = await this._sendEmailToInvitedUser(invite_object, link);

		if(sent != true){
			throw eu.getError('server','Could not send invite email');
		}

		return link;

	}

	async _createInviteLink(invite_object){

		du.debug('Create Invite Link');

		let inviteController = new InviteController();

		const invite = await inviteController.create({entity: invite_object});

		return this._buildInviteLink(invite.hash);

	}

	_buildInviteLink(hash){

		du.debug('Build Invite Link');

		let link_tokens = {
			api_domain: global.SixCRM.configuration.getSubdomainPath('admin'),
			hash: hash
		};

		let link_template = 'https://{{api_domain}}/acceptinvite/{{hash}}';

		return parserutilities.parse(link_template, link_tokens);

	}

	async _sendEmailToInvitedUser(invite_object, link){

		du.debug('Send Email to Invited User');

		let email = {
			recepient_emails: [invite_object.email],
			recepient_name: 'Welcome to {{site.name}}',
			subject: 'You\'ve been invited to join a account on {{site.name}}',
			body: 'Please accept this invite using the link below: {{link}}'
		};

		if(_.has(invite_object, 'fullname') && stringutilities.nonEmpty(invite_object.fullname)){
			email.recepient_name = invite_object.fullname;
			email.body = 'Hello {{invite_object.fullname}}, \n\n You\'ve been invited to a account on {{site.name}}. Please accept this invite using the link below: {{link}}'
		}

		let data = {
			site: global.SixCRM.configuration.site_config.site,
			invite_object: invite_object,
			link: link
		};

		objectutilities.map(email, key => {
			if(_.isString(email[key])){
				email[key] = parserutilities.parse(email[key], data);
			}
		});

		if(!_.has(this, 'systemmailer')){
			//Technical Debt:  Move this to providers....
			const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
			this.systemmailer = new SystemMailer();
		}

		return this.systemmailer.sendEmail(email);

	}

}
