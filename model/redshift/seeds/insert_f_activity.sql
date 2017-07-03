INSERT INTO f_activity (id, datetime, account, actor, actor_type, action, acted_upon, acted_upon_type, associated_with, associated_with_type)
  ((
     SELECT
       '99999999-999e-44aa-999e-aaa9a99a9999',
       '2017-01-01 00:00:00.000000',
       '99999999-999e-44aa-999e-aaa9a99a9999',
       'system',
       'system',
       'deleted',
       '99999999-999e-44aa-999e-aaa9a99a9999',
       'rebill',
       '99999999-999e-44aa-999e-aaa9a99a9999',
       'merchantprovider')
   EXCEPT
   SELECT
     fa.id,
     fa.datetime,
     fa.account,
     fa.actor,
     fa.actor_type,
     fa.action,
     fa.acted_upon,
     fa.acted_upon_type,
     fa.associated_with,
     fa.associated_with_type
   FROM f_activity fa);
