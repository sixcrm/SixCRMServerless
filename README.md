# SixCRM Transaction Lambdas

## Todo:

### General

#### Done
1.  ~~Abstract/Normalize the Lambda Response mechanisms.~~
2.  ~~Add local dynamodb storage (or figure out why local function invoke can't speak to remote dynamo).~~
3.  ~~Complete order call~~
4.  ~~Add created, updated dated, completed to Transaction~~
5.  ~~Complete confirm order.~~
7.  ~~Flesh out the product model~~
8.  ~~Research PCI compliant storage of CC information with AWS.~~
11.  ~~Add transaction logic for creates and recycles.~~
13.  ~~Add indexes to `serverless.yml` `Resources` definitions.~~ 
15.  ~~Convert "transactions" to "sessions", add a transaction (receipt) model/table.~~
16.  ~~Complete Round Trip Integration Test.~~

#### Outstanding

6.  ~~Add campaign to model~~
9.  ~~Add User model~~
10.  Add indexes "completed-index", "created-index" to transactions *(REEVALUATE)*
12.  Think on the recurring transaction processor mechanism.
14.  Add Unit Testing.
17.  ~~Add data fixtures to remote DynamoDB.~~

To add remote fixtures execute `export AWS_PROFILE=six; serverless dynamodb executeAll --stage {stage}`

18.  Mutations for Graph entities
19.  ~~Convert all endpoints to use Entity Controllers~~
20.  ~~Eliminate raw Dynamo transactions from the endpoints~~
21.  Handle "no results" with Graph
22.  Handle Authentication with Graph/JWTs whatever
23.  ~~Convert "providers" to merchantproviders~~
24.  ~~Change Campaign to allow multiple product schedules~~
25.  Add user to all models (required for multi-tenancy.)
26.  ~~Pass user context in JWTs~~

### Verify Signature

Reminder:  Access Key is the SHA-1  of the customer's email address.
Clean up the callback code...

### Verify JWT

### Acquire Token

### Create Lead

### Create Order

* Add more validation

### Confirm Order

* Add more validation

## Deployment

## DynamoDB

To start the local Dynamo instance: `sls dynamodb start --stage development -P 8001`.  To interact with the local DynamoDB instance, use the AWS Command Line Interface.  

## Local Development

Make sure to turn on the local DynamoDB instance.

Invoke functions as follows: `export SLS_DEBUG=*; serverless invoke local -f createlead -p ./endpoints/createlead/success_event.json  --stage local`

## Known Issues

1.  ~~When working with a new deployment, the lambda roles doesn't appear to have sufficient permissions to read/write against the DynamoDB tables.~~
2.  ~~When deleting an instance, CloudFormation fails to delete the S3 bucket that holds the deployment artifacts as well as the IAM Role.~~
3.  ~~Store Credit Card in Order Create doesn't make a lot of sense...~~
4.  ~~Needs to store the CCs~~
5.  CC record missing from the transaction. *Confirm*
6.  Occasionally, the product is missing from the transaction. *Confirm*
7.  Customer doesn't need a billing address. *Confirm*


