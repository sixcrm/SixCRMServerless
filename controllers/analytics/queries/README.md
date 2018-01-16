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

As requested there is a need to filter based on product_schedules, this neccesitates a new trans table for faster Queries
