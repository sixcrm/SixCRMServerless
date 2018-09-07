# Analytics Scripts

These scripts are for performing data migrations related to the new analytics reports ca. August 2018.

`update-transactions.js` -- This updates the existing transaction rows in the analytics schema with new columns.
`import-orders.js` -- This imports from the rebills in DynamoDB to new tables created for the Orders report.
`add-cycle-count.js` -- This adds a cycle count to rebills in DynamoDB.  The rebill creation code was updated to include this for future rebills, this adds it to past rebills for consistency and ease of use.
