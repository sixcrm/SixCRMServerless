# ETL for transformation inside the Redshift database

--------------------------------------------------------------------------------

## ETL mappings :

Considering that f_transactions.id = f_transactions /*f_product_schedules*/.transactions_id the rest of the table definition is exactly the same, allowing for a seamless migration of all data before changing the product_schedules table
Migrating all data from product schedules to transactions 
