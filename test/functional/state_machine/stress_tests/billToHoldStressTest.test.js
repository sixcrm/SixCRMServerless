const expect = require('chai').expect;
const uuidV4 = require('uuid/v4');
const SqSTestUtils = require('../../sqs-test-utils');
const StateMachine = require('../state-machine-test-utils.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const timer = global.SixCRM.routes.include('lib', 'timer.js');
const rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
const customerController = global.SixCRM.routes.include('entities', 'Customer.js');
const binController = global.SixCRM.routes.include('entities', 'Bin.js');
const creditCardController = global.SixCRM.routes.include('entities', 'CreditCard.js');
const merchantProviderController = global.SixCRM.routes.include('entities', 'MerchantProvider.js');
const merchantProviderGroupController = global.SixCRM.routes.include('entities', 'MerchantProviderGroup.js');
const merchantProviderGroupAssociationController = global.SixCRM.routes.include('entities', 'MerchantProviderGroupAssociation.js');
const sessionController = global.SixCRM.routes.include('entities', 'Session.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');
const numberUtilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const tab = '      ';

// Technical Debt: Fails with larger number - some messages go to error. Investigate!
const max_test_cases = randomutilities.randomInt(5, 9);

xdescribe('billToHoldStressTest', () => {

    let number_of_incorrect = 0;

    before((done) => {
        process.env.require_local = true;
        process.env.stage = 'local';

        Promise.resolve()
            .then(() => DynamoDbDeployment.initializeControllers())
            .then(() => DynamoDbDeployment.destroyTables())
            .then(() => DynamoDbDeployment.deployTables())
            .then(() => SQSDeployment.deployQueues())
            .then(() => SQSDeployment.purgeQueues())
            .then(() => done());

    });

    it(`${max_test_cases} rebills are sent to hold`, () => {
        return beforeTest()
            .then(() => waitForNumberOfMessages('bill', max_test_cases))
            .then(() => console.log(tab + 'Waiting for flush to finish'))
            .then(() => timer.set())
            .then(() => StateMachine.flush())
            .then(() => waitForNumberOfMessages('bill', 0))
            .then(() => waitForNumberOfMessages('recover', number_of_incorrect))
            .then(() => waitForNumberOfMessages('hold', max_test_cases - number_of_incorrect))
            .then(() => {
                let total = timer.get();

                console.log(tab + 'Total processing time: ' + total + 'ms');
                console.log(tab + numberUtilities.formatFloat(total/max_test_cases, 2) + 'ms per message');
            });

    });

    function beforeTest() {
        return Promise.resolve()
            .then(() => SQSDeployment.purgeQueues())
            .then(() => DynamoDbDeployment.destroyTables())
            .then(() => DynamoDbDeployment.deployTables())
            .then(() => seed())
    }

    function waitForNumberOfMessages(queue_name, number, retries) {

        if (retries === undefined) {
            retries = 0;
        }

        if (retries > 3) {
            return Promise.reject('Too many retries');
        }

        return SqSTestUtils.messageCountInQueue(queue_name)
            .then((count) => {
                console.log(tab + 'Waiting for ' + number + ' messages to be in ' + queue_name + '. Got ' + count);
                if ((number === 0 && count > 0) || (number > 0 && count < number)) {
                    return timestamp.delay(1 * 1000)().then(() => waitForNumberOfMessages(queue_name, number, ++retries))
                } else if (number > 0 && count > number) {
                    console.log('Too many messages in queue ' + queue_name);
                    return Promise.reject('Too many messages in queue ' + queue_name);
                } else {
                    return Promise.resolve();
                }
            });
    }

    function seed() {
        permissionutilities.disableACLs();

        let operations = [];
        let merchantProvider = getMerchantProvider();
        let merchantProviderGroup = getMerchantProviderGroup();
        let creditCard = getCreditCard();
        let customer = getCustomer();
        let bin = getBin();
        let session = getSession();
        let merchantProviderGroupAssociation = getMerchantProviderGroupAssociation();

        for (let i = 0; i < max_test_cases; i++) {
            let rebill = getRebill();

            //let credit_card_number = [creditCard.number, "1111111111111111"];

            //prepare data
            /*merchantProviderGroupAssociation.entity = rebill.products[0].product.id;
            merchantProviderGroupAssociation.campaign = session.campaign;
            session.customer = customer.id;
            session.completed = false;
            session.id = rebill.parentsession;
            session.product_schedules = rebill.product_schedules;
            customer.creditcards[0] = creditCard.id;
            credit_card_number = randomutilities.selectRandomFromArray(credit_card_number);
            creditCard.number = credit_card_number;
            bin.binnumber = parseInt(credit_card_number.slice(0,6));*/

            //credit cards with number "1111111111111111" go to error
            //if (credit_card_number === "1111111111111111" ) number_of_incorrect++;

            operations.push(rebillController.create({entity: rebill}));
            operations.push(SqSTestUtils.sendMessageToQueue('bill', '{"id":"' + rebill.id +'"}'));
        }

        operations.push(binController.create({entity: bin}));
        operations.push(creditCardController.create({entity: creditCard}));
        operations.push(customerController.create({entity: customer}));
        operations.push(sessionController.create({entity: session}));
        operations.push(merchantProviderGroupAssociationController.create({entity: merchantProviderGroupAssociation}));
        operations.push(merchantProviderGroupController.create({entity: merchantProviderGroup}));
        operations.push(merchantProviderController.create({entity: merchantProvider}));

        return Promise.all(operations)
            .then(() => permissionutilities.enableACLs())
            .catch(() => permissionutilities.enableACLs());
    }

    function getRebill() {
        return {
            "bill_at": "2017-04-06T18:40:41.405Z",
            "id": uuidV4(),
            "state": "bill",
            "processing": true,
            "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
            "parentsession": "668ad918-0d09-4116-a6fe-0e8a9eda36f7",
            "products":[{
                "quantity":1,
                "product":{
                    "id": "1b7ecefe-8be6-44cd-addb-d4e4350d7738",
                    "name": "Test Product",
                    "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
                    "sku":"123",
                    "ship":false,
                    "shipping_delay":3600,
                    "fulfillment_provider":"5d18d0fa-5812-4c37-b98c-7b1debdcb435",
                    "created_at":"2017-04-06T18:40:41.405Z",
                    "updated_at":"2017-04-06T18:41:12.521Z"
                },
                "amount":34.99
            }],
            "product_schedules": ["12529a17-ac32-4e46-b05b-83862843055d"],
            "amount": 34.99,
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        };
    }

    function getBin() {
        return {
            "binnumber": 411111,
            "brand": "Visa",
            "bank": "Some Bank",
            "type": "Classic",
            "level": "level",
            "country": "USA",
            "info": "Some info",
            "country_iso": "US",
            "country_iso2": "USA",
            "country_iso3": 123,
            "webpage": "www.bankofamerica.com",
            "phone": "15032423612"
        }
    }

    function getMerchantProviderGroupAssociation() {
        return {
            "id":"927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3",
            "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
            "merchantprovidergroup":"45367480-f1c1-4f61-a3d6-413c22a44dc3",
            "campaign":"70a6689a-5814-438b-b9fd-dd484d0812f9",
            "entity":"1b7ecefe-8be6-44cd-addb-d4e4350d7738",
            "entity_type":"product",
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        }
    }

    function getMerchantProviderGroup() {
        return {
            "id":"45367480-f1c1-4f61-a3d6-413c22a44dc3",
            "name": "Integration Test Merchant Provider Group",
            "account":"eefdeca6-41bc-4af9-a561-159acb449b5e",
            "merchantproviders":[
                {
                    "id":"a32a3f71-1234-4d9e-a9a1-98ecedb88f24",
                    "distribution":1.0
                }
            ],
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        }
    }

    function getMerchantProvider() {
        return {
            "id":"a32a3f71-1234-4d9e-a9a1-98ecedb88f24",
            "account":"eefdeca6-41bc-4af9-a561-159acb449b5e",
            "name":"Test MID 1",
            "processor":{
                "name":"Test"
            },
            "processing":{
                "monthly_cap": 1000000000.00,
                "discount_rate":0.9,
                "transaction_fee":0.06,
                "reserve_rate": 0.5,
                "maximum_chargeback_ratio":0.17,
                "transaction_counts":{
                    "daily":1000000,
                    "monthly":1000000,
                    "weekly":1000000
                }
            },
            "enabled":true,
            "gateway": {
                "type":"Test",
                "name":"Test",
                "username":"demo",
                "password":"password"
            },
            "allow_prepaid":true,
            "accepted_payment_methods":["Visa", "Mastercard", "American Express","LOCAL CARD"],
            "customer_service":{
                "email":"customer.service@mid.com",
                "url":"http://mid.com",
                "description":"Some string here..."
            },
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        }
    }

    function getCreditCard() {
        return {
            "id": "df84f7bb-06bd-4daa-b1a3-6a2c113edd72",
            "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
            "address": {
                "city": "Portland",
                "country": "US",
                "line1": "10 Skid Rw.",
                "line2": "Suite 100",
                "state": "OR",
                "zip": "97213"
            },
            "number": "4111111111111111",
            "ccv": "999",
            "expiration": "10/2025",
            "name": "Rama Damunaste",
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        }
    }

    function getCustomer() {
        return {
            "id":"24f7c851-29d4-4af9-87c5-0298fa74c689",
            "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
            "email":"rama@damunaste.org",
            "firstname":"Rama",
            "lastname":"Damunaste",
            "phone":"1234567890",
            "address":{
                "line1":"10 Downing St.",
                "city":"London",
                "state":"OR",
                "zip":"97213",
                "country":"US"
            },
            "creditcards":["df84f7bb-06bd-4daa-b1a3-6a2c113edd72"],
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        }
    }

    function getSession() {
        return {
            "id": "668ad918-0d09-4116-a6fe-0e8a9eda36f7",
            "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
            "alias":"SASDFG123P",
            "customer": "24f7c851-29d4-4af9-87c5-0298fa74c689",
            "campaign":"70a6689a-5814-438b-b9fd-dd484d0812f9",
            "product_schedules":["12529a17-ac32-4e46-b05b-83862843055d"],
            "completed": false,
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z",
            "affiliate":	"332611c7-8940-42b5-b097-c49a765e055a",
            "subaffiliate_1":	"6b6331f6-7f84-437a-9ac6-093ba301e455",
            "subaffiliate_2":	"22524f47-9db7-42f9-9540-d34a8909b072",
            "subaffiliate_3":	"fd2548db-66a8-481e-aacc-b2b76a88fea7",
            "subaffiliate_4":	"d515c0df-f9e4-4a87-8fe8-c53dcace0995",
            "subaffiliate_5":	"45f025bb-a9dc-45c7-86d8-d4b7a4443426",
            "cid":"fb10d33f-da7d-4765-9b2b-4e5e42287726"
        }
    }

});

