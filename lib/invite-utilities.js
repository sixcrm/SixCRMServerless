'use strict'
const du = global.routes.include('lib', 'debug-utilities.js');
const timestamp = global.routes.include('lib', 'timestamp.js');
const signature = global.routes.include('lib', 'signature.js');
const sesutilities = global.routes.include('lib', 'ses-utilities.js');

class InviteUtilities {

    constructor(){
        this.invitesecret = 'awdawdadawt33209sfsiofjsef';
    }

    invite(invite_object){

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

                    return reject(new Error('Could not send invite email'));

                }

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    sendInviteEmail(invite_object, link){

        return new Promise((resolve, reject) => {

            let email = {
                to: [invite_object.email],
                subject: 'You\'ve been invited to join a account on Six CRM',
                body: { text: 'Please accept this invite using the link below: '+link },
                source: 'timothy.dalbey@sixcrm.com'
            };

            du.debug('Email', email);

            sesutilities.sendEmail(email).then(() => {

                return resolve(true);

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    buildPreEncryptedString(invite_object, now){

        return invite_object.email+':'+invite_object.account+':'+invite_object.role+':'+now;

    }

    buildInviteToken(pre_encrypted_string){

        return signature.createSignature(this.invitesecret, pre_encrypted_string);

    }

    encodeParameters(string){
        return new Buffer(string).toString('base64');
    }

    decodeParameters(string){
        return new Buffer(string, 'base64').toString('ascii');
    }

    buildInviteLink(encoded_parameters_string, invite_token){
        return 'https://admin.sixcrm.com/acceptinvite?t='+invite_token+'&p='+encoded_parameters_string;
    }

    encodedParametersToObject(encoded_parameters){

        let decoded_parameters = this.decodeParameters(encoded_parameters);

        decoded_parameters = decoded_parameters.split(':');

        return {
            email: decoded_parameters[0],
            account: decoded_parameters[1],
            role: decoded_parameters[2],
            timestamp: decoded_parameters[3]
        }

    }

    decodeAndValidate(token, encoded_parameters){

        return new Promise((resolve, reject) => {

            du.debug('Token', token);
            du.debug('Encoded Parameters', encoded_parameters);

            let parameters = this.encodedParametersToObject(encoded_parameters);

            let pre_encrypted_string = this.buildPreEncryptedString(parameters, parameters.timestamp);
            let validation_token = this.buildInviteToken(pre_encrypted_string);

            if(validation_token == token){

                return resolve(parameters);

            }

            return reject(new Error('Invalid invite.'));

        });

    }

}

var iu = new InviteUtilities();

module.exports = iu;
