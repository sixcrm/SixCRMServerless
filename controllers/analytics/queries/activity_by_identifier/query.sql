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
  AND ((actor IN ({{actor}}) AND actor_type IN ({{actor_type}})) OR (acted_upon IN ({{acted_upon}}) AND acted_upon_type IN ({{acted_upon_type}})) OR (associated_with IN ({{associated_with}}) AND associated_with_type IN ({{associated_with_type}})))
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
ORDER BY DATETIME {{order}}
LIMIT {{limit}} OFFSET {{offset}};
