# Accessing Elasticache from Public Lambdas

As a consquence of having integrated both DynamoDB (no VPC endpoints currently,) as well as Elasticache (which is only available in AWS VPCs) we are forced to integrate a NAT Instance into the architecture.  Essentially this machine serves as a forward proxy for all Elasticache requests.  

## Setup

1.  Launch a NAT Instance from the list of NAT instance AMI's in the EC2 console.  It's probably best to select the most current version.
2.  Create a EIP and associated it with the NAT instance.
3.  Add a security group to the NAT instance.  The security group should allow ingress on port 22 (ssh) as well 6379.  The egress rules should allow all traffic to anywhere (`0.0.0.0/32`).  Note that you may very well choose to change these rules and tighten them up.
4.  SSH into the NAT Instance and perform the following operations:

```
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
```

Select one of the following operations (I'm not sure that I remember which one worked...)

```
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 6379 -j DNAT --to sixcrm-dev.mmka6q.clustercfg.use1.cache.amazonaws.com:6379
```
or...
```
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 6379 -j DNAT --to 172.31.63.232:6379
[root@ip-172-31-29-60 ec2-user]# iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 6379 -j DNAT --to 172.31.21.15:6379
```

## Test

Validate that the NAT to Elasticache proxying is functional:

```
$ redis-cli -h <EIP> -p <port> ping
```
The response, if functional should be
```
PONG
```
