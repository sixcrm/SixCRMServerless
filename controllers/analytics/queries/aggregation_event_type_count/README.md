# Aggregation by Event type

____

## Arguments:

### Required
* `account` - a UUIDv4
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime

### Optional
* `campaign` -  a array of UUIDv4 strings
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `merchant_processor` -  a array of UUIDv4 strings
* `product_schedule` -  a array of UUIDv4 strings
* `processor_result` -  Any subset of the enumeration [`success`, `decline`, `error`]
* `transaction_type` - Any subset of the enmueration [`new`, `rebill`]

---
### Query notes

Connection to two dimensional tables :
* `d_datetime` - Dimensional table of dates from 01.01.2017 to 01.01.2027
* `d_event_type` - Dimensional table of event types [`click`, `order`, `lead`,`upsell`,`confirm`]

This is needed to get the empty date list for dates with zero transactions.

---
## Results:
