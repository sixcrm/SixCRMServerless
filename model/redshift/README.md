# Description of the Redshift data mart

____

## Model:

![alttext](https://bytebucket.org/sixcrm/sixcrmserverless/raw/f8e0ec400f5595f9b09cc50e4b676dc74b5fce16/model/redshift/datamart.png?token=f5b4bd392f2203b6d5d1368b3cd852959a3371e1)

### Fact tables
* `f_transactions` - main fact table of transactional type holds data on transaction level of granularity
* `f_events` - fact table of events types holds data on events level of granularity
* `f_products` - **IN WORK** fact table of products in transactions

Transactional tables are defined with the distribution key based on the account.
Sort key is chosen to be date.

### Dimensional tables
* `d_datetimes` - Dimensional table of *minutes* from 01.01.2017 to 01.01.2027
* `d_processor_result` - Dimensional table of processor results [`success`, `decline`, `error`]
* `d_trans_type` - **IN WORK** Dimensional table of transaction types [`new`, `rebill`]
* `d_products` - **IN WORK** Dimensional table of available products

---
## Loading scripts

Redshift is a pure column store analytical database and as such lacks fatures for procedural control and optimal data generation. It is intended to be filled from external source. Optimal way of filling Redshift is via S3 buckets.

### Loading scripts
* `loading_f_transacions.sql` - script for loading fixed csv file from S3 bucket to  `f_transactions`
* `loading_d_datetime.sql` - script for loading fixed csv file from S3 bucket to  `d_datetime`
* `generate_insert_data.sql` - script for generating spoofed insert statements in Redshift, **slow**

### Helper functions
* `uuid_functions.sql` - UDF in Redshift Python for generation UUID identifiers

### Data Definition Language (DDL) scripts
* `f_transactions.sql` - main fact table creation
* `f_events.sql` - fact table of events creation
* `d_datetimes.sql` - dimensional table creation
* `d_resultimes.sql` - dimensional table creation and row insertion

**IN WORK** Change the compression type on columns for better performance
