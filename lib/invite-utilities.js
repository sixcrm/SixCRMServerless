'use strict'
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const signature = global.SixCRM.routes.include('lib', 'signature.js');
const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
const systemmailer = new SystemMailer();

class InviteUtilities {

    constructor(){

      //Technical Debt:  This needs to be configured.
      this.invitesecret = 'awdawdadawt33209sfsiofjsef';

    }

    invite(invite_object){

      du.debug('Invite');

      return new Promise((resolve, reject) => {

        du.debug('Invite Object:', invite_object);

        let now = timestamp.createTimestampSeconds();
        let pre_encrypted_string = this.buildPreEncryptedString(invite_object, now);
        let invite_token = this.buildInviteToken(pre_encrypted_string);
        let encoded_params = this.encodeParameters(pre_encrypted_string);
        let link = this.buildInviteLink(encoded_params, invite_token);

        this.sendInviteEmail(invite_object, link).then((sent) => {

          if(sent == true){

            return resolve(link);

          }else{

            return reject(eu.getError('server','Could not send invite email'));

          }

        }).catch((error) => {

          return reject(error);

        });

      });

    }

    sendInviteEmail(invite_object, link){

        du.debug('Send Invite Email');

        return new Promise((resolve, reject) => {

            let email = {
                recepient_emails: [invite_object.email],
                recepient_name: 'Welcome to SixCRM',
                subject: 'You\'ve been invited to join a account on Six CRM',
                body: 'Please accept this invite using the link below: '+link
            };

            return systemmailer.sendEmail(email).then(() => {

                return resolve(true);

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    buildPreEncryptedString(invite_object, now){

      du.debug('Build PreEncrypted String');

      return invite_object.email+':'+invite_object.acl+':'+invite_object.invitor+':'+invite_object.account+':'+invite_object.role+':'+now;

    }

    buildInviteToken(pre_encrypted_string){

      du.debug('Build Invite Token');

      return signature.createSignature(this.invitesecret, pre_encrypted_string);

    }

    encodeParameters(string){

      du.debug('Encode Parameters');

      return new Buffer(string).toString('base64');

    }

    decodeParameters(string){

      du.debug('Decode Parameters');

      return new Buffer(string, 'base64').toString('ascii');

    }

    buildInviteLink(encoded_parameters_string, invite_token){

      du.debug('Build Invite Link');

      const stage = global.SixCRM.configuration.stage;
      const prefix = (stage === 'development' || stage === 'staging') ? (stage + '-') : '';

      return 'https://' + prefix + 'admin.sixcrm.com/acceptinvite?t='+invite_token+'&p='+encoded_parameters_string;

    }

    encodedParametersToObject(encoded_parameters){

      du.debug('Encoded Parameters To Object');

      let decoded_parameters = this.decodeParameters(encoded_parameters);

      decoded_parameters = decoded_parameters.split(':');

      return {
          email: decoded_parameters[0],
          acl: decoded_parameters[1],
          invitor: decoded_parameters[2],
          account: decoded_parameters[3],
          role: decoded_parameters[4],
          timestamp: decoded_parameters[5]
      }

    }

    decodeAndValidate(token, encoded_parameters){

      du.debug('Decode And Validate');

      return new Promise((resolve, reject) => {

        du.debug('Token', token);
        du.debug('Encoded Parameters', encoded_parameters);

        let parameters = this.encodedParametersToObject(encoded_parameters);

        let pre_encrypted_string = this.buildPreEncryptedString(parameters, parameters.timestamp);
        let validation_token = this.buildInviteToken(pre_encrypted_string);

        if(validation_token == token){

          return resolve(parameters);

        }

        return reject(eu.getError('validation','Invalid invite.'));

      });

    }

}

var iu = new InviteUtilities();

module.exports = iu;
