# Transactions facet timeseries

____

## Arguments:

### Required
* `account` - a UUIDv4
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `facet` - a transaction facets ["account","campaign","merchant_provider","product_schedule","transaction_type","transaction_subtype","processor_result","affiliate","subaffiliate_1","subaffiliate_2","subaffiliate_3,,"subaffiliate_4","subaffiliate_5"]

### Optional
* `campaign` -  a array of UUIDv4 strings
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `merchant_provider` -  a array of UUIDv4 strings
* `product_schedule` -  a array of UUIDv4 strings
* `processor_result` -  Any subset of the enumeration [`success`, `decline`, `error`]
* `transaction_type` - Any subset of the enmueration [`new`, `rebill`]

---
### Query notes

Connection to two dimensional tables to generate zero points in time:
* `d_datetime` - Dimensional table of dates from 01.01.2017 to 01.01.2027
* `d_processor_result` - Dimensional table of processor results [`success`, `decline`, `error`]
