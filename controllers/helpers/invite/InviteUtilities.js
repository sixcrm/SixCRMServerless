const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');
const signatureutilities = global.SixCRM.routes.include('lib', 'signature.js');
const parserutilities = global.SixCRM.routes.include('lib','parser-utilities.js');

const HelperController = global.SixCRM.routes.include('helpers', 'Helper.js');

module.exports = class InviteUtilities extends HelperController{

    constructor(){

      super();

      //Technical Debt:  This needs to be configured.
      this.invitesecret = 'awdawdadawt33209sfsiofjsef';

    }

    executeSendInviteEmail(invite_object){

      du.debug('Execute Send Invite Email');

      let link = this._createInviteLink(invite_object);

      return this._sendEmailToInvitedUser(invite_object, link).then((sent) => {

        if(sent != true){
          eu.throwError('server','Could not send invite email');
        }

        return link;

      });

    }

    decodeAndValidate(token, encoded_parameters){

      du.debug('Decode And Validate');

      let parameters = this._encodedParametersToObject(encoded_parameters);
      let pre_encrypted_string = this._buildPreEncryptedString(parameters, parameters.timestamp);
      let validation_token = this._buildInviteToken(pre_encrypted_string);

      if(validation_token == token){
        return parameters;
      }

      eu.throwError('validation','Invalid invite.');

    }

    _createInviteLink(invite_object){

      du.debug('Create Invite Link');

      let now = timestamp.createTimestampSeconds();
      let pre_encrypted_string = this._buildPreEncryptedString(invite_object, now);
      let invite_token = this._buildInviteToken(pre_encrypted_string);
      let encoded_params = this._encodeParameters(pre_encrypted_string);
      let link = this._buildInviteLink(encoded_params, invite_token);

      return link;

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
        role: invite_object.role,
        timestamp: now
      };

      return JSON.stringify(pre_encrypted);

    }

    _buildInviteToken(pre_encrypted_string){

      du.debug('Build Invite Token');

      return signatureutilities.createSignature(this.invitesecret, pre_encrypted_string);

    }

    _encodeParameters(string){

      du.debug('Encode Parameters');

      return hashutilities.toBase64(string);

    }

    _decodeParameters(string){

      du.debug('Decode Parameters');

      return hashutilities.fromBase64(string);

    }

    _buildInviteLink(encoded_parameters_string, invite_token){

      du.debug('Build Invite Link');

      const stage = global.SixCRM.configuration.stage;
      const prefix = (stage === 'development' || stage === 'staging') ? (stage + '-') : '';

      let link_tokens = {
        stage_prefix: prefix,
        invite_token: invite_token,
        encoded_parameters: encoded_parameters_string
      };

      let link_template = 'https://{{stage_prefix}}admin.sixcrm.com/acceptinvite?t={{invite_token}}&p={{encoded_parameters}}';

      return parserutilities.parse(link_template, link_tokens);

    }

    _encodedParametersToObject(encoded_parameters){

      du.debug('Encoded Parameters To Object');

      let decoded_parameters = this._decodeParameters(encoded_parameters);

      try{
        decoded_parameters = JSON.parse(decoded_parameters);
      }catch(error){
        eu.throwError('bad_request', 'Invalid invite parameters');
      }

      return decoded_parameters;

    }

}
