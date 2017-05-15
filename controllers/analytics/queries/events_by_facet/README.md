# Events facets

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
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `product_schedule` -  a array of UUIDv4 strings
* `session` - a array of UUIDv4 strings
* `type` -  type of the events ["click","order","lead","confirm","upsell"]


---
### Query notes

Displays the number of distinct facets,facets themselves and number of all transactions

---
## Results:

```
```
