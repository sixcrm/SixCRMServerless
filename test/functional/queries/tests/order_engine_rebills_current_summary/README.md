# Test notes

Some tests will fail after some time as they are sensitive to time :

datetime < CURRENT_DATE - interval '14 days' then 1

This will change the failure rate in the test as the time passes.
Change feeding of dates to CURRENT_TIMESTAMP - date'2018-02-05 18:13:35.000000'+date'2018-02-06 18:07:16.000000' to anchor it with a fixed interval
