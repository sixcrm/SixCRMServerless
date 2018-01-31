# Failure movement query

08.12.2017 A.Zelen
19.01.2017 A.Zelen Changed the name of the failure queues
31.01.2017 A.Zelen Adding error to num_of_failed_rebills
____

## Required query output:

* `queue`
* `failure_rate`
* `error_rate`
* `success_rate`
* `expired_rate`

## Arguments:

### Required
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime

### Optional
* `current_queuename` - name of the queue
* `account` - a UUIDv4

---
### Query notes

The query returns the percent of rebills moving from a queue to a fail queue


---
## Results:

```
```
