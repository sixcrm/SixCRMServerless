
const apn = require('apn');
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

module.exports = class APNProvider {

	constructor(){
		this.necessary_configuration_parameters = [
			'token_key',
			'token_key_id',
			'token_team_id',
			'production'
		];

		this.setConfiguationParameters();
		this.instantiateAPNClass();

	}

	setConfiguationParameters(){
		this.necessary_configuration_parameters.forEach((parameter) => {

			//Technical Debt:  Use configuration_object
			if(!_.has(process.env.apn, parameter)){

				return Promise.reject(eu.getError('server','Missing necessary APN configuration setting: '+parameter));

			}

			this.parameter = process.env.apn[parameter];

		});

	}

	instantiateAPNClass(){
		var options = {
			token: {
				key: this.token_key,
				keyId: this.token_key_id,
				teamId: this.token_team_id
			},
			production: this.production
		};

		try{

			this.apn = new apn.Provider(options);

		}catch(error){

			du.debug(error);

			throw eu.getError('server','Error instantiating APN class.');

		}

	}

	createNote(){
		var note = new apn.Notification();

		note.expiry = Math.floor(Date.now() / 1000) + 3600;
		note.badge = 3;
		note.sound = "ping.aiff";
		note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
		note.payload = {'messageFrom': 'John Appleseed'};
		note.topic = "<your-app-bundle-id>";

		return Promise.resolve(note);

	}

	//Note:  user must be a hydrated model containing (atleast) the device_token
	//Technical Debt:  Must be able to set note contents in the arguments
	sendNotifications(user){
		return this.validateUser(user)
			.then(this.validateNote)
			.then(this.createNote)
			.then((note) => this.sendAllNotifications(user, note));

	}

	validateUser(user){
		//Technical Debt: validate has device tokens
		//Technical Debt: has configured iOS notifications ON

		return Promise.resolve(user);

	}

	sendNotification(device_token, note){
		return this.apn.send(note, device_token);

	}

	handleResponse(response){
		//Technical Debt: conditionally operate on responses

		du.debug(response);

		return Promise.resolve(response);

	}

	sendAllNotifications(user, note){
		let promises = [];

		user.device_tokens.forEach((device_token) => {

			promises.push(this.sendNotification(device_token, note).then(this.handleResponse));

		});

		return Promise.all(promises).then((promises) => {

			du.info('Notifications sent: ', promises);

			return true;

		});

	}

}
