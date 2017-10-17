# Aggregated merchant query for Merchant report

26.09.2017 A.Zelen

* Part of the `Merchant Report`

Mockup of the report, tab **Merchant report** :
https://projects.invisionapp.com/share/KCDO6OJFH#/screens

____

## Required query output:

* `Merchant name` -- Need to **hydrate**
* `Mid ID`
* `Sales Count`
* `Sales Gross`
* `Revenue	Net`
* `Revenue	Refund`
* `Count`
* `Refunded Expenses`
* `MTD Sales Count`
* `MTD Gross Revenue`

## Arguments:

### Required
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime

### Optional
* `account` - a UUIDv4
* `campaign` -  a array of UUIDv4 strings
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `merchant_provider` -  a array of UUIDv4 strings
* `product_schedule` -  a array of UUIDv4 strings

---
### Query notes
Query returns a summary dataset groups based on merchant providers

* `Mid ID`
* `Sales Count`
* `Sales Gross`
* `Revenue	Net`
* `Revenue	Refund`
* `Count`
* `Refunded Expenses`
* `MTD Sales Count`
* `MTD Gross Revenue`
---
## Results:

```
```
