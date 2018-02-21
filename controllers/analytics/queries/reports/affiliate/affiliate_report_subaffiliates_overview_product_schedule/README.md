# Sub affiliates overview

20.10.2017 A.Zelen -- Existed before
31.01.2018 A.Zelen -- Added product schedule filtering via f_transactions /*f_product_schedules*/

* Part of the `Sub Affiliate Report Overview`

Mockup of the report, tab **Sub Affiliate details** :
https://projects.invisionapp.com/share/W7DLUDFSH#/screens

____

## Arguments:

### Required
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime
* `product_schedule` - product schedule for filtering


### Optional
* `affiliate` -  a affiliate string (the affiliate alias) or array
---
### Query notes

Given a list of affiliates, query returns the total revenue for the affiliate over a specified period of time.

---
## Results:

```
```
