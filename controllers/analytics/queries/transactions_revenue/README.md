# Transactions paging tied to the summary transactions reports

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
* `processor_result` -  a array of UUIDv4 strings

### Empty fields
These fields are empty pending clarification, hydration or RS filling

* `cycle`
* `recycle`
* `gateway_response`
* `mid_Name`
* `transaction_id_gateway`
---
### Query notes

Query returns dataset offset by some value from the beginning of the dataset

---
## Results:

```
```
