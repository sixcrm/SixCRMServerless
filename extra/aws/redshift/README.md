# Redshift Administration

## Pricing

There is an option of reserved nodes to tune the price of the cluster.
We need to explore the size of the final production cluster so we can take advantage of the Redshift Reserved Nodes option :

http://docs.aws.amazon.com/redshift/latest/mgmt/purchase-reserved-node-instance.html

Term : 1 year or 3 years
Offering type :
  * All upfront
  * No upfront
  * Partial upfront

## Work load manager

Need to create couple of Query Queue’s for the production environment.

http://blog.panoply.io/the-redshift-query-queues-challenges-and-some-tips

## CloudWatch Alarms

Set alarms for network, disk and CPU utilization. Need to check the best strategy to implement this.
The Cluster option on the Redshift dashboard.

**Redshift events :**

Subscription to the Redshift events, use existing ones or not ?


## Scripts

### Admin Scripts

Admin SQL Scripts for monitoring Redshift

### Admin Views

Admin SQL Views for monitoring Redshift 

#### script_csv_generator.py

Generates random CSV dataset of 1000000 transactions in test.csv

#### script_event_csv_generator.py

Generates random CSV dataset events of 1000 in test_events.csv

#### time_csv_generator.py

Generates random CSV dataset of 525600 datapoints in time_dataset.csv

#### script_csv_generator.js

Generates random CSV dataset of 200 in test.csv and uploading it to S3 bucket

#### script_csv_loader.js

Copies data from S3 bucket to redshift

#### redshift.js

Redshift hardcoded access paramethers
