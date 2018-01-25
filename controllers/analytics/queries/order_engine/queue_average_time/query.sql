WITH rebills_delta AS
  (SELECT fr.queue_name,
          fr.delta_time
   FROM
     ( SELECT previous_queuename AS queue_name,
              datetime - lag(DATETIME) OVER ( PARTITION BY id_rebill
                                             ORDER BY datetime) delta_time
      FROM f_rebills fr
      WHERE 1=1 {{filter}}
        AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}' ) fr
   WHERE queue_name IN ({{queuename}}) ),
     base AS
  (SELECT queue_name,
          coalesce(avg(delta_time), INTERVAL '0 second') AS average_time
   FROM rebills_delta
   GROUP BY queue_name),
     RESULT AS
  (SELECT queue_name,
          average_time
   FROM base
   UNION SELECT {{queuename}} AS queue_name,INTERVAL '0 second' AS average_time)
SELECT max(queue_name) AS queuename,
       max(average_time) AS average_time
FROM RESULT;
