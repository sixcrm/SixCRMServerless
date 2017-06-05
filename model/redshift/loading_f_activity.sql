COPY f_activity
FROM 's3://sixcrm-redshift-staging/test_activity.csv'
credentials 'aws_access_key_id=AKIAIP6FAI6MVLVAPRWQ;aws_secret_access_key=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'
IGNOREHEADER 1
DELIMITER ',';
