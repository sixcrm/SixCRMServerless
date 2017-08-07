#!/bin/bash

#Technical Debt:  This is a short-hand utility, not intended or configured for use outside of development and debugging purposes.
export AWS_PROFILE=six
export AWS_REGION=us-east-1
export CS_DOMAIN=https://search-sixcrm-x5xewjrr254yjyrln4mlvxvfm4.us-east-1.cloudsearch.amazonaws.com
export DOMAIN_NAME=sixcrm

SEED_DIR=../../../model/dynamodb/tables/

# Entities to index.
allowed_entities='campaign customer product transaction';

mkdir -p add
rm add/*

# Generate seed-add operations.
for entity_type in ${allowed_entities}; do
    OUTPUT_FILE="add/add-${entity_type}s.json"
    echo $entity_type
    # Technical Debt: Split this into multiple lines
    # Technical Debt: Define allowed properties in variable.
    # Technical Debt: Handle address object properly (transform into primitive strings, like in the application code).
    cat "${SEED_DIR}/${entity_type}s.json" \
      | jq '.Seeds' \
      | jq --arg entity_type $entity_type 'map({type: "add", id: .id, fields: {entity_type: $entity_type, account: .account, active: .active, address_line_1: .address_line_1, address_line_2: .address_line_2, alias: .alias, amount: .amount, city: .city, country: .country, created_at: .created_at, email: .email, first_six: .first_six, firstname: .firstname, id: .id, index_action: .index_action, last_four: .last_four, lastname: .lastname, name: .name, phone: .phone, sku: .sku, state: .state, tracking_number: .tracking_number, updated_at: .updated_at, zip: .zip}})' \
      | jq 'map(del(.fields[] | nulls))' \
      > $OUTPUT_FILE
done

# Execute seed-add operations.
cd add
for add_request in `ls`; do
    aws cloudsearchdomain upload-documents \
      --region=$AWS_REGION \
      --endpoint-url=$CS_DOMAIN \
      --content-type='application/json' \
      --documents=$add_request
done
cd ..
