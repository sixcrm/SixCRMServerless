# Tests for Redshift queries

____

The syntax of queries where changed to be compliant on PostgreSQL database as well as Redshift
Typical changes where :

(Redshift) WHERE 1 to (PostgreSQL) WHERE 1=1
(Redshift) nvl to (PostgreSQL) coalesce
(Redshift) decode to (PostgreSQL) case

All queries that are integrated in the *Analytics.js* class are/will be covered with test, be there integrated via GraphQL or no.


## Tests

### Dashboard

These tests cover the queries found in report or order_engine directory

#### Report

All tests start with `Report`

#### Order Engine (State machine)

All tests start with `Order Engine`

#### Others
