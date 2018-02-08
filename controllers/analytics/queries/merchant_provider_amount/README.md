# Aggregation by merchant processor and processor result

//Technical Debt:  This query is not functional yet.
____

## Arguments:

### Required
* `account` - a UUIDv4
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `merchant processor list` -  a array of UUIDv4 strings

### Optional
* nothing

---
### Query notes

Straight forward aggregation on the transactional table.
Events can have no product_schedule feed.
Events can have no affiliates feed.


## Results:
