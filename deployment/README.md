# Deployment Notes:

The following deployment process worked in the staging environment:

1. Run `/deployment/s3/deploy.js`
2. ___Manual Step___: Add a `config.json` file to the `sixcrm-{stage}-configuration-master` bucket
  - To-do: Automate the creation of the config.json file.
  - Currently the configuration file must be a JSON object (AKA `{}`)
3.  Run `/deployment/ec2/deploy_security_groups.js`
  - To-do: Make sure new Elasticache Security Group is available
4.  Run `/deployment/elasticache/deploy.js`
  - To-do: Associate with the new Elasticache Security Group from (3)
5.  ___Manual Step___ Step___:  Create the NAT Instance (Automate)
  - Instantiate NAT instance from EC2 Launch Console (search for AMI's in the Community section against the term `amzn-ami-vpc-nat`)
6.  ___Manual Step___: Create a EIP
7.  ___Manual Step___: Associate the EIP to the NAT Instance from (5)
8.  ___Manual Step___: Acquire the Elasticache IP address (`host {endpoint}` from the terminal should suffice)
9.  ___Manual Step___: Run the IP tables script below:
```sh
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 6379 -j DNAT --to {elasticache_ip_address}:6379
service iptables save
```
10. Test the Elasticache Cluster and the NAT Instance
```sh
$ redis-cli -h {nat_eip} -p 6379
{nat_eip}:6379> ping
PONG
{nat_eip}:6379> set a b
OK
{nat_eip}:6379> get a
"b"
```
11. Run `deployment/sqs/deploy.js`
12. Run `deployment/dynamodb/deploy_tables.js`
13. Run `deployment/redshift/deploy_cluster.js`
14. ___Manual Step___:  Add Redshift port to default VPC security group
  - To-Do:  We should create a specific Security Group in step (3) and associate it to the Redshift cluster.
  - To-Do:  A.Z : Writing of hostname to config bucket.
15. ___Broken___: Run `deployment/redshift/deploy_tables.js`
16. ___Manual Step___: Update all the Redshift Cluster references in the `config/{stage}/site.yml` file with the appropriate path information.  References should be structured as `'jdbc:redshift://{cluster_name}.{some_string}.{aws_region}.redshift.amazonaws.com:5439/{database_name}'`
17.  ___Manual Step___:  Create Kinesis IAM Role
  - Name: `firehose_delivery_role`
  - Policy Document
  ```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "firehose.amazonaws.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "821071795213"
        }
      }
    }
  ]
}
```
  - Permissions:
    - Currently:  Full access to Lambda, S3, Cloudwatch and Redshift
    - To-Do:  These permissions need to be paired down significantly
18. Run `deployment/kinesis/deploy_streams.js`
19. Run `deploymen/cloudsearch/deploy.js`
20. Run `serverless deploy --stage {stage}`
21. Run `deployment/dynamodb/deploy_seeds.js`
22. Test deployment
  - Run `npm run test-integration`
