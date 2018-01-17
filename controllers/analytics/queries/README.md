# Redshift query templates used in SixCRM frontend
____

## Queries :

### activity
### activity_by_identifier
### aggregation_event_type_count
### aggregation_processor_amount
### bin
### bin_query
### campaign_delta
### campaigns_by_amount
### default
### deprecated
### event_funnel
### events
### events_by_affiliate
### events_by_facet
### events_by_facet_timeseries
### merchant_provider_amount
### merchant_provider_summary
### merchant_report_summary
### order_engine
#### order_engine queue_average_time
#### order_engine queue_pagination
#### order_engine queue_rate
#### order_engine rebill_pagination
### reports
#### reports affiliate
#### reports merchantprovider
#### reports transactions
#### reports transactionsummary
### sessions
### sub_affiliates_overview
### transaction_summary
### transactions
### transactions_by_affiliate
### transactions_by_facet
### transactions_facet_timeseries
### unload_query

---
## Notes:

As requested there is a need to filter based on product_schedules, this neccesitates a new trans table for faster Queries.

## Query usage :

These queries are used

analytics
	listactivitybyidentifier -> getMerchantProviderSummaries -> merchant_provider_summary
	campaignsbyamount -> getCampaignsByAmount -> campaigns_by_amount
	eventsummary -> getEventSummary -> aggregation_event_type_count
	eventsbyfacet -> getEventsByFacet -> events_by_facet
	eventfunnel -> getEventFunnel -> event_funnel
	campaigndelta -> getCampaignDelta -> campaign_delta
	transactionsbyfacet -> getTransactionsByFacet -> transactions_by_facet
	transactionoverview -> getTransactionOverview -> transaction_summary
	transactionsummary -> getTransactionSummary -> aggregation_processor_amount



queue
	rebillsummary -> getRebillSummary -> order_engine/rebill_pagination
	queuestate -> getQueueState -> order_engine/rebill_pagination | order_engine/queue_rate | order_engine/queue_average_time

reports
	affiliatereportsubaffiliates -> getAffiliateReportSubaffiliates -> reports/affiliate/affiliate_report_subaffiliates
	affiliatereport -> getAffiliateReport -> reports/affiliate/affiliate_report
	affiliatereportsummary -> getAffiliateReportSummary -> reports/affiliate/affiliate_report_summary
	merchantreport -> getMerchantReport -> reports/merchantprovider/merchantprovider_report | reports/merchantprovider/merchantprovider_report_product_schedule
	transactionsummaryreportsummary -> getTransactionSummaryReportSummary -> reports/transactionsummary/transaction_summary_report_summary
	transactionsummaryreport -> getTransactionSummaryReport -> reports/transactionsummary/transaction_summary_report_summary
	transactionsreport -> getTransactionsReport -> reports/transactions/transactions_report
