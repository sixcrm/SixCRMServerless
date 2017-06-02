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

# Generate random number of distinct entites customers, credit_card

actor = [uuid.uuid4() for x in range(10)]
acted_upon = [uuid.uuid4() for x in range(10)]
associated_with = [uuid.uuid4() for x in range(10)]


g=open("activity.csv","w",newline="\n", encoding="utf-8")

w=csv.writer(g)
w.writerow((
 'id',
 'datetime',
 'actor',
 'actor_type',
 'action',
 'acted_upon',
 'acted_upon_type',
 'associated_with',
 'associated_with_type'
))

for i in range(1000000):
    w.writerow((
      uuid.uuid4(),
      random_date(d1,d2),
      random.choice(actor),
      random.choice(["customer","merchant processor","system"]),
      random.choice(["continued","deleted","created new"]),
      random.choice(acted_upon),
      random.choice(["customer","merchant processor","system"]),
      random.choice(associated_with),
      random.choice(["customer","merchant processor","system"])
      ))
g.close()
