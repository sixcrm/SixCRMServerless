require('../state-machine-test-setup');
const uuidV4 = require('uuid/v4');
const SqSTestUtils = require('../../sqs-test-utils');
const StateMachine = require('../state-machine-test-utils.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const timer = global.SixCRM.routes.include('lib', 'timer.js');
const rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
const BinController = global.SixCRM.routes.include('entities', 'Bin.js');
const CreditCardController = global.SixCRM.routes.include('entities', 'CreditCard.js');
const merchantProviderController = global.SixCRM.routes.include('entities', 'MerchantProvider.js');
const merchantProviderGroupController = global.SixCRM.routes.include('entities', 'MerchantProviderGroup.js');
const merchantProviderGroupAssociationController = global.SixCRM.routes.include('entities', 'MerchantProviderGroupAssociation.js');
const sessionController = global.SixCRM.routes.include('entities', 'Session.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');
const numberUtilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const tab = '      ';
const binController = new BinController();
const creditCardController = new CreditCardController();
const customerController = new CustomerController();

const max_test_cases = randomutilities.randomInt(10, 20);

describe('billToHoldStressTest', () => {

    let number_of_incorrect = 0;
    let number_of_failing = 0;

    before((done) => {
        process.env.require_local = true;

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
            .then(() => du.output(tab + 'Waiting for flush to finish'))
            .then(() => timer.set())
            .then(() => StateMachine.flush())
            .then(() => waitForNumberOfMessages('bill', 0))
            .then(() => waitForNumberOfMessages('bill_error', number_of_incorrect))
            .then(() => waitForNumberOfMessages('recover', number_of_failing))
            .then(() => waitForNumberOfMessages('hold', max_test_cases - number_of_incorrect - number_of_failing))
            .then(() => {
                let total = timer.get();

                du.output(tab + 'Total processing time: ' + total + 'ms');
                du.output(tab + numberUtilities.formatFloat(total/max_test_cases, 2) + 'ms per message');
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
                du.output(tab + 'Waiting for ' + number + ' messages to be in ' + queue_name + '. Got ' + count);
                if ((number === 0 && count > 0) || (number > 0 && count < number)) {
                    return timestamp.delay(1 * 1000)().then(() => waitForNumberOfMessages(queue_name, number, ++retries))
                } else if (number > 0 && count > number) {
                    du.output('Too many messages in queue ' + queue_name);
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

        for (let i = 0; i < max_test_cases; i++) {
            let rebill = MockEntities.getValidRebill();
            let creditCard = MockEntities.getValidPlaintextCreditCard();
            let customer = MockEntities.getValidCustomer();
            let bin = getBin();
            let session = MockEntities.getValidSession();
            let merchantProviderGroupAssociation = getMerchantProviderGroupAssociation();

            let rebill_id = [rebill.id, uuidV4()];
            let credit_card_number = [creditCard.number/*, "1111111111111111"*/];
            let customer_credit_card_id = [creditCard.id, uuidV4()];
            let second_attempt = randomutilities.randomBoolean();
            let first_attempt = randomutilities.randomBoolean();

            //create random scenarios
            rebill_id = randomutilities.selectRandomFromArray(rebill_id);
            credit_card_number = randomutilities.selectRandomFromArray(credit_card_number);
            customer.creditcards[0] = randomutilities.selectRandomFromArray(customer_credit_card_id);
            if (first_attempt) rebill.first_attempt = timestamp.createTimestampSeconds();
            if (second_attempt) rebill.second_attempt = true;

            //prepare data
            rebill.state = "bill";
            rebill.processing = true;
            rebill.products = [rebill.products[0]];
            merchantProviderGroupAssociation.entity = rebill.products[0].product.id;
            merchantProviderGroupAssociation.campaign = session.campaign;
            session.customer = customer.id;
            session.completed = false;
            session.id = rebill.parentsession;
            session.product_schedules = rebill.product_schedules;
            creditCard.number = credit_card_number;
            bin.binnumber = parseInt(credit_card_number.slice(0,6));

            //credit cards with number "1111111111111111" go to recover
            //if (credit_card_number === "1111111111111111" ) number_of_failing++;

            //missing rebill goes to error
            //rebill with second attempt goes to error
            //rebill with recent first attempt goes to error
            //rebill with customer that has no credit card
            if ((rebill.id !== rebill_id) ||
                second_attempt ||
                first_attempt ||
                customer.creditcards[0] !== creditCard.id)
                number_of_incorrect++;

            operations.push(rebillController.create({entity: rebill}));
            operations.push(binController.create({entity: bin}));
            operations.push(creditCardController.create({entity: creditCard}));
            operations.push(customerController.create({entity: customer}));
            operations.push(sessionController.create({entity: session}));
            operations.push(merchantProviderGroupAssociationController.create({entity: merchantProviderGroupAssociation}));
            operations.push(SqSTestUtils.sendMessageToQueue('bill', '{"id":"' + rebill_id +'"}'));
        }

        operations.push(merchantProviderGroupController.create({entity: merchantProviderGroup}));
        operations.push(merchantProviderController.create({entity: merchantProvider}));

        return Promise.all(operations)
            .then(() => permissionutilities.enableACLs())
            .catch(() => permissionutilities.enableACLs());
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
            "id":uuidV4(),
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
});

