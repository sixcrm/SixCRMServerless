COPY f_events
FROM 's3://sixcrm-redshift-staging/test_events.csv' credentials 'aws_access_key_id=;aws_secret_access_key='
IGNOREHEADER 1
DELIMITER ',';
