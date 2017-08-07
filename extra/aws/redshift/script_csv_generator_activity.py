import csv
import uuid
import random
import os
import json
import re
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

# Technical debt very hardcoded

os.chdir('/home/aldo/Projects/toptal/SixCrm/sixcrmserverless/model/dynamodb/tables')

dict_data = {}

for filename in os.listdir(os.getcwd()):
    with open(filename) as data_file:
        if re.match('.*.csv',data_file.name) :
            continue
        data = json.load(data_file)
        try:
            data['Seeds']
            user_type = re.sub('s$','',data['Table']['TableName'])
            dict_data[user_type] = []
            for seed in data['Seeds']:
                dict_data[user_type].append(seed['id'])
        except KeyError:
            print('No seeds : '+data['Table']['TableName'])

# Technical debt very hardcoded

os.chdir('/home/aldo/Projects/toptal/SixCrm/sixcrmserverless/extra/aws/redshift')

g=open("test_activity.csv","w",newline="\n", encoding="utf-8")

w=csv.writer(g)
w.writerow((
 'id',
 'datetime',
 'account',
 'actor',
 'actor_type',
 'action',
 'acted_upon',
 'acted_upon_type',
 'associated_with',
 'associated_with_type'
))

# re.sub('s$','','users')


types_all_tuple = [(x,1) for x in dict_data.keys() if len(dict_data[x]) != 0]

for i in range(100000):
    actor_type = weighted_choice([('customer',5.0),('user',4.0),('system',1.0)])
    if (actor_type == 'customer') :
        actor = random.choice(dict_data['customer'])
    elif  (actor_type == 'user') :
        actor = random.choice(dict_data['user'])
    else :
        actor = 'system'

    account = random.choice(dict_data['account'])
    acted_upon_type = weighted_choice(types_all_tuple)
    acted_upon = random.choice(dict_data[acted_upon_type])

    associated_with_type = weighted_choice(types_all_tuple)
    associated_with = random.choice(dict_data[associated_with_type])

    w.writerow((
      uuid.uuid4(),
      random_date(d1,d2),
      account,
      actor,
      actor_type,
      random.choice(["continued","deleted","created new"]),
      acted_upon,
      acted_upon_type,
      associated_with,
      associated_with_type
      ))
g.close()
