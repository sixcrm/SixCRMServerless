# Aggregation by merchant processor and processor result

____

## Arguments:

### Required
* `account` - a UUIDv4
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime

### Optional
* account - a UUIDv4
* campaign - a UUIDv4
* affiliate  - a UUIDv4
* subaffiliate_{1-5} - a UUIDv4
* product_schedule - a UUIDv4

---
### Query notes

Create a query which returns the following information from the events table given the filter settings.
Events can have no product_schedule feed.
Events can have no affiliates feed.

For a given period, return the count, percentage and relative percentage of the following events:

* Click
* Lead
* Order
* Upsell
* Confirm

The percentage is defined as the the (count of the event type X)/(count of event type Click).
The relative percentage is defined as the (count of event type X)/(count of event type X-1) where Click is always 100%.
Note that there may be multiple event type Upsell for a Session - we will only want a single count in that case.
Please keep in mind that the filters that should be available are:
account, campaign, affiliate, subaffiliate_{1-5}, product_schedule


## Results:
