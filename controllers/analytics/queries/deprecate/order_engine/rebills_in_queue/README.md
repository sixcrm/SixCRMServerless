# Rebills in queue pagination

29.01.2018 A.Zelen

____

## Required query output:

* `datetime`
* `count`

## Arguments:

### Required
* `order` - ascending or descending order by amount
* `limit` - the number of displayed rows
* `offset` - the number of rows from the first row of the dataset
* `queuename` - the current queuename 


### Optional
* `account` - a UUIDv4

---
### Query notes

The query returns the number of rebills that are currently in a inputed queue name


---
## Results:

```
```
