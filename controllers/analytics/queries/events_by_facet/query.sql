SELECT
  {{facet}},
  events_count,
  SUM(CASE WHEN R_ID IN ({{limit}}+1 + {{offset}},0) THEN all_events_count ELSE 0 END)
  OVER () AS all_events_count
FROM
  (SELECT
     R_ID,
     {{facet}},
     events_count,
     all_events_count
   FROM
     (SELECT R_ID,
        CASE WHEN R_ID = {{limit}}+1 + {{offset}}
          THEN 'all-other'
        ELSE {{facet}} END           AS {{facet}},
        CASE WHEN R_ID = {{limit}}+1 + {{offset}}
          THEN all_events_count - r_sum_count
        ELSE events_count END  AS events_count,
        all_events_count
      FROM
        (
          SELECT
            {{facet}},
            events_count,
            all_events_count,
            sum(events_count)
            OVER (
              ORDER BY events_count {{order}}
              ROWS BETWEEN {{limit}} PRECEDING AND 0 FOLLOWING ) r_sum_count,
            ROW_NUMBER()
            OVER (
              ORDER BY events_count {{order}} ) AS       R_ID
          FROM
            (
              SELECT
                {{facet}},
                count(*)    AS events_count,
                sum(count(*))
                OVER ( )    AS all_events_count
              FROM f_events
              WHERE 1 = 1
                    AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
                    AND {{facet}} IS NOT NULL
              GROUP BY {{facet}}
            )
          ORDER BY events_count {{order}}
          LIMIT {{limit}}+1
          OFFSET {{offset}}
        ))
   UNION ALL
   (
     SELECT 0 AS R_ID,
       'none'      AS {{facet}},
       count(*)    AS events_count,
       {{offset}}           AS all_events_count
     FROM f_events
     WHERE 1 = 1
           AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
           AND {{facet}} IS NULL
     GROUP BY {{facet}}
   )
  )
ORDER BY events_count {{order}}
