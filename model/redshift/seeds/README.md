# Static seeds

Data that always should be in the Redshift tables goes in this directory. All sql files will
be executed then the seed script is run.

### Fact tables
* `insert_f_transactions` - insert into main fact table of transactional type holds data on transaction level of granularity
* `insert_f_events` - insert into fact table of events types holds data on events level of granularity
* `insert_f_activity` - insert into fact table of activities

```
All spoofed seet data has id or session of : 99999999-999e-44aa-999e-aaa9a99a9999
```
