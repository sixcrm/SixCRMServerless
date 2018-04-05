# Campaign delta query

____

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

---
### Query notes

For a particular date range, list the campaigns with the greatest percentage of change in order form the greatest to least.
Change should be defined as the absolute value of change, that is to say that both downward and upward movement is treated equivalently.

Change should be expressed as typed percentages. For example the following would be meaningful results:

+ 25.21%
- 13.49%
0.00%
Change should be defined as follows:

Calculate the sum amount and sum count of transactions. Call these values X1.
Then calculate the same values for a period of equal length just prior to the date range specified.
Call these values X0.
Calculate ((X1-X0)/X0) * 100. This is the "Percent Change"


Query returns three variables that represent :
* `campaign` -  a array of UUIDv4 strings
* `percent_change_count` - percent of change in the transaction count
* `percent_change_amount`- percent of change in the transaction amount

---
## Results:

```
```
