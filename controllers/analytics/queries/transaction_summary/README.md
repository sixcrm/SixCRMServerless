# Aggregation by Processor Amount

____

## Arguments:

### Required
* `account` - a UUIDv4
* `start` - a ISO-8601 datetime
* `end` - a ISO-8601 datetime

### Optional
* `campaign` -  a array of UUIDv4 strings
* `affiliate` -  a array of UUIDv4 strings
* `product_schedule` -  a array of UUIDv4 strings
* `processor_result` -  Any subset of the enumeration [`success`, `decline`, `error`]
* `transaction_type` - Any subset of the enmueration [`new`, `rebill`]

---

## Results:

```javascript
{ data:
   { transactionsummary:
      { transactions:
         [ { datetime: '2017-04-20T20:57:32.802Z',
             byprocessorresult:
              [ { processor_result: 'success', amount: 450.99, count: 14 },
                { processor_result: 'decline', amount: 32.98, count: 2 },
                { processor_result: 'error', amount: 32.98, count: 2 } ] },
           { datetime: '2017-04-21T17:41:41.117Z',
             byprocessorresult:
              [ { processor_result: 'success', amount: 450.99, count: 14 },
                { processor_result: 'decline', amount: 32.98, count: 2 },
                { processor_result: 'error', amount: 32.98, count: 2 } ] } ] } } }
```
