# Accessing Elasticache from Public Lambdas

As a consquence of having integrated both DynamoDB (no VPC endpoints currently,) as well as Elasticache (which is only available in AWS VPCs) we are forced to integrate a NAT Instance into the architecture.  Essentially this machine serves as a forward proxy for all Elasticache requests.  

## Setup

1.  Launch a NAT Instance from the list of NAT instance AMI's in the EC2 console.  It's probably best to select the most current version.
2.  Create a EIP and associated it with the NAT instance.
3.  Add a security group to the NAT instance.  The security group should allow ingress on port 22 (ssh) as well 6379.  The egress rules should allow all traffic to anywhere (`0.0.0.0/32`).  Note that you may very well choose to change these rules and tighten them up.
4.  SSH into the NAT Instance and perform the following operations:

```
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 6379 -j DNAT --to 172.31.21.15:6379
service iptables save
```

Where `172.31.21.15` is the ip address associated with the ElastiCache endpoint.  The IP address of the Elasticache Cluster can be gathered by using the following:

```
host {ElastiCache Primary Endpoint}
```

*Note: This technique does not work with the Elasticache Cluster Mode. Six does not currently support Redis Clusters.*

## Test

Validate that the NAT to Elasticache proxying is functional:

```
$ redis-cli -h <EIP> -p <port> ping
```
The response, if functional should be
```
PONG
```

Thereafter, test the caching engine's ability to set and get from the Redis cluster as follows.  In the example, we assume that the IP address `34.204.230.178` is the EIP associated with the NAT Instance that you configured in Step 2 above.


```
$ redis-cli -h 34.204.230.178 -p 6379
34.204.230.178:6379> ping
PONG
34.204.230.178:6379> set a b
OK
34.204.230.178:6379> get a
"b"
```
