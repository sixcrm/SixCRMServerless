const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib','parser-utilities.js');

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

		const stage = global.SixCRM.configuration.stage;
		const prefix = (stage === 'development' || stage === 'staging') ? (stage + '-') : '';

		let link_tokens = {
			stage_prefix: prefix,
			hash: hash
		};

		let link_template = 'https://{{stage_prefix}}admin.sixcrm.com/acceptinvite/{{hash}}';

		return parserutilities.parse(link_template, link_tokens);

	}

	async _sendEmailToInvitedUser(invite_object, link){

		du.debug('Send Email to Invited User');

		//Technical Debt:  Internationalization necessary here...
		let email = {
			recepient_emails: [invite_object.email],
			recepient_name: 'Welcome to SixCRM',
			subject: 'You\'ve been invited to join a account on Six CRM',
			body: 'Please accept this invite using the link below: '+link
		};

		if(!_.has(this, 'systemmailer')){
			//Technical Debt:  Move this to providers....
			const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
			this.systemmailer = new SystemMailer();
		}

		return this.systemmailer.sendEmail(email);

	}

}
