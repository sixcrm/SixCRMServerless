# Aggregated affiliate query for Affiliate report

26.09.2017 A.Zelen

* Part of the `Affiliate Report`

Mockup of the report, tab **Affiliate details** :
https://projects.invisionapp.com/share/W7DLUDFSH#/screens

____

## Required query output:
* `Sub affiliate ID`		
* `Clicks`
* `Partials`	 	
* `Partials %`		
* `Fail`		
* `Fail %`
* `Sales`		
* `Sales %`		
* `Sales Revenue`		
* `Upsells`		
* `Upsell %`		
* `Upsell Revenue`


## Arguments:

### Required
* `affiliate` -  a affiliate string (the affiliate alias)
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `order` - ascending or descending order
* `limit` - the number of displayed rows
* `offset` - the number of rows from the first row of the dataset

### Optional
* `campaign` -  a array of UUIDv4 strings
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string

---
### Query notes

Connection to two fact tables :
* `f_transactions` - Fact table containing transactional data
* `f_events` - Fact table containing events dataset

**Data is joined based on common affiliates**


This is needed to get the empty date list for dates with zero transactions.

---
## Results:

```
```
