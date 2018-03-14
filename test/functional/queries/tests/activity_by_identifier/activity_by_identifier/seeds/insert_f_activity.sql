INSERT INTO analytics.f_activity (id, datetime, account, actor, actor_type, action, acted_upon, acted_upon_type, associated_with, associated_with_type)
(
     SELECT
       '7217bd5d-ab4b-4bfc-a5c5-a853a9b72cc1',
       timestamp'2017-01-01 10:06:54.000000',
       'd26c1887-7ad4-4a44-be0b-e80dbce22774',
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
       timestamp'2017-01-02 10:06:54.000000',
       'd26c1887-7ad4-4a44-be0b-e80dbce22774',
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
       timestamp'2017-01-03 10:06:54.000000',
       'd26c1887-7ad4-4a44-be0b-e80dbce22774',
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
       timestamp'2017-01-04 10:06:54.000000',
       'd26c1887-7ad4-4a44-be0b-e80dbce22774',
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
       timestamp'2017-01-05 10:06:54.000000',
       'd26c1887-7ad4-4a44-be0b-e80dbce22774',
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
       timestamp'2017-01-06 10:06:54.000000',
       'd26c1887-7ad4-4a44-be0b-e80dbce22774',
       'rama@damunaste.org',
       'customer',
       'continued',
       'rama@damunaste.org',
       'notificationread',
       null,
       null
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
   FROM analytics.f_activity fa);
