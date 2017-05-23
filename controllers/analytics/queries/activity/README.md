# Activity paging

____

## Arguments:

### Required
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `order` - ascending or descending order
* `limit` - the number of displayed rows
* `offset` - the number of rows from the first row of the dataset

### Optional
* `actor` - a UUIDv4
* `actor_type` -  a array of UUIDv4 strings
* `action` -  a affiliate string (the affiliate alias)
* `acted_upon` -  a sub-affiliate string
* `acted_upon_type` -  a sub-affiliate string
* `associated_with` -  a sub-affiliate string
* `accociated_with_type` -  a sub-affiliate string

---
### Query notes

Query returns dataset offset by some value from the beginning of the dataset 

---
## Results:

```
```
