# Transactions paging

____

## Arguments:

### Required
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `order` - ascending or descending order
* `limit` - the number of displayed rows
* `offset` - the number of rows from the first row of the dataset

### Optional
* `account` - a UUIDv4
* `campaign` -  a array of UUIDv4 strings
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `merchant_processor` -  a array of UUIDv4 strings
* `product_schedule` -  a array of UUIDv4 strings
* `customer` -  a array of UUIDv4 strings
* `creditcard` -  a array of UUIDv4 strings
* `processor_result` -  a array of UUIDv4 strings
* `transaction_type` -  a array of UUIDv4 strings
* `transaction_subtype` -  a array of UUIDv4 strings

---
### Query notes

Query returns dataset offset from the beginning of the dataquery offset by some value

---
## Results:

```
```
