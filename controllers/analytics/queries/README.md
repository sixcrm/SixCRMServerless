# Redshift query templates used in SixCRM

--------------------------------------------------------------------------------

## Queries :

### activity_by_identifier

### aggregation_event_type_count

### aggregation_processor_amount

### bin

### campaign_delta

### campaigns_by_amount

### deprecated

### event_funnel

### events_by_facet

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

### transaction_summary

### transactions

### transactions_by_affiliate

### transactions_by_facet

--------------------------------------------------------------------------------

## Notes:

As requested there is a need to filter based on product_schedules, this neccesitates a new trans table for faster Queries.

## Query usage

These queries are used as of 10.01.2018

(Front) -> (function in Analytics.js) -> (queryfolder)

### analytics

listactivitybyidentifier -> getMerchantProviderSummaries -> merchant_provider_summary

campaignsbyamount -> getCampaignsByAmount -> campaigns_by_amount

eventsummary -> getEventSummary -> aggregation_event_type_count

eventsbyfacet -> getEventsByFacet -> events_by_facet

eventfunnel -> getEventFunnel -> event_funnel

campaigndelta -> getCampaignDelta -> campaign_delta

transactionsbyfacet -> getTransactionsByFacet -> transactions_by_facet

transactionoverview -> getTransactionOverview -> transaction_summary

transactionsummary -> getTransactionSummary -> aggregation_processor_amount

### queue

rebillsummary -> getRebillSummary -> order_engine/rebill_pagination

queuestate -> getQueueState -> order_engine/rebill_pagination | order_engine/queue_rate | order_engine/queue_average_time

### reports

affiliatereportsubaffiliates -> getAffiliateReportSubaffiliates -> reports/affiliate/affiliate_report_subaffiliates

affiliatereport -> getAffiliateReport -> reports/affiliate/affiliate_report

affiliatereportsummary -> getAffiliateReportSummary -> reports/affiliate/affiliate_report_summary

merchantreport -> getMerchantReport -> reports/merchantprovider/merchantprovider_report | reports/merchantprovider/merchantprovider_report_product_schedule
