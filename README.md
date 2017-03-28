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

Configure your AWS credentials:
<<<<<<< HEAD
=======

~/.aws/credentials
```
[six]
aws_access_key_id=XXX
aws_secret_access_key=YYY
```
Where XXX and YYY are your actual credentials. Ask Timothy to generate them fot you.

~/.aws/config
```
[six]
region=us-east-1
output=json
```

To add remote fixtures execute `export AWS_PROFILE=six; serverless dynamodb executeAll --stage {stage}` (where `{stage}` is `local`, `development` or `production`).

~/.aws/credentials
```
[six]
aws_access_key_id=XXX
aws_secret_access_key=YYY
```
Where XXX and YYY are your actual credentials. Ask Timothy to generate them fot you.

~/.aws/config
```
[six]
region=us-east-1
output=json
```

To add remote fixtures execute `export AWS_PROFILE=six; serverless dynamodb executeAll --stage {stage}` (where `{stage}` is `local`, `development` or `production`).

To start the local Dynamo instance: `sls dynamodb start --stage local -P 8001`.  To interact with the local DynamoDB instance, use the AWS Command Line Interface.  Note that you will need to specify the `endpoint-url`, i.e. `aws dynamodb list-tables --endpoint-url http://localhost:8001`.

If you get `Error: spawn java ENOENT`, you need to do `sls dynamodb install --stage {stage}`.
 
To start a local SQS server, make sure the file `tools/elasticmq/runLocalSqs.sh` in the project root is executable (`chmod u+x tools/elasticmq/runLocalSqs.sh`)
and run it (`tools/elasticmq/runLocalSqs.sh`). It will download and run the local ElasticMQ server which is compatible with SQS.
You can use it as an Amazon SQS instance, including calling methods documented in the Amazon SQS API Reference: http://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/Welcome.html
Our queues are defined in the `tools/elasticmq/sqs-local.conf` file and are created automatically when the ElasticMQ is run via `tools/elasticmq/runLocalSqs.sh` file.

Note:  To execute these features, you will need the JDK version 8.0+ installed as well as having necessarily installed the Serverless dynamo package using `sls dynamodb install --stage local` after the `npm install` steps.

## Local Development

Make sure to turn on the local DynamoDB instance.

Invoke functions as follows: `export SLS_DEBUG=*; export SIX_VERBOSE=2; AWS_PROFILE=six serverless invoke local -f createlead -p ./endpoints/createlead/success_event.json  --stage local`

## Running unit tests

To run unit tests execute `npm run test-unit` in the root of the project. Tests are also run automatically before each
commit. You can access the code coverage report at `coverage/lcov-report/index.html`.

## Running functional tests
1. Make sure ElasticMQ is running
1. Make sure local dynamodb is running
1. execute `npm run test-functional`

## Running linter
We're using ESLint (http://eslint.org/) for linting. Initial set of rules is fairly relaxed, and we should slowly
add more rules as the codebase and style stabilizes.

In order to run linter, execute `npm run lint`. Results will be written to `coverage/lint.html`.

## Known Issues

5.  CC record missing from the transaction. *Confirm*
6.  Occasionally, the product is missing from the transaction. *Confirm*
7.  Customer doesn't need a billing address. *Confirm*
8.  Delete/Update methods need to check for existence first.

## For immediate refinement:

1.  The "hydrate" methods suck -  improve.
2.  The error handling in the endpoints seems like garbage.
3.  Graph endpoint should not return the data when there's an error, it should be a clear "error: message" sort of thing


