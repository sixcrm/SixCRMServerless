INSERT INTO f_activity (id, datetime, account, actor, actor_type, action, acted_upon, acted_upon_type, associated_with, associated_with_type)
  ((
     SELECT
       '7217bd5d-ab4b-4bfc-a5c5-a853a9b72cc1',
       '2017-03-22 10:52:04',
       'd3fa3bf3-7824-49f4-8261-87674482bf1c',
       'rama@damunaste.org',
       'customer',
       'deleted',
       'rama@damunaste.org',
       'role',
       'rama@damunaste.org',
       'transaction'
     UNION ALL
     SELECT
       '8eaf6be9-88f0-48ad-87af-3ece911b3424',
       '2017-04-10 21:38:21',
       'd3fa3bf3-7824-49f4-8261-87674482bf1c',
       'rama@damunaste.org',
       'customer',
       'deleted',
       'rama@damunaste.org',
       'productschedule',
       'rama@damunaste.org',
       'customernote'
     UNION ALL
     SELECT
       'c5638f41-0d0d-403b-9e46-0acb1e537c6b',
       '2017-01-19 19:39:47',
       'd3fa3bf3-7824-49f4-8261-87674482bf1c',
       'rama@damunaste.org',
       'customer',
       'deleted',
       'rama@damunaste.org',
       'userdevicetoken',
       'rama@damunaste.org',
       'transaction'
     UNION ALL
     SELECT
       'a1a93ad8-f207-4ed8-9393-a3b7d7a9d605',
       '2017-02-23 09:02:17',
       'd3fa3bf3-7824-49f4-8261-87674482bf1c',
       'timothy.dalbey@sixcrm.com',
       'user',
       'deleted',
       'kris@sixcrm.com',
       'tracker',
       'super.user@test.com',
       'smtpprovider'
     UNION ALL
     SELECT
       '0d9b9166-ca0a-47db-8f63-3e64cb8fb5fd',
       '2017-01-27 22:13:39',
       'd3fa3bf3-7824-49f4-8261-87674482bf1c',
       'rama@damunaste.org',
       'customer',
       'deleted',
       'rama@damunaste.org',
       'merchantprovider',
       'rama@damunaste.org',
       'userdevicetoken'
     UNION ALL
     SELECT
       '25324eaf-80f2-4c87-b696-bb66aa2ee028',
       '2017-01-16 16:39:34',
       'd3fa3bf3-7824-49f4-8261-87674482bf1c',
       'rama@damunaste.org',
       'customer',
       'continued',
       'rama@damunaste.org',
       'notificationread',
       'rama@damunaste.org',
       'smtpprovider')
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
