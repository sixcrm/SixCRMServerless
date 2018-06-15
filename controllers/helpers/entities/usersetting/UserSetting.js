const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

module.exports = class UserSettingHelperController {

	constructor(){

	}

	getPrototypeUserSetting(email){

		du.debug('Get Prototype User Setting');

		let proto_user_setting = {
			id: email,
			timezone: 'America/Los_Angeles',
			notifications: [{
				name: "six",
				receive: true
			},
			{
				name: "email",
				receive: false,
				data: email
			},
			{
				name: "sms",
				receive: false
			},
			{
				name: "slack",
				receive: false
			},
			{
				name: "skype",
				receive: false
			},
			{
				name: "ios",
				receive: false
			}]
		};

		return proto_user_setting;

	}

}
