COPY f_transactions
FROM 's3://sixcrm-development-redshift/f_transactions.csv000'
credentials 'aws_access_key_id=;aws_secret_access_key='
DELIMITER ',';

COPY f_activity
FROM 's3://sixcrm-development-redshift/f_activity.csv000'
credentials 'aws_access_key_id=;aws_secret_access_key='
DELIMITER ',';

COPY f_events
FROM 's3://sixcrm-development-redshift/f_events.csv000'
credentials 'aws_access_key_id=;aws_secret_access_key='
DELIMITER ',';

COPY f_product_schedules
FROM 's3://sixcrm-development-redshift/f_product_schedules.csv000'
credentials 'aws_access_key_id=;aws_secret_access_key='
DELIMITER ',';

COPY f_sessions
FROM 's3://sixcrm-development-redshift/f_sessions.csv000'
credentials 'aws_access_key_id=;aws_secret_access_key='
DELIMITER ',';

COPY d_bin
FROM 's3://sixcrm-development-redshift/d_bin.csv000'
credentials 'aws_access_key_id=;aws_secret_access_key='
DELIMITER ',';

COPY d_datetime
FROM 's3://sixcrm-development-redshift/d_datetime.csv000'
credentials 'aws_access_key_id=;aws_secret_access_key='
DELIMITER ',';
