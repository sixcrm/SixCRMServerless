SELECT le.starttime,
       d.query,
       d.line_number,
       d.colname,
       d.value,
       le.raw_line,
       le.err_reason
FROM stl_loaderror_detail d,
     stl_load_errors le
WHERE d.query = le.query
ORDER BY le.starttime DESC ;

SELECT *
FROM stl_load_errors
ORDER BY starttime DESC
LIMIT 1;



{"id":"41161eb3-89e0-4f95-9905-38a275e40fde","datetime":"2017-05-16T18:58:03.390Z","customer":"c50e85fc-114f-486a-8709-e290b066d862","creditcard":"c7f40709-558c-436b-a59c-f2e91549ceee","merchant_provider":"e7ed3675-5123-4710-be3a-2262c88c7a1e","campaign":"e3f57800-f8d9-45e8-b1fc-0564fca7e862","affiliate":"40824c4e-6879-4acb-b2d6-fa3c62f974f9","amount":13.59,"processor_result":"success","account":"7bdb5cbf-a723-4615-b22b-31b0bceac954","transaction_type":"rebill","product_schedule":"5acac819-cc64-4524-a4a0-f53724509e24","subaffiliate_1":"bccee02e-277a-483f-b4d2-3b3202a9ace7","subaffiliate_2":"0dcde047-3ed1-401c-a1f4-c70ae894b3f1","subaffiliate_3":"3678a916-6fb2-4b49-93ad-9ea76ea928d8","subaffiliate_4":"b162b487-9195-4aa6-8fae-23a6bddc54e0","subaffiliate_5":"3fd15506-dc33-4bee-a2a6-99059167d4ad","subtype":"upsell"}{"id":"54dd65d7-4484-44ac-b163-5d2eb09b1e5a","datetime":"2017-05-16T18:58:17.701Z","customer":"5e0e3a25-c51e-4977-9de1-78fa73c642be","creditcard":"bccc1895-86fa-41de-96ba-2d9c8477182b","merchant_provid