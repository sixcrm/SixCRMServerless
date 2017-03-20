#!/bin/bash

#Technical Debt:  This is a short-hand utility, not intended or configured for use outside of development and debugging purposes.
export AWS_PROFILE=six
export AWS_REGION=us-east-1
export CS_DOMAIN=https://search-sixcrm-x5xewjrr254yjyrln4mlvxvfm4.us-east-1.cloudsearch.amazonaws.com

# Get ids of all existing documents, reformat as
# [{ type: "delete", id: "ID" }, ...] using jq
aws cloudsearchdomain search \
  --region=$AWS_REGION \
  --endpoint-url=$CS_DOMAIN \
  --size=10000 \
  --query-parser=structured \
  --search-query="matchall" \
  | jq '[.hits.hit[]]' 