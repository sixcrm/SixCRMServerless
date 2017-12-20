const expect = require('chai').expect;
const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

xdescribe('reports/transactionsSummary/transactions_summary_report query', function () {

    let query_input = { analyticsfilter:
                        { start: '2017-01-01T00:00:00.000Z',
                          end: '2017-01-13T00:00:00.000Z' },
                          pagination: { limit: 10, order: 'asc', offset: 0 } };

    it('Expect to return at least one row based on test seed data', () => {
      global.account = '99999999-999e-44aa-999e-aaa9a99a9999';
      global.user = 'admin.user@test.com';

      PermissionTestGenerators.givenUserWithAllowed('getTransactionSummaryReport', 'analytics');

      return analyticsController.executeAnalyticsFunction(query_input, 'getTransactionSummaryReport').then((result) => {

        console.log(result);

        expect(result.periods).to.deep.equal([{ period: '2017-01-01T23:00:00.000Z',
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
            count_alert_count: 0 } ]);
      });

    });


});
