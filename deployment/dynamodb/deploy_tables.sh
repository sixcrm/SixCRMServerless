#!/bin/bash
serverless dynamodb install
serverless dynamodb executeAll --stage $CIRCLE_BRANCH