# Merchant provider summary

This query needs to be used on aggregated data found in agg_merchant_provider_transactions
____

## Arguments:

### Required
* `merchant_provider` -  a array of UUIDv4 strings
* `order_field` -  a row on which we sort data. Possible values are : "num_transactions_today", "num_transactions_week","num_transactions_month","amount_transactions_today","amount_transactions_week","amount_transactions_month"

### Optional
* `account` - a UUIDv4
* `campaign` -  a array of UUIDv4 strings
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `product_schedule` -  a array of UUIDv4 strings
* `union` - a construct for *every* merchant provider listed in a list. Example as f872e07c-ef56-4829-b9ec-1ff861fc35a9 for merchant provider :
```   
   UNION ALL
   SELECT
     'f872e07c-ef56-4829-b9ec-1ff861fc35a9' merchant_provider,
     0                                      num_transactions_today,
     0                                      num_transactions_week,
     0                                      num_transactions_month,
     0                                      amount_transactions_today,
     0                                      amount_transactions_week,
     0                                      amount_transactions_month
     ```


---
### Query notes

For a given list of merchant_processor IDs, returns all merchant providers with the following fields:

* Number (count) of transactions processed today
* Number (count) of transactions processed in the week
* Number (count) of transactions processed in the month
* Sum (Dollars) of transactions processed for the day
* Sum (Dollars) of transactions processed for the week
* Sum (Dollars) of transactions processed for the day
* The merchant_processor ID
---
## Results:

```
```
