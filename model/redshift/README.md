# Description of the Redshift data mart

____

## Model:

### Fact tables
* `f_transactions` - main fact table of transactional type holds data on transaction level of granularity
* `f_products` - **IN WORK** fact table of products in transactions

Transactional tables are defined with the distribution key based on the account.
Sort key is chosen to be date.

### Dimensional tables
* `d_dates` - Dimensional table of *minutes* from 01.01.2017 to 01.01.2027
* `d_results` - Dimensional table of processor results [`success`, `decline`, `error`]
* `d_trans_type` - **IN WORK** Dimensional table of transaction types [`new`, `rebill`]
* `d_products` - **IN WORK** Dimensional table of available products

---
## Loading scripts

Redshift is a pure column store analytical database and as such lacks fatures for procedural control and optimal data generation. It is intended to be filled from external source. Optimal way of filling Redshift is via S3 buckets.

### Loading scripts
* `loading_f_transacions.sql` - script for loading fixed csv file from S3 bucket to  `f_transactions`
* `loading_d_dates.sql` - script for loading fixed csv file from S3 bucket to  `d_dates`
* `generate_insert_data.sql` - script for generating spoofed insert statements in Redshift, **slow**

### Helper functions
* `uuid_functions.sql` - UDF in Redshift Python for generation UUID identifiers

### Data Definition Language (DDL) scripts
* `f_transactions` - main fact table of transactional type holds data on transaction level of granularity
* `d_dates` - Dimensional table of *minutes* from 01.01.2017 to 01.01.2027
* `d_results` - Dimensional table of processor results [`success`, `decline`, `error`]
