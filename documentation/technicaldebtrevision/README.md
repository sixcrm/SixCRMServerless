# Technical Debt and Future Revision

## Entities

The following models need some embellishment:

### Account.js

  - `list()` method needs revision:  Master should see all, standard Users should see based on user ACLs

### Roles

  - Non-account, non-user for now
  - Someday people are going to need to create roles specific to accounts

### Users

  - Non account, non-user
  - List should be by UserACL

### Entity.js

- The `list*()` methods need revision.  In particular, the methods need to make multiple calls to the database to meet the pagination requirements


## ACLs

- ACLs need to be embellished in order to provide cross account access to resources (Makes immutable objects possible.)
- ACLs should be embellished to allow for universal actions rather than disabling the acls on demand.
