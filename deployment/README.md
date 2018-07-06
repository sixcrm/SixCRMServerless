# Deployment Notes:

The following deployment process worked in the staging environment:
0. Manual Step: Import certificate
0. Run `deployment/s3/deploy_buckets.js` (Note: Configuration Utilities tries to read from configuration bucket here, that we are creating...)
1. Run `/deployment/iam/deploy_roles.js`
3.  Run `/deployment/ec2/deploy_security_groups.js`
# 4.  Run `/deployment/elasticache/deploy.js`
5.  ___Manual Step___ Step___:  Create the NAT Instance (Automate)
  - Instantiate NAT instance from EC2 Launch Console (search for AMI's in the Community section against the term `amzn-ami-vpc-nat`)
6.  ___Manual Step___: Create a EIP
7.  ___Manual Step___: Associate the EIP to the NAT Instance from (5), add the EIP to the `config/{stage}/site.yml` file under `elasticache.endpoint`
8.  ___Manual Step___: Acquire the Elasticache IP address (`host {endpoint}` from the terminal should suffice)
9.  ___Manual Step___: Run the IP tables script below:
```sh
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 6379 -j DNAT --to {elasticache_ip_address}:6379
service iptables save
```
*Note:* Recreating the cluster may also re-create the IP address associated with the cluster.  If that is the case, you will need to clear the IP Tables rules and repeat the manual commands above with the new IP address.

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
11. Run `deployment/sqs/deploy_queues.js`
12. Run `deployment/dynamodb/deploy_tables.js`
13. Run `deployment/redshift/deploy_cluster.js` (Issue: promise rejection)
16. Run `deployment/redshift/deploy_tables.js`
17. Run `deployment/redshift/deploy_seeds.js`
19. Run `deployment/cloudsearch/deploy.js`
20. Run `serverless deploy --stage {stage}`
 - Note:  This may need to occur earlier in the deployment due to the need for the roles at deployment time.
21. Add custom domain name in API Gateway
21. Run `deployment/dynamodb/deploy_seeds.js`
22. Test deployment
  - Run `npm run test-integration`
