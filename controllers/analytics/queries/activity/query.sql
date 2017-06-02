SELECT
  fa.id,
  fa.datetime,
  fa.actor,
  fa.actor_type,
  fa.action,
  fa.acted_upon,
  fa.acted_upon_type,
  fa.associated_with,
  fa.associated_with_type
FROM f_activity fa
WHERE 1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
ORDER BY DATETIME {{order}}
LIMIT {{limit}} OFFSET {{offset}};
