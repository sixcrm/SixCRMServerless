# Transactions paging query tied to the transactions Summary (revenue) report

26.09.2017 A.Zelen

* Part of the `Summary Report`, tab drilldown on `Summary details`
* Part of the `Merchant Report`
* Part of the `Affiliate Report`
* Part of the `Transactions Report`

Mockup of the report :
https://projects.invisionapp.com/share/29DIKG1A3#/screens/253636310_Summary_Report_Breakdown_UI_Stepper_Copy_5

____

## Required query output:

* `Date/Time (If already sorted by date)`
* `Transaction ID`
* `Cust Name` -- Need to **hydrate**
* `Affiliate` -- Need to **hydrate**
* `Campaign` -- Need to **hydrate**
* `Product` -- Need to **hydrate**
* `Cycle` -- Does **not exist** in RS
* `Recycle #` -- Does **not exist** in RS
* `Type (Sale, Refund, Void, Decline etc)`
* `Amount`
* `Result (Success, Soft Decline, Hard Decline)`
* `Gateway response` -- Does **not exist** in RS
* `Mid Name` -- Does **not exist** in RS
* `Transaction ID from Gateway/Mid`-- Does **not exist** in RS

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

Query returns dataset offset by some value from the beginning of the dataset. This is the transactions details view of the data required by all MVP reports.

* `Summary Report`
* `Merchant Report`
* `Affiliate Report`
* `Transactions Report`


---
## Results:

```
```
