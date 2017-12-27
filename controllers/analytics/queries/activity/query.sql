SELECT
  fa.id,
  fa.datetime,
  coalesce(fa.actor,'') AS actor,
  coalesce(fa.actor_type,'') AS actor_type,
  coalesce(fa.action,'') AS action,
  coalesce(fa.acted_upon,'') AS acted_upon,
  coalesce(fa.acted_upon_type,'') AS acted_upon_type,
  coalesce(fa.associated_with,'') AS associated_with,
  coalesce(fa.associated_with_type,'') AS associated_with_type
FROM f_activity fa
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
ORDER BY DATETIME {{order}}
LIMIT {{limit}} OFFSET {{offset}};
