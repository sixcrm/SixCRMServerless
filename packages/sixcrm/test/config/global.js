require('@6crm/sixcrmcore');

global.integration_test_config = global.SixCRM.routes.include('test', 'integration/config/'+process.env.stage+'.yml');

let test_users = [
	{
		name:"Super User",
		email:"super.user@test.com",
		role:"Owner"
	},
	{
		name:"Owner User",
		email:"owner.user@test.com",
		role:"Owner"
	},
	{
		name:"Admin User",
		email:"admin.user@test.com",
		role:"Administrator"

	},
	{
		name:"Customer Service User",
		email:"customerservice.user@test.com",
		role:"Customer Service"
	}
];

const test_accounts = [
	{
		name: 'Test Account 1',
		id: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
	}
];

const master_account = [
	{
		name: 'Master Account',
		id: '*'
	}
];

global.test_users = test_users;
global.test_accounts = test_accounts;
global.master_account = master_account;

//process.env.TEST_MODE = 'true';
