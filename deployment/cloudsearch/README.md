iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 6379 -j DNAT --to sixcrm-dev.mmka6q.clustercfg.use1.cache.amazonaws.com:6379
[root@ip-172-31-29-60 ec2-user]# iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 6379 -j DNAT --to 172.31.63.232:6379
[root@ip-172-31-29-60 ec2-user]# iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 6379 -j DNAT --to 172.31.21.15:6379
