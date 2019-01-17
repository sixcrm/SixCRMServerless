module.exports = class UserSettingHelperController {

	constructor(){

	}

	getPrototypeUserSetting(email){
		let proto_user_setting = {
			id: email,
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
