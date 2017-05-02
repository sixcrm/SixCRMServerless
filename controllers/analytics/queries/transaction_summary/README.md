# Aggregation by transaction summary variables

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
* `merchant_processor` -  a array of UUIDv4 strings
* `product_schedule` -  a array of UUIDv4 strings

---
### Query notes

Query returns six variables that represent :
* `New Sale` -  Transactions that have processor_result = 'success’ and transaction_type = 'new’
* `Rebill` - Transactions that have processor_result = 'success’ and transaction_type = 'rebill’
* `Declines` - Transactions that have processor_result = 'decline’
* `Error` - Transactions that have processor_result = 'error'
* `Upsell` - Transactions that have processor_result = 'success’ and transaction_type = 'new’ and transaction_subtype = 'upsell’
* `Main` - Transactions that have processor_result = 'success’ and transaction_type = 'new’ and transaction_subtype = 'main’


---
## Results:

```
```
