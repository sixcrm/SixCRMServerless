# Events facet timeseries

____

## Arguments:

### Required
* `account` - a UUIDv4
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `facet` - a transaction facets ["account","campaign","affiliate","product_schedule","subaffiliate_1","subaffiliate_2","subaffiliate_3,,"subaffiliate_4","subaffiliate_5","session","type"]

### Optional
* `account` - a UUIDv4
* `campaign` -  a array of UUIDv4 strings
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `session` - a array of UUIDv4 strings
* `type` -  type of the events ["click","order","lead","confirm","upsell"]

---
### Query notes

Connection to two dimensional tables to generate zero points in time:
* `d_datetime` - Dimensional table of dates from 01.01.2017 to 01.01.2027
* `d_processor_result` - Dimensional table of processor results [`success`, `decline`, `error`]

Events can have no product_schedule feed.
Events can have no affiliates feed.
