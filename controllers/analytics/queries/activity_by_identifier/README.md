# Activity pagination

____

## Arguments:

### Required
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `order` - ascending or descending order
* `limit` - the number of displayed rows
* `offset` - the number of rows from the first row of the dataset
* `actor` - a UUIDv4
* `actor_type` -  a array of UUIDv4 strings
* `acted_upon` -  a sub-affiliate string
* `acted_upon_type` -  a sub-affiliate string
* `associated_with` -  a sub-affiliate string
* `associated_with_type` -  a sub-affiliate string

### Optional
* `action` -  a string
* `account` -  the account identifier
---
### Query notes

Query returns dataset offset by some value from the beginning of the dataset

---
## Results:

```
```
