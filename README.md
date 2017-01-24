# SixCRM Transaction Lambdas

## Todo:

### General

#### Outstanding

1.  Add fulfillment fields
2.  Complete Graph Schema for Reads
3.  Graph Mutations (Update, Create, Delete)
4.  Handle "no-results" with Graph
5.  Endpoint User validation (active, has access)

10.  Add indexes "completed-index", "created-index" to transactions *(REEVALUATE)*
12.  Think on the recurring transaction processor mechanism.
14.  Add Unit Testing.

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

To start the local Dynamo instance: `sls dynamodb start --stage development -P 8001`.  To interact with the local DynamoDB instance, use the AWS Command Line Interface.  

## Local Development

Make sure to turn on the local DynamoDB instance.

Invoke functions as follows: `export SLS_DEBUG=*; serverless invoke local -f createlead -p ./endpoints/createlead/success_event.json  --stage local`

## Known Issues

5.  CC record missing from the transaction. *Confirm*
6.  Occasionally, the product is missing from the transaction. *Confirm*
7.  Customer doesn't need a billing address. *Confirm*


