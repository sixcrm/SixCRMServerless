#!/bin/bash

#Technical Debt:  This is a short-hand utility, not intended or configured for use outside of development and debugging purposes.
export AWS_PROFILE=six
export AWS_REGION=us-east-1
export CS_DOMAIN=https://search-sixcrm-x5xewjrr254yjyrln4mlvxvfm4.us-east-1.cloudsearch.amazonaws.com
export DOMAIN_NAME=sixcrm

# Get ids of all existing documents, reformat as
# [{ type: "delete", id: "ID" }, ...] using jq
aws cloudsearch index-documents \
  --region=$AWS_REGION \
  --domain-name=$DOMAIN_NAME