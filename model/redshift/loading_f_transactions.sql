COPY transactions
FROM 's3://sixcrm-redshift-staging/test.csv' credentials 'aws_access_key_id=;aws_secret_access_key='
IGNOREHEADER 1
DELIMITER ',';


COPY transactions
FROM 's3://sixcrm-redshift-staging/test_24042017.csv' credentials 'aws_access_key_id=;aws_secret_access_key='
IGNOREHEADER 1
DELIMITER ',';

