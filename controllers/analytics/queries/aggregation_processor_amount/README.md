# Aggregation by Processor Amount

____

## Arguments:

### Required
* `account` - a UUIDv4
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime

### Optional
* `campaign` -  a array of UUIDv4 strings
* `affiliate` -  a affiliate string (the affiliate alias)
* `subaffiliate_1` -  a sub-affiliate string
* `subaffiliate_2` -  a sub-affiliate string
* `subaffiliate_3` -  a sub-affiliate string
* `subaffiliate_4` -  a sub-affiliate string
* `subaffiliate_5` -  a sub-affiliate string
* `merchant_provider` -  a array of UUIDv4 strings
* `product_schedule` -  a array of UUIDv4 strings
* `processor_result` -  Any subset of the enumeration [`success`, `decline`, `error`]
* `type` - Any subset of the enmueration [`new`, `rebill`]

---
### Query notes

Connection to two dimensional tables :
* `d_datetime` - Dimensional table of dates from 01.01.2017 to 01.01.2027
* `d_processor_result` - Dimensional table of processor results [`success`, `decline`, `error`]

This is needed to get the empty date list for dates with zero transactions.

---
## Results:

```
[ anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-01T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-01T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-01T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-02T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-02T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '9778.82',
    transaction_count: '1',
    day: 2017-03-02T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '2500.01',
    transaction_count: '1',
    day: 2017-03-03T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-03T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-03T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-04T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-04T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-04T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-05T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-05T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-05T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-06T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-06T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '4599.28',
    transaction_count: '1',
    day: 2017-03-06T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-07T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-07T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-07T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '3136.61',
    transaction_count: '1',
    day: 2017-03-08T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-08T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-08T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-09T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-09T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-09T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-10T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-10T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '24.49',
    transaction_count: '1',
    day: 2017-03-10T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-11T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-11T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-11T08:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-12T08:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-12T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-12T08:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-13T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-13T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-13T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-14T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '1601.29',
    transaction_count: '1',
    day: 2017-03-14T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-14T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-15T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-15T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-15T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-16T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '2917.20',
    transaction_count: '1',
    day: 2017-03-16T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-16T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '3937.14',
    transaction_count: '2',
    day: 2017-03-17T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '3625.11',
    transaction_count: '1',
    day: 2017-03-17T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-17T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-18T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-18T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-18T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-19T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '8314.11',
    transaction_count: '1',
    day: 2017-03-19T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '6638.37',
    transaction_count: '1',
    day: 2017-03-19T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-20T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-20T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-20T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-21T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '6721.14',
    transaction_count: '1',
    day: 2017-03-21T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '4080.99',
    transaction_count: '1',
    day: 2017-03-21T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-22T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '9427.39',
    transaction_count: '1',
    day: 2017-03-22T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-22T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-23T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-23T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-23T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-24T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-24T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '9276.28',
    transaction_count: '2',
    day: 2017-03-24T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-25T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '4588.96',
    transaction_count: '2',
    day: 2017-03-25T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-25T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '5655.93',
    transaction_count: '1',
    day: 2017-03-26T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-26T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '3764.55',
    transaction_count: '1',
    day: 2017-03-26T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-27T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-27T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-27T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-28T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-28T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '2011.27',
    transaction_count: '2',
    day: 2017-03-28T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '1266.62',
    transaction_count: '1',
    day: 2017-03-29T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '3139.98',
    transaction_count: '1',
    day: 2017-03-29T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-29T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-30T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-30T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-30T07:00:00.000Z },
  anonymous {
    result: 'error',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-31T07:00:00.000Z },
  anonymous {
    result: 'success',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-31T07:00:00.000Z },
  anonymous {
    result: 'decline',
    sum_amount: '0.00',
    transaction_count: '1',
    day: 2017-03-31T07:00:00.000Z } ]
```
