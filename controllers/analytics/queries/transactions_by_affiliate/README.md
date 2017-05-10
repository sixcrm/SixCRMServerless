# Transactions by Affiliate Query

____

## Arguments:

### Required
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `order` - a number specifing order
* `limit` - a number specifing limit of rows

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

For the current analytics filters and datetime ranging parameters, query generates a ordered percentage of transactions by affiliate.
The results is displayed as both count and percentage. A "no-affiliate" group is included as a empty string.

---
## Results:

```
```
