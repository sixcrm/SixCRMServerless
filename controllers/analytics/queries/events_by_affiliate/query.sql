SELECT
  *,
  (affiliate_count * 1.0 / (sum(affiliate_count) OVER ())) AS affiliate_perc
FROM
  (
    SELECT
      affiliate,
      coalesce(count(*), 0) AS affiliate_count
    FROM f_events
    {{filter}}
    AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
    GROUP BY affiliate
  );
