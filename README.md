# SixCRM

# In progress:
21.  Encrypted personal data
15.  Developer Site

# Todo:
1.  Rewrite the ReadMe
2.  Refactor ACL
  - User Groups
  - More Granular Permissions
3.  Bulk Operations
8.  Blue/Green Deployment
9.  Feature Flags / Feature Flags API
10. Integrated Workflows on FE
11.  iOS launch and upgrades
12.  E2E tests on all features across sites
14.  Integrate POC Predictive analytics
16.  More Templating for checkout, perfomancemarketing example etc
17.  Function pruning in deploys
18.  Security enhancements
19.  Deployment Encryption validation
20.  Penetration Testing
22.  Enterprise Auth0 integration (separate keys)
23.  Automated Bill Creation

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

### Pruning Lambdas

Once in a while we run out of space for lambdas on AWS because we keep the old versions uploaded.
If you get errors like `Code storage limit exceeded` when deploying that is why. In order to proceed, run
`AWS_PROFILE=six sls prune -n <number of versions to keep> --stage <environment>` for example
`AWS_PROFILE=six sls prune -n 10 --stage development`. You might want to adjust the variables `AWS_SECRET_ACCESS_KEY` and
`AWS_ACCESS_KEY_ID` to match the environment you use. After the purge is complete you probably need to login to AWS console
and manually trigger a stack rollback action in CloudFormation, because it's likely stuck in rollback state due to missing space.
After the stack rolls back, deploy again.

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

Note: Make sure you have Java JDK 8.0+ installed in order to be able to run the local SQS server.

To start a local SQS server, make sure the file `tools/elasticmq/runLocalSqs.sh` in the project root is executable (`chmod u+x tools/elasticmq/runLocalSqs.sh`)
and run it (`tools/elasticmq/runLocalSqs.sh`). It will download and run the local ElasticMQ server which is compatible with SQS.
You can use it as an Amazon SQS instance, including calling methods documented in the Amazon SQS API Reference: http://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/Welcome.html
After running the server you can execute the deploy script to create queues. You can do so by running `SIX_VERBOSE=2 AWS_PROFILE=six stage=local node deployment/sqs/deploy_queues.js`.
Much like local DynamoDB, local SQS server keeps the queues in-memory, which means that after restarting it you need to create queues again.

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

#### Redshift

Scripts:

 - Create a cluster:
 `node ./deployment/redshift/create_cluster.js {stage}`
 - Create tables:
  `node ./deployment/redshift/deploy_redshift_tables.js {stage}`
 - Truncate all tables:
  `node ./deployment/redshift/purge_redshift.js {stage}`
 - Seed static data:
  `node ./deployment/redshift/seed_redshift.js {stage}`
 - Drop all tables:
  `node ./deployment/redshift/destroy_redshift.js {stage}`
 - Destroy cluster:
  `node ./deployment/redshift/destroy_cluster.js {stage}`

#### S3

## Testing

Six comes with a robust testing package.

### Unit tests

To run unit tests execute `npm run test-unit` in the root of the project. Tests are also run automatically before each
commit. You can access the code coverage report at `coverage/lcov-report/index.html`.

### State machine tests

In order to run functional tests, you need working local SQS instace. Refer to the paragraph `SQS`, but in essence:

1. `tools/elasticmq/runLocalSqs.sh` (keep running in a separate terminal)
2. `SIX_VERBOSE=2 AWS_PROFILE=six stage=local node deployment/sqs/deploy_queues.js` (execute to create local queues)
3. `npm run test-functional` (run tests)

### Redshift query tests

We have tests that cover our analytics queries. In order to run them you need a running docker cluster.

1. `sudo docker-compose --file tools/docker/docker-compose.yml up -d`
2. `npm run test-queries`

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

Currently deployment is (mostly) handled via CircleCI. There are a few issues:

* API Gateway requires some manual configuration - certificates, custom domain names for example.
 - Specifically:  On the first deployment, you must configure the custom domain name in API Gateway and map it to the new API Gateway deployment.  In doing so, you must first add the SixCRM wildcard cert to ACM.

## Data Spoofing 

The Six deployment has random data "spoofers" -  that is scripts which attempts to emulate data in the absence of real usage or customer data.
