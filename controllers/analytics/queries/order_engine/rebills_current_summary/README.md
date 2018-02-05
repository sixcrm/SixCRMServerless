# Summary rebill query

05.02.2018 A.Zelen

____

## Required query output:

* `avg_time average` time in queue
* `number_of_rebills` number of rebills that are currently in queue
* `failure_rate failure` rate of rebiils that are currently in queue (this number is defined if they are in the specified queue for more than 14 days)

## Arguments:

### Required
* `order` - ascending or descending order by amount
* `queuename` - the queuename of the queue we are exploring


### Optional
* `account` - a UUIDv4 identificator of account

---
### Query notes

The query returns the summary statistics of the current rebills in queue.
THIS QUERY IS NOT LIMITED BY TIME SPAN. THIS NEEDS TO BE ADDRESSED IN THE FUTURE BY :

* Feeding a lower bound to the query
* Constructing an aggregated table that holds info on the rebills in current queue from the period and is used

---
## Results:

```
```
