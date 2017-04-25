COPY d_datetime
FROM 's3://sixcrm-redshift-staging/time_dataset.csv' credentials 'aws_access_key_id=;aws_secret_access_key='
IGNOREHEADER 1
DELIMITER ',';
