INSERT INTO analytics.f_rebill (id, alias, datetime, amount, item_count, type, account, session, session_alias, campaign, campaign_name, customer, customer_name) VALUES
('11111111-1111-1111-1111-111111111001', 'R000000001', '2018-01-22 03:50:24.000000', 4.99, 1, 'initial', 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '11111111-1111-1111-1111-111111111001', 'S000000001', '70a6689a-5814-438b-b9fd-dd484d0812f9', 'Example Campaign', 'cc3d5c51-32f3-4417-917a-94bc37f74514', 'Example Customer 1'),
('11111111-1111-1111-1111-111111111002', 'R000000002', '2018-01-22 03:50:24.000000', 4.99, 1, 'initial', 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '11111111-1111-1111-1111-111111111002', 'S000000002', '70a6689a-5814-438b-b9fd-dd484d0812f9', 'Example Campaign', 'cc3d5c51-32f3-4417-917a-94bc37f74514', 'Example Customer 1'),
('11111111-1111-1111-1111-111111111003', 'R000000003', '2018-01-22 03:50:24.000000', 4.99, 1, 'initial', 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '11111111-1111-1111-1111-111111111003', 'S000000003', '70a6689a-5814-438b-b9fd-dd484d0812f9', 'Example Campaign', 'cc3d5c51-32f3-4417-917a-94bc37f74514', 'Example Customer 1');

INSERT INTO analytics.f_rebill_return (rebill_id, datetime, item_count) VALUES
('11111111-1111-1111-1111-111111111003', '2018-01-22 03:50:24.000000', 1);
