#!/bin/bash
echo 'Destroying Redshift cluster';

#

aws redshift delete-cluster --cluster-identifier sixcrm-test-deploy --skip-final-cluster-snapshot
