# SixCRM Transaction Lambdas

## Todo:

### General

1.  ~~Abstract/Normalize the Lambda Response mechanisms.~~
2.  ~~Add local dynamodb storage (or figure out why local function invoke can't speak to remote dynamo).~~
3.  ~~Complete order call~~
4.  ~~Add created, updated dated, completed to Transaction~~
5.  ~~Complete confirm order.~~
6.  Add campaign to model
7.  ~~Flesh out the product model~~
8.  ~~Research PCI compliant storage of CC information with AWS.~~
9.  Add User model
10.  Add indexes "completed-index", "created-index" to transactions *(REEVALUATE)*
11.  ~~Add transaction logic for creates and recycles.~~
12.  Think on the recurring transaction processor mechanism.
13.  ~~Add indexes to `serverless.yml` `Resources` definitions.~~ 
14.  Add Unit Testing.
15.  ~~Convert "transactions" to "sessions", add a transaction (receipt) model/table.~~
16.  ~~Complete Round Trip Integration Test.~~
17.  Add data fixtures to remote DynamoDB.

### Verify Signature

* Move functions to helper class

Reminder:  Access Key is the SHA-1  of the customer's email address.

### Verify JWT

* Move functions to helper class

### Acquire Token

* Abstract the timestamp creation to a helper class.

### Create Lead

* Move all the functions to a helper class
* Install and use a Dynamo Transaction class

### Create Order

* Move all the functions to a helper class
* Add more validation
* Mark the session as modified.
* Install and use a Dynamo Transaction class

### Update Order
### Confirm Order



## DynamoDB

To start the local Dynamo instance: `sls dynamodb start --stage development -P 8001`.  To interact with the local DynamoDB instance, use the AWS Command Line Interface.  

## Local Development

Make sure to turn on the local DynamoDB instance.

Invoke functions as follows: `export SLS_DEBUG=*; serverless invoke local -f createlead -p ./endpoints/createlead/success_event.json  --stage local`

## Known Issues

1.  When working with a new deployment, the lambda roles doesn't appear to have sufficient permissions to read/write against the DynamoDB tables.
2.  When deleting an instance, CloudFormation fails to delete the S3 bucket that holds the deployment artifacts as well as the IAM Role.

