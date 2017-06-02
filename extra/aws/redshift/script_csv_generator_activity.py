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

def weighted_choice(choices):
   total = sum(w for c, w in choices)
   r = random.uniform(0, total)
   upto = 0
   for c, w in choices:
      if upto + w >= r:
         return c
      upto += w
   assert False, "Shouldn't get here"

d1 = datetime.strptime('1/1/2017 10:00 AM', '%m/%d/%Y %I:%M %p')
d2 = datetime.strptime('4/21/2017 10:00 AM', '%m/%d/%Y %I:%M %p')

# Generate random number of distinct entites customers, credit_card

# actor = [uuid.uuid4() for x in range(10)]
# acted_upon = [uuid.uuid4() for x in range(10)]
# associated_with = [uuid.uuid4() for x in range(10)]

customers = ['rama@damunaste.org']
users = [
'timothy.dalbey@sixcrm.com',
'8ad01b447168303241413eaff6acc3228fbb6c96',
'nikola.bosic@toptal.com',
'7c5943d2134b2d8c0f767ee91f9884d710d1c536',
'a0733c92cfde7964bb91ee0f6fe99d4c7168cdc8',
'kris@sixcrm.com',
'jared@sixcrm.com',
'e17b15604b465bda8aee62efacaceea157b3be02'
'waltr0n21@gmail.com',
'c3c9866a90ca48bd565b2291671702158a2c468b',
'customerservice.user@test.com',
'8cf20826acc1d4c05001ab9cb69a4438210634f0',
'owner.user@test.com',
'9a47a739432d7f12d233a27fab6d36f9a65db3a2',
'admin.user@test.com',
'0ae6e5e884cdd6a55896d3be2b185085757d9f9d',
'super.user@test.com',
'4ee23a8f5c8661612075a89e72a56a3c6d00df90',
'nikola.bosic@coingcs.com',
'4f9e50799231a85500c42851addec5f2eddee93b',
'awdawdawdawdawd',
'clausruete@gmail.com',
'f07632079dc5536880bae702123369df62b9940f',
'mychael.walton@crmblackbox.com',
'e6ee25453cada3474a985a887a7daf0b2f989a9c',
'travis.rea@crmblackbox.com',
'3074703590ba056a990507947c1ff531d3a2bdd9'
]

g=open("test_activity.csv","w",newline="\n", encoding="utf-8")

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

types_all = [
"accesskey",
"account",
"affiliate",
"campaign",
"creditcard",
"customer",
"customernote",
"emailtemplate",
"fulfillmentprovider",
"loadbalancer",
"merchantprovider",
"notification",
"notificationread",
"notificationsetting",
"product",
"productschedule",
"rebill",
"role",
"smtpprovider",
"session",
"shippingreceipt",
"tracker",
"transaction",
"user",
"useracl",
"userdevicetoken",
"usersetting",
"usersigningstring"
]

types_all_tuple = [
    ('accesskey',1),
    ('account',1),
    ('affiliate',1),
    ('campaign',1),
    ('creditcard',1),
    ('customer',1),
    ('customernote',1),
    ('emailtemplate',1),
    ('fulfillmentprovider',1),
    ('loadbalancer',1),
    ('merchantprovider',1),
    ('notification',1),
    ('notificationread',1),
    ('notificationsetting',1),
    ('product',1),
    ('productschedule',1),
    ('rebill',1),
    ('role',1),
    ('smtpprovider',1),
    ('session',1),
    ('shippingreceipt',1),
    ('tracker',1),
    ('transaction',1),
    ('user',1),
    ('useracl',1),
    ('userdevicetoken',1),
    ('usersetting',1),
    ('usersigningstring',1)
]

for i in range(10000):
    actor_type = weighted_choice([('customer',5.0),('user',4.0),('system',1.0)])
    if (actor_type == 'customer') :
        actor = random.choice(customers)
    elif  (actor_type == 'user') :
        actor = random.choice(users)
    else :
        actor = random.choice(['system'])

    acted_upon_type = weighted_choice(types_all_tuple)
    if (actor_type == 'customer') :
        acted_upon = random.choice(customers)
    elif  (actor_type == 'user') :
        acted_upon = random.choice(users)
    else  :
        acted_upon = uuid.uuid4()

    associated_with_type = weighted_choice(types_all_tuple)
    if (actor_type == 'customer') :
        associated_with = random.choice(customers)
    elif  (actor_type == 'user') :
        associated_with = random.choice(users)
    else  :
        associated_with = random.choice(['system'])

    w.writerow((
      uuid.uuid4(),
      random_date(d1,d2),
      actor,
      actor_type,
      random.choice(["continued","deleted","created new"]),
      acted_upon,
      acted_upon_type,
      associated_with,
      associated_with_type
      ))
g.close()
