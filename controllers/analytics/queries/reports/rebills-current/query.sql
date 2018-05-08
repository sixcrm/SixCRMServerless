SELECT
  %L as queuename,
  coalesce(avg(delta_time_in_queue), INTERVAL '0 second') avg_time,
  coalesce(sum(is_last_current_queue), 0) number_of_rebills,
  case
    when sum(is_last_current_queue) = 0 then 0
    else coalesce(sum(failed_rebill)/sum(is_last_current_queue),0)
  end failure_rate
  from
(SELECT
  case
      when max(datetime) over (partition by id) = datetime and current_queuename = %L then 1
      else 0
  end is_last_current_queue,
  datetime - lag(DATETIME) OVER ( PARTITION BY id ORDER BY datetime) delta_time_in_queue,
  case
      when max(datetime) over (partition by id) = datetime
            and current_queuename = %L
            and datetime < CURRENT_DATE - interval '14 days' then 1
       else 0
  end failed_rebill,
  datetime
      FROM analytics.f_rebill fr
      WHERE (current_queuename = %L or previous_queuename = %L) %s
) rq
