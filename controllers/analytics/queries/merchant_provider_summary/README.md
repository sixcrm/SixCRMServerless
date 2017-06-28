# Merchant provider summary

____

## Arguments:

### Required
* `merchant_provider` -  a array of UUIDv4 strings

### Optional
* `account` - a UUIDv4
* `campaign` -  a array of UUIDv4 strings
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `product_schedule` -  a array of UUIDv4 strings

---
### Query notes

For a given list of merchant_processor IDs, returns all merchant providers with the following fields:

* Number (count) of transactions processed today
* Number (count) of transactions processed in the week
* Number (count) of transactions processed in the month
* Sum (Dollars) of transactions processed for the day
* Sum (Dollars) of transactions processed for the week
* Sum (Dollars) of transactions processed for the day
* The merchant_processor ID
---
## Results:

```
```
