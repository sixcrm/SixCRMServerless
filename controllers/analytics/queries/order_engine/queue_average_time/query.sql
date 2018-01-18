WITH rebills_delta AS
(SELECT
   previous_queuename AS queuename,
   datetime - lag(DATETIME)
   OVER (
     PARTITION BY id_rebill
     ORDER BY datetime ) delta_time
 FROM
 (
   SELECT
     fq.*,
     current_queuename as queuename
   FROM f_rebills fq
   ) fr
 WHERE 1=1
 {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}')
SELECT
  queuename,
  coalesce(avg(delta_time), INTERVAL '0 second') AS average_time
FROM rebills_delta
GROUP BY queuename;
