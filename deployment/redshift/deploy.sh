#!/bin/bash
echo 'Deploying Redshift';

#
# dc1.large
# 1

aws redshift create-cluster --node-type dc1.large --number-of-nodes 2 --master-username admin --master-user-password Sladoled9 --cluster-identifier sixcrm-test-deploy
