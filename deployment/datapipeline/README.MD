Notes:

To create and activate the data pipeline job, run these scripts in this order

1) node ./deployment/iam/deploy_roles.js
2) node ./deployment/iam/deploy_instance_profile.js
3) node ./deployment/datapipeline/deploy_pipeline.js

Technical Debt: This doesn't fit in line with our deployment strategy and will have to be run manaully on new instances. The actual migration can take up to a few hours, that could be sped up at the cost of increasing the read/write units on the bins table.