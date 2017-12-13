# Rebill pagination

07.12.2017 A.Zelen

____

## Required query output:

* `datetime`
* `count`

## Arguments:

### Required
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `order` - ascending or descending order
* `limit` - the number of displayed rows
* `period` - the period of aggregation
* `offset` - the number of rows from the first row of the dataset


### Optional
* `account` - a UUIDv4
* `current_queuename` - name of the current queue we are looking at
---
### Query notes

The query returns the number of rebills of a predifined granularity.


---
## Results:

```
```
