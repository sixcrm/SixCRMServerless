# SixCRM

## Local Development

### AWS credentials:

~/.aws/credentials
```
[six]
aws_access_key_id=XXX
aws_secret_access_key=YYY
```
Where XXX and YYY are your actual credentials. Ask Timothy to generate them for you.

~/.aws/config
```
[six]
region=us-east-1
output=json
```

### Executing Lambdas locally

Invoke lambda functions locally as follows:

`export SLS_DEBUG=*; export SIX_VERBOSE=2; AWS_PROFILE=six serverless invoke local -f createlead -p ./endpoints/createlead/success_event.json  --stage local`

Note that when lambdas are executed locally, the API gateway implementation which is in use in AWS environments is not implemented.  This may have unexpected consequences, particularly when HTTP requests are being simulated.

### Committing to the Repository

When pushing to the repository, the commit will not be deployed to production unless it has been tagged with a appropriate version number.  Version numbers are provided as `v\d+.*`
In order to push a commit with a tag, use git syntax as follows: `git push --follow-tags`.  You may also configure your local git instantiation as follows if you choose: `git config --global push.followTags true`.

Note that there are also pre-commit hooks enabled which will automatically lint your changes as well as execute unit test packages against your commit.

### Local Dependencies:

#### DynamoDB
To start the local Dynamo instance: `sls dynamodb start --stage local -P 8001`.  To interact with the local DynamoDB instance, use the AWS Command Line Interface.  Note that you will need to specify the `endpoint-url`, i.e. `aws dynamodb list-tables --endpoint-url http://localhost:8001`.

To add all dynamodb tables to AWS for a stage execute: `AWS_PROFILE=six npm run deploy-tables -- {stage}` (where `{stage}` is `local`, `development`, or `production`).

To remove all dynamoDB tables for a stage execute: `AWS_PROFILE=six npm run purge-tables -- {stage}` (where `{stage}` is `local`, `development`, or `production`).

To seed dynamodb data, execute `AWS_PROFILE=six SIX_VERBOSE=2 npm run deploy-seeds {stage}`.

If you get `Error: spawn java ENOENT`, you need to do `sls dynamodb install --stage {stage}`.

#### SQS

To start a local SQS server, make sure the file `tools/elasticmq/runLocalSqs.sh` in the project root is executable (`chmod u+x tools/elasticmq/runLocalSqs.sh`)
and run it (`tools/elasticmq/runLocalSqs.sh`). It will download and run the local ElasticMQ server which is compatible with SQS.
You can use it as an Amazon SQS instance, including calling methods documented in the Amazon SQS API Reference: http://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/Welcome.html
Our queues are defined in the `tools/elasticmq/sqs-local.conf` file and are created automatically when the ElasticMQ is run via `tools/elasticmq/runLocalSqs.sh` file.

Note:  To execute these features, you will need the JDK version 8.0+ installed as well as having necessarily installed the Serverless dynamo package using `sls dynamodb install --stage local` after the `npm install` steps.

#### Redis

You will also need a Redis service available on your local machine.  To accomplish this there are a variety of options:

1.  On a OSX machine with `brew` installed, execute the following command:  `brew install redis`.  Once the installation has completed successfully, you may start a hanging redis process by executing `redis-server /usr/local/etc/redis.conf` command.
2.  If you have Docker installed, you may also run the following command: `docker run -d -p 6379:6379 redis`.  Note that this creates a daemon which will run indefinitely or until you execute a `docker kill` command or exit the Docker host program.
3.  If all else fails, you may disable the cache in the `/config/local.yml` by setting the `cache.usecache` variable to `0` as follows:

```yml
cache:
  usecache: 0
  cachebuster: 'somerandomstring'
```

Make sure that your local connection information is correct in the `/config/local/site.yml` file if connection trouble persists.

## Testing

Six comes with a robust testing package.

### Unit tests

To run unit tests execute `npm run test-unit` in the root of the project. Tests are also run automatically before each
commit. You can access the code coverage report at `coverage/lcov-report/index.html`.

### Functional tests

1. Make sure ElasticMQ is running
1. Make sure local dynamodb is running
1. execute `npm run test-functional`

### Integration tests

Integration tests run against remote environments.  To run the integration test package, execute the following command:

`npm run test-integration`

### Linting

We're using ESLint (http://eslint.org/) for linting. Initial set of rules is fairly relaxed, and we should slowly
add more rules as the codebase and style stabilizes.

In order to run linter, execute `npm run lint`.

Rules are defined in `.eslintrs.js` file in the project root. You can check the available rules at http://eslint.org/docs/rules/
Rules with level `warn` will not break the deploy, but `error` will.

In order to disable rules in code (for example for false positives, or old deprecated code) read http://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments

## Deployment

Currently deployment is (mostly) handled via CircleCI.  There are a few issues:

* API Gateway requires some manual configuration - certificates, custom domain names for example.

## Data Spoofing

The Six deployment has random data "spoofers" -  that is scripts which attempts to emulate data in the absence of real usage or customer data.  
