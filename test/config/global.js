require('../../SixCRM.js');

const fs = require('fs');
const yaml = require('js-yaml');

global.environment = 'development';

if(typeof process.env.TEST_ENVIRONMENT !== 'undefined'){

    global.environment = process.env.TEST_ENVIRONMENT;

}

global.site_config = yaml.safeLoad(fs.readFileSync('./config/'+global.environment+'/site.yml', 'utf8'));
global.integration_test_config = yaml.safeLoad(fs.readFileSync('./test/integration/config/'+global.environment+'.yml', 'utf8'));

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

let test_accounts = [
    {
        name: 'Master Account',
        id: '*'
    },
    {
        name: 'Test Account 1',
        id: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
    }
];

global.test_users = test_users;
global.test_accounts = test_accounts;
