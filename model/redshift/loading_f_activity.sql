SELECT DISTINCT associated_with_type
FROM f_activity
WHERE
  associated_with_type not IN
      ('accesskey', 'account', 'affiliate', 'campaign', 'creditcard', 'customer', 'customernote', 'emailtemplate', 'fulfillmentprovider', 'loadbalancer', 'merchantprovider', 'notification', 'notificationread', 'notificationsetting', 'product', 'productschedule', 'rebill', 'role', 'session', 'shippingreceipt', 'smtpprovider', 'tracker', 'transaction', 'user', 'useracl', 'userdevicetoken', 'usersetting', 'usersigningstring')




UPDATE f_activity SET ACTOR_TYPE =
CASE
WHEN actor_type ='users' THEN 'user'
WHEN actor_type ='customers' THEN 'customer'
ELSE actor_type
END;

update f_activity set associated_with_type = REGEXP_REPLACE( associated_with_type, 's$','');


select * from f_activity;