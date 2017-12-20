const expect = require('chai').expect;
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

describe('queries/redshift-queries.js', () => {

    before(() => {
        global.account = '99999999-999e-44aa-999e-aaa9a99a9999';
        global.user = 'admin.user@test.com';

        process.env.TEST_IMAGE = "true";
    });

    let tests = [
        {
            method: 'getMerchantReport',
            input: { analyticsfilter:
                { start: '2017-01-01T00:00:00.000Z',
                    end: '2017-01-13T00:00:00.000Z' },
                pagination: { limit: 10, order: 'asc', offset: 0 } },
            result_name: 'merchants',
            expect: [{ merchant_provider: '6c40761d-8919-4ad6-884d-6a46a776cfb9',
                sale_count: '1',
                sale_gross_revenue: '139.99',
                refund_expenses: '0',
                refund_count: '0',
                net_revenue: undefined,
                mtd_sales_count: '0',
                mtd_gross_count: '0' }]
        },
        {
            method: 'getTransactionsReport',
            input: { analyticsfilter:
                { start: '2017-01-01T00:00:00.000Z',
                    end: '2017-01-13T00:00:00.000Z' },
                pagination: { limit: 10, order: 'asc', offset: 0 } },
            result_name: 'transactions',
            expect: [ { id: 'd26c1887-7ad4-4a44-be0b-e80dbce22774',
                datetime: '2017-01-02T17:40:41.405Z',
                customer: '24f7c851-29d4-4af9-87c5-0298fa74c689',
                merchant_provider: '6c40761d-8919-4ad6-884d-6a46a776cfb9',
                campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
                affiliate: '6b6331f6-7f84-437a-9ac6-093ba301e455',
                amount: '139.99',
                processor_result: 'success',
                transaction_type: 'new',
                cycle: null,
                recycle: null,
                gateway_response: null,
                transaction_id_gateway: null } ]
        },
        {
            method: 'getTransactionSummaryReport',
            input: { analyticsfilter:
                { start: '2017-01-01T00:00:00.000Z',
                    end: '2017-01-13T00:00:00.000Z' },
                pagination: { limit: 10, order: 'asc', offset: 0 } },
            result_name: 'periods',
            expect: [{ period: '2017-01-01T23:00:00.000Z',
                sale_count: '1',
                sale_revenue: '139.99',
                rebill_count: '0',
                rebill_revenue: '0',
                refund_expenses: '0',
                refund_count: '0',
                gross_revenue: '139.99',
                declines_count: '0',
                declines_revenue: '0',
                chargeback_count: '0',
                current_active_customer: '1',
                count_alert_count: 0 } ]
        },
        {
            method: 'getTransactionSummaryReport',
            input: { analyticsfilter:
                { start: '2017-01-01T00:00:00.000Z',
                    end: '2017-01-13T00:00:00.000Z' },
                pagination: { limit: 10, order: 'asc', offset: 0 } },
            result_name: 'periods',
            expect: [{ period: '2017-01-01T23:00:00.000Z',
                sale_count: '1',
                sale_revenue: '139.99',
                rebill_count: '0',
                rebill_revenue: '0',
                refund_expenses: '0',
                refund_count: '0',
                gross_revenue: '139.99',
                declines_count: '0',
                declines_revenue: '0',
                chargeback_count: '0',
                current_active_customer: '1',
                count_alert_count: 0 } ]
        }
    ];

    arrayutilities.map(tests, (test) => {
        it(`returns results from ${test.method}`, () => {
            PermissionTestGenerators.givenUserWithAllowed(test.method, 'analytics');
            console.log(process.env.TEST_IMAGE);
            return analyticsController.executeAnalyticsFunction(test.input, test.method).then((result) => {

                expect(result[test.result_name]).to.deep.equal(test.expect);
            });
        });
    });



});
