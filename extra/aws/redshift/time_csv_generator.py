import csv
import uuid
import random
from datetime import *
"""
    Generate csv file with list of 10 years worth of minutes
"""
start_date = datetime.strptime('1/1/2017 12:00 AM', '%m/%d/%Y %I:%M %p')

g=open("time_dataset.csv","w",newline="\n", encoding="utf-8")
w=csv.writer(g)
w.writerow(('date'))

for i in range(0,525600):
    #525600
    start_date = start_date +  timedelta(minutes=1)
    w.writerow([start_date])

g.close()
