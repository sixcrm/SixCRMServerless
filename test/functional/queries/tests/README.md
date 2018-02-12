# Tests for Redshift queries

____

The syntax of queries where changed to be compliant on PostgreSQL database as well as Redshift
Typical changes are :

(Redshift) WHERE 1 to (PostgreSQL) WHERE 1=1
(Redshift) nvl to (PostgreSQL) coalesce
(Redshift) decode to (PostgreSQL) case

All queries that are integrated in the *Analytics.js* class are/will be covered with test, be there integrated via GraphQL or not.
All queries are covered with multiple tests whose specifics are described in the config.json of the respectfully test.

The docker image that is used is : circleci/postgres:9.6
It is important to use a modern PostgreSQL version that has IF EXISTS for Creating and IF NOT EXISTS for destroying as this makes queries idempotent.

## Tests

### Dashboard

These tests cover the queries found in report or order_engine directory

#### Report

All tests start with `Report`

#### Order Engine (State machine)

All tests start with `Order Engine`

#### Others

Other queries that are found in the analytics directory

### Queries that are not integrated into Analytics.js

* transactions_by_affiliate
* transactions_facet_timeseries
* events_by_affiliate
* events_by_facet_timeseries
* merchant_report_summary
* sessions
* sub_affiliates_overview
