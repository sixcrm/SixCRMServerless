COPY transactions
FROM 's3://sixcrm-redshift-staging/test.csv' credentials 'aws_access_key_id=;aws_secret_access_key='
IGNOREHEADER 1
DELIMITER ',';


COPY transactions
FROM 's3://sixcrm-redshift-staging/test_24042017.csv' credentials 'aws_access_key_id=;aws_secret_access_key='
IGNOREHEADER 1
DELIMITER ',';


COPY f_transactions
FROM 's3://sixcrm-redshift-staging/tim_test.json'
credentials 'aws_access_key_id=AKIAIP6FAI6MVLVAPRWQ;aws_secret_access_key=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'
json 'auto' timeformat 'YYYY-MM-DDTHH:MI:SS'


AldoZelen,
w#YO4)y!gvSd,
,dEI9TcuaaqEGQBvk+WF/Dy6GDr9PXqrTXsZlxt1V,
https://068070110666.signin.aws.amazon.com/console

User name,
Password,
Access key ID,S
ecret access key,Console login link
