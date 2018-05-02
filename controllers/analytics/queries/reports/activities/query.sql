SELECT
  fa.id,
  fa.datetime,
  COALESCE(fa.actor, '') AS actor,
  COALESCE(fa.actor_type, '') AS actor_type,
  COALESCE(fa.action, '') AS action,
  COALESCE(fa.acted_upon, '') AS acted_upon,
  COALESCE(fa.acted_upon_type, '') AS acted_upon_type,
  COALESCE(fa.associated_with, '') AS associated_with,
  COALESCE(fa.associated_with_type, '') AS associated_with_type
FROM analytics.f_activity fa
WHERE (
				(
					actor IN (%L) AND
				 	actor_type IN (%L)
				) OR
				(
					acted_upon IN (%L) AND
					acted_upon_type IN (%L)
				) OR
				(
					associated_with IN (%L)
					AND associated_with_type IN (%L)
				)
			)
	AND datetime BETWEEN TIMESTAMP %L AND TIMESTAMP %L %s
ORDER BY %s
LIMIT %L OFFSET %L;
