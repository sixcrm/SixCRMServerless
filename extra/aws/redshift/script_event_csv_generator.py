import csv
import uuid
import random
from datetime import *
from bisect import bisect

# 21.04.2017 Simple Python script for generating random dataset

def weighted_choice(choices):
    """
    Returns an object based on the predefined probabilty
    weighted_choice([("WHITE",90), ("RED",8), ("GREEN",2)])
    90+9+2 = 100
    """
    values, weights = zip(*choices)
    total = 0
    cum_weights = []
    for w in weights:
        total += w
        cum_weights.append(total)
    x = random.random() * total
    i = bisect(cum_weights, x)
    return values[i]

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

sessions = [uuid.uuid4() for x in range(1000)]
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


for session in sessions:
    seed = random.randrange(200,1000)
    for _ in range(0,int(seed*0.52)):
        w.writerow((
           session,
           "click",
           random_date(d1,d2),
           random.choice(account),
           random.choice(campaign),
           random.choice(schedule),
           random.choice(affiliate),
            '','','','',''))
    for _ in range(0,int(seed*0.26)):
        w.writerow((
           session,
           "lead",
           random_date(d1,d2),
           random.choice(account),
           random.choice(campaign),
           random.choice(schedule),
           random.choice(affiliate),
            '','','','',''))
    for _ in range(0,int(seed*0.11)):
        w.writerow((
           session,
           "order",
           random_date(d1,d2),
           random.choice(account),
           random.choice(campaign),
           random.choice(schedule),
           random.choice(affiliate),
            '','','','',''))
    for _ in range(0,random.randrange(0,3)):
        w.writerow((
           session,
           "upsell",
           random_date(d1,d2),
           random.choice(account),
           random.choice(schedule),
           random.choice(affiliate),
           random.choice(campaign),
            '','','','',''))
    for _ in range(0,random.randrange(0,2)):
        w.writerow((
           session,
           "confirm",
           random_date(d1,d2),
           random.choice(account),
           random.choice(campaign),
           random.choice(schedule),
           random.choice(affiliate),
            '','','','',''))
    ##for i in range(100):
        ##w.writerow((
           ##random.choice(session),
           #random.choice(["Click", "Lead", "Order","Upsell","Confirm"]),
           ##weighted_choice([("Click",52), ("Lead",26), ("Order",11),("Upsell",6), ("Confirm",5)]),
           ##random_date(d1,d2),
           ##random.choice(account),
           ##random.choice(campaign),
           ##random.choice(schedule),
           ##random.choice(affiliate),
            ##'','','','',''))
g.close()
