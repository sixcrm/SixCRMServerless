SELECT
  coalesce(sum(count_click), 0) count_click,
  coalesce(sum(count_lead), 0) count_lead,
  coalesce(sum(count_order), 0) count_order,
  coalesce(sum(count_confirm), 0) count_confirm,
  coalesce(sum(m_upsell), 0) count_upsell
FROM (
  SELECT
    sum(
        CASE WHEN TYPE = 'click'
          THEN 1
        ELSE 0
        END
    )        count_click,
    sum(
        CASE WHEN TYPE = 'lead'
          THEN 1
        ELSE 0
        END
    )        count_lead,
    sum(
        CASE WHEN TYPE = 'order'
          THEN 1
        ELSE 0
        END
    )        count_order,
    sum(
        CASE WHEN TYPE = 'confirm'
          THEN 1
        ELSE 0
        END
    )        count_confirm,
    max(CASE WHEN TYPE = 'upsell'
      THEN 1
        ELSE 0
        END) m_upsell
  FROM
    f_events
  WHERE 1=1
    {{filter}}
  AND   datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  GROUP BY SESSION
) ef;
