UNLOAD ('SELECT * FROM f_transactions')
TO 's3://sixcrm-development-redshift/f_transactions.csv'
credentials 'aws_iam_role=arn:aws:iam::068070110666:role/sixcrm_redshift_upload_role'
DELIMITER AS  ','
ALLOWOVERWRITE
PARALLEL OFF ;

UNLOAD ('SELECT * FROM f_activity')
TO 's3://sixcrm-development-redshift/f_activity.csv'
credentials 'aws_iam_role=arn:aws:iam::068070110666:role/sixcrm_redshift_upload_role'
DELIMITER AS  ','
ALLOWOVERWRITE
PARALLEL OFF ;

UNLOAD ('SELECT * FROM f_events')
TO 's3://sixcrm-development-redshift/f_events.csv'
credentials 'aws_iam_role=arn:aws:iam::068070110666:role/sixcrm_redshift_upload_role'
DELIMITER AS  ','
ALLOWOVERWRITE
PARALLEL OFF ;

UNLOAD ('SELECT * FROM f_product_schedules')
TO 's3://sixcrm-development-redshift/f_product_schedules.csv'
credentials 'aws_iam_role=arn:aws:iam::068070110666:role/sixcrm_redshift_upload_role'
DELIMITER AS  ','
ALLOWOVERWRITE
PARALLEL OFF ;

UNLOAD ('SELECT * FROM f_sessions')
TO 's3://sixcrm-development-redshift/f_sessions.csv'
credentials 'aws_iam_role=arn:aws:iam::068070110666:role/sixcrm_redshift_upload_role'
DELIMITER AS  ','
ALLOWOVERWRITE
PARALLEL OFF ;

UNLOAD ('SELECT * FROM d_bin')
TO 's3://sixcrm-development-redshift/d_bin.csv'
credentials 'aws_iam_role=arn:aws:iam::068070110666:role/sixcrm_redshift_upload_role'
DELIMITER AS  ','
ALLOWOVERWRITE
PARALLEL OFF ;

UNLOAD ('SELECT * FROM d_datetime')
TO 's3://sixcrm-development-redshift/d_datetime.csv'
credentials 'aws_iam_role=arn:aws:iam::068070110666:role/sixcrm_redshift_upload_role'
DELIMITER AS  ','
ALLOWOVERWRITE
PARALLEL OFF ;
