import csv
import uuid
import random
from datetime import *

"""
21.04.2017 Simple Python script for generating random dataset

Table f_transactions :

id UUID4
stamp /* Timestamp */
customer UUID4
creditcard UUID4
merchprocessor UUID4
campaign UUID4
affiliate UUID4
amount decimal(8,2)
result   (“success”, “decline”, “error”)
account UUID4
type  (“rebill”, “new”)
schedule varchar(36)  UUID4

random.randrange(1950,1995,1)
random.choice(range(0,100))

"""

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

customers = [uuid.uuid4() for x in range(1000)]
credit_card = [uuid.uuid4() for x in range(10000)]
merch_processor = [uuid.uuid4() for x in range(10000)]
campaign = [uuid.uuid4() for x in range(10000)]
affiliate = [uuid.uuid4() for x in range(10000)]
account = [uuid.uuid4() for x in range(10000)]
schedule = [uuid.uuid4() for x in range(10000)]


g=open("test.csv","w",newline="\n", encoding="utf-8")
w=csv.writer(g)
w.writerow(('id','stamp','customer','creditcard','merchprocessor','campaign','affiliate','amount','result','account','type','schedule'))

for i in range(12):
    w.writerow((uuid.uuid4(),random_date(d1,d2),random.choice(customers),random.choice(credit_card),
      random.choice(merch_processor),random.choice(campaign),random.choice(affiliate),random.uniform(1, 10000),
      random.choice(["success", "decline", "error"]),random.choice(account),random.choice(["rebill", "new"]),random.choice(schedule) ))
g.close()
