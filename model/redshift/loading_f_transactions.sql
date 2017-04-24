COPY f_transactions
FROM 's3://sixcrm-redshift-staging/test.csv' credentials 'aws_access_key_id=AKIAIP6FAI6MVLVAPRWQ;aws_secret_access_key=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' 
IGNOREHEADER 1 
DELIMITER ',';


COPY f_transactions
FROM 's3://sixcrm-redshift-staging/test_24042017.csv' credentials 'aws_access_key_id=AKIAIP6FAI6MVLVAPRWQ;aws_secret_access_key=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' 
IGNOREHEADER 1 
DELIMITER ',';
