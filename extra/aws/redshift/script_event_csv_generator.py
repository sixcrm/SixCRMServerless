import csv
import uuid
import random
from datetime import *


# 21.04.2017 Simple Python script for generating random dataset


def random_date(start, end):
    """
    This function will return a random datetime between two datetime
    objects.
    """
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return start + timedelta(seconds=random_second)

d1 = datetime.strptime('1/1/2017 10:00 AM', '%m/%d/%Y %I:%M %p')
d2 = datetime.strptime('4/21/2017 10:00 AM', '%m/%d/%Y %I:%M %p')

session = [uuid.uuid4() for x in range(100)]
schedule = [uuid.uuid4() for x in range(100)]
campaign = [uuid.uuid4() for x in range(1000)]
affiliate = [uuid.uuid4() for x in range(100)]
account = [uuid.uuid4() for x in range(10)]

g=open("test_events.csv","w",newline="\n", encoding="utf-8")

w=csv.writer(g)
w.writerow((
  'session',
  'type',
  'datetime'        ,
  'account'         ,
  'campaign'        ,
  'product_schedule',
  'affiliate'       ,
  'subaffiliate_1'  ,
  'subaffiliate_2'  ,
  'subaffiliate_3'  ,
  'subaffiliate_4'  ,
  'subaffiliate_5'
))

for i in range(1000000):
    w.writerow((
       random.choice(session),
       random.choice(["Click", "Lead", "Order","Upsell","Confirm"]),
       random_date(d1,d2),
       random.choice(account),
       random.choice(campaign),
       random.choice(schedule),
       random.choice(affiliate),
        '','','','',''))
g.close()
