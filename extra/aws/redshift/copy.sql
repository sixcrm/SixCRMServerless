/* 21.04.2017 A.Zelen

   Fixed copy for a s3 bucket

*/

COPY f_transactions
FROM 's3://sixcrm-redshift-staging/test.csv' credentials 'aws_access_key_id=AKIAIP6FAI6MVLVAPRWQ;aws_secret_access_key=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'
IGNOREHEADER 1
DELIMITER ',';
