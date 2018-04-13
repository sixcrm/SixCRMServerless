# Setting up NAT Gateway for Lambdas with static outgoing IP

The purpose of this setup is to ensure that lambda functions use a single static IP address when making calls to external third-party services.  This allows us to whitelist our IP with those services.

The first step is to create public subnets.
* We need to cover at least two availability zones.  I chose to create 3 subnets in us-east-1a/1b/1c.
* Our 6 existing subnets allocated a CIDR block of 4096 IPs each, X.Y.0.0/20, X.Y.16.0/20, X.Y.32.0/20, and so on.  I started the public subnets at X.Y.128.0/20 and followed the same pattern.
* Give these subnets a Name tag so we know which ones are which.

Next, create the NAT Gateway.
* Place it in one of the public subnets.  I chose the subnet in us-east-1a.
* Give it a Name tag of `public-lambda` -- this name is important, because this is what the integration test looks for.
* Note the ID of the NAT Gateway.
* Create a new Route Table.
  - Associate the new route table with the 3 new subnets.
  - Add a route with destination 0.0.0.0 and target the NAT Gateway (use the ID here).
  - Verify the pre-existing route table is still the Main route table, and that its target is the Internet Gateway.

All that's left is to configure the Lambda functions.
* To associate lambdas with subnets, they must be assigned a security group.
* Create an empty security group with no inbound rules, and one outbound rule allowing all traffic, protocols, and ports to 0.0.0.0/0.  The JSON schema looks like the following:
```
    "Description": "For Lambdas behind public NAT",
    "GroupName": "public-lambda",
    "Egress":{
      "IpPermissions": [
        {
          "IpProtocol": "-1",
          "IpRanges": [
            {
              "CidrIp": "0.0.0.0/0"
            }
          ]
        }
      ]
    }
```
* In `serverless.yml`, under `provider`, add a `vpc` section with `securityGroupIds` and `subnetIds`:
```
provider:
  # ...
  vpc:
    securityGroupIds: ${file(./config/${opt:stage}/site.yml):serverless.security_groups}
    subnetIds: ${file(./config/${opt:stage}/site.yml):serverless.subnets}
```
* In each environment's `site.yml`, add a `serverless` section, and specify the `subnets` and `security_groups` for that environment.
