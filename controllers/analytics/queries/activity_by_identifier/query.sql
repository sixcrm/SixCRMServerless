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
FROM analytics.f_activity fa
WHERE 1=1
  {{filter}}
  AND ((actor IN ({{actor}}) AND actor_type IN ({{actor_type}})) OR (acted_upon IN ({{acted_upon}}) AND acted_upon_type IN ({{acted_upon_type}})) OR (associated_with IN ({{associated_with}}) AND associated_with_type IN ({{associated_with_type}})))
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
ORDER BY DATETIME {{order}}
LIMIT {{limit}} OFFSET {{offset}};
