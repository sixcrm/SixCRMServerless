SELECT fs.id,
       fs.account,
       fs.customer,
       fs.campaign,
       fps.product_schedule,
       fs.completed,
       fs.created_at,
       fs.updated_at,
       fs.affiliate,
       fs.subaffiliate_1,
       fs.subaffiliate_2,
       fs.subaffiliate_3,
       fs.subaffiliate_4,
       fs.subaffiliate_5,
       fs.cid
FROM f_sessions fs
LEFT OUTER JOIN f_transactions /*f_product_schedules*/ fps ON (fs.id = fps.session_id)
WHERE 1=1
  AND id = {{SESSION}};
