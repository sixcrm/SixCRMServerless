SELECT
	c.affiliate,
	COALESCE(c.clicks, 0) AS clicks,
	COALESCE(l.leads, 0) AS leads
FROM
(
	SELECT
		affiliate,
		COUNT(1) AS clicks
	FROM f_event
	WHERE datetime BETWEEN '2018-01-01 00:00:00' AND '2019-01-01 00:00:00' AND "type" = 'click'
	GROUP BY affiliate
) c

LEFT OUTER JOIN

(
	SELECT
		affiliate,
		COUNT(1) AS leads
	FROM f_event
	WHERE datetime BETWEEN '2018-01-01 00:00:00' AND '2019-01-01 00:00:00' AND "type" = 'lead'
	GROUP BY affiliate
) l

ON c.affiliate = l.affiliate