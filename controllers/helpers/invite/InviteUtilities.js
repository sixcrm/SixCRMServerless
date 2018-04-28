const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib','parser-utilities.js');

const InviteController = global.SixCRM.routes.include('entities', 'Invite.js');
const HelperController = global.SixCRM.routes.include('helpers', 'Helper.js');

module.exports = class InviteUtilities extends HelperController{

	constructor(){

		super();

	}

	executeSendInviteEmail(invite_object){

		du.debug('Execute Send Invite Email');

		let link = this._createInviteLink(invite_object);

		return this._sendEmailToInvitedUser(invite_object, link).then((sent) => {

			if(sent != true){
				throw eu.getError('server','Could not send invite email');
			}

			return link;

		});

	}

	_createInviteLink(invite_object){

		du.debug('Create Invite Link');

		let inviteController = new InviteController();

		return inviteController.create({entity: invite_object}).then(invite => {
			return this._buildInviteLink(invite.hash);
		});

	}

	_sendEmailToInvitedUser(invite_object, link){

		du.debug('Send Email to Invited User');

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

		return this.systemmailer.sendEmail(email).then(() => {
			return true;
		});

	}

	_buildPreEncryptedString(invite_object, now){

		du.debug('Build PreEncrypted String');

		let pre_encrypted = {
			email: invite_object.email,
			acl: invite_object.acl,
			invitor: invite_object.invitor,
			account: invite_object.account,
			account_id: invite_object.account_id,
			role: invite_object.role,
			timestamp: now
		};

		return JSON.stringify(pre_encrypted);

	}

	_encodeParameters(string){

		du.debug('Encode Parameters');

		return hashutilities.toBase64(string);

	}

	_decodeParameters(string){

		du.debug('Decode Parameters');

		return hashutilities.fromBase64(string);

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

	_encodedParametersToObject(encoded_parameters){

		du.debug('Encoded Parameters To Object');

		let decoded_parameters = this._decodeParameters(encoded_parameters);

		try{
			decoded_parameters = JSON.parse(decoded_parameters);
		}catch(error){
			throw eu.getError('bad_request', 'Invalid invite parameters');
		}

		return decoded_parameters;

	}

}
