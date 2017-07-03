/* Technical debt need to make the location of S3 bucket parameterised*/

COPY d_bin
FROM 's3://sixcrm-development-redshift/sixcrm-resources/BIN/BinDB Premium DB License Apr2017.csv'
credentials 'aws_access_key_id=;aws_secret_access_key='
DELIMITER ','
maxerror as 2;
