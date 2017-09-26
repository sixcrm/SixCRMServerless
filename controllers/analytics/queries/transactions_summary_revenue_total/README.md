# Aggregation by transaction summary variables for revenue total result
# This is used as a non-paginated aggregated total query at top level of the report.
____

## Arguments:

### Required
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime

### Optional
* `account` - a UUIDv4
* `campaign` -  a array of UUIDv4 strings
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `merchant_provider` -  a array of UUIDv4 strings
* `product_schedule` -  a array of UUIDv4 strings

---
### Query notes

Query returns six variables that represent :
* `sale` is represented as processor_result = 'success' AND transaction_type = 'new'
* `rebill` is represented as processor_result = 'success' AND transaction_type = 'rebill'
* `refund` is represented as processor_result = 'success' AND transaction_type = 'refund'
* `gross_revenue` is represented as "sale - refund"
* `decline` is represented as processor_result = 'decline'
* `chargeback` is represented as transaction_type = 'chargeback'


---
## Results:

```
```
