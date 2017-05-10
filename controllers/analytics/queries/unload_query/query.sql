UNLOAD ('SELECT * FROM ({{query}})')
TO 's3://sixcrm-redshift-output/{{filename}}'
credentials 'aws_access_key_id={{access_id}};aws_secret_access_key={{access_key}}'
DELIMITER AS  ','
ALLOWOVERWRITE
PARALLEL OFF ;
