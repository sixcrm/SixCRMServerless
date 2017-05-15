# Transactions facets

____

## Arguments:

### Required
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `facet` - a facet by which we aggregate
* `limit` - a limit of number of transactions
* `limit_partition` - a limit of number of transactions plus 1
* `offset` - a facet by which we aggregate

### Optional
* `account` - a UUIDv4
* `campaign` -  a array of UUIDv4 strings
* `customer` -  a array of UUIDv4 strings
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `merchant_provider` -  a array of UUIDv4 strings
* `product_schedule` -  a array of UUIDv4 strings
* `creditcard` -  a array of UUIDv4 strings
* `processor_result` -  a array of UUIDv4 strings
* `transaction_type` -  a array of UUIDv4 strings
* `transaction_subtype` -  a array of UUIDv4 strings

---
### Query notes

Displays the number of distinct facets,facets themselves and number of all events

---
## Results:

```
```
