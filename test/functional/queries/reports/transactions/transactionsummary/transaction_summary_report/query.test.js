const expect = require('chai').expect;
const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

describe('reports/transactionsSummary/transactions_summary_report query', function () {

    let query_input = { analyticsfilter:
                        { start: '2017-01-01T00:00:00.000Z',
                          end: '2017-01-13T00:00:00.000Z' },
                          pagination: { limit: 10, order: 'asc', offset: 0 } };

    it('Expect to return at least one row based on test seed data', () => {
      global.account = '99999999-999e-44aa-999e-aaa9a99a9999';
      global.user = 'admin.user@test.com';
      expect(analyticsController.executeAnalyticsFunction(query_input, 'getTransactionSummaryReport')).to.exist;
    });


});
