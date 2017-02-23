# SixCRM Transaction Lambdas

## Todo:

### General

#### Outstanding

-  Add fulfillment fields
-  Graph Mutations (Update, Create, Delete)
-  Handle "no-results" with Graph
-  Endpoint User validation (active, has access)
-  Add indexes "completed-index", "created-index" to transactions *(REEVALUATE)*
-  Think on the recurring transaction processor mechanism.
-  Add Unit Testing.
-  Add Affiliate to Session Create


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

To add remote fixtures execute `export AWS_PROFILE=six; serverless dynamodb executeAll --stage {stage}`

To start the local Dynamo instance: `sls dynamodb start --stage local -P 8001`.  To interact with the local DynamoDB instance, use the AWS Command Line Interface.  

Note:  To execute these features, you will need the JDK version 8.0+ installed as well as having necessarily installed the Serverless dynamo package using `sls dynamodb install` after the `npm install` steps.

## Local Development

Make sure to turn on the local DynamoDB instance.

Invoke functions as follows: `export SLS_DEBUG=*; serverless invoke local -f createlead -p ./endpoints/createlead/success_event.json  --stage local`

## Running unit tests

To run unit tests execute `npm run test-unit` in the root of the project. Tests are also run automatically before each
commit. You can access the code coverage report at `coverage/lcov-report/index.html`.

## Known Issues

5.  CC record missing from the transaction. *Confirm*
6.  Occasionally, the product is missing from the transaction. *Confirm*
7.  Customer doesn't need a billing address. *Confirm*
8.  Delete/Update methods need to check for existence first.

## For immediate refinement:

1.  The "hydrate" methods suck -  improve.
2.  The error handling in the endpoints seems like garbage.
3.  Graph endpoint should not return the data when there's an error, it should be a clear "error: message" sort of thing


