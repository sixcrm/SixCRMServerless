# SixCRM

## MVP Todo:

1. Deployment
- Add Cross Account Serverless Deployment
- Production Deployment notification
- SES Deployment
- KMS Deployment
- Cloudsearch Deployment
- Move R53
2. Notifications
- Build them
- Test them
3. Search
- Unit Testing 
- Integration Testing
4. UserACLs/Registration/Authentication
- E2E Tests
5. Technical Debt
- Resolve mentions of `//Technical Debt:` in the codebase
6. Testing
- Unit Testing above 85%
- Functional Testing Complete
- Resolve Linting Issues
7. State Machine
- Hashtag integration
- DLQ's for all pertinent queues
8. Transaction Endpoints
- Re-open the Transaction Endpoints
- Integration Tests
9. Assorted
- Test/Complete the Slack Lambda Error integration
- Test the SES Lambda integration
- Blacklist from the DynamoDB table

### General

Configure your AWS credentials:

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
When pushing to the repository, the commit will not be deployed to production unless it has been tagged with a appropriate version number.  Version numbers are provided as `v\d+.*`
In order to push a commit with a tag, use git syntax as follows: `git push --follow-tags`.  You may also configure your local git instantiation as follows if you choose: `git config --global push.followTags true`.


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

In order to run linter, execute `npm run lint`.
