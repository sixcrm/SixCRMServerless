# Unload query for dumping data out of redshift
____

## Arguments:

### Required
* `query` - query that is executed to fill the Redshift table
* `filename` - name of the generated file on the S3 bucket
* `access_id` - access id
* `access_key` - access key
---
### Query notes

Unload function dumps file in CSV format to the S3 bucket from redshift.
Default settings, can be changed based on the business need :

* `DELIMITER AS  ','` - delimiter
* `ALLOWOVERWRITE` - rewrites the file if exists no s3
* `PARALLEL OFF` - disables parallel unload to multiple files

---
## Results:

```
```
