/*
19.04.2017 A.Zelen

Statement that generates 300 insert statements in Redshift

*/

SELECT  '
INSERT INTO f_transactions(id , stamp ,customer ,creditcard ,merchprocessor ,campaign ,affiliate ,amount ,result ,product ,account,type,schedule )
VALUES (''' || public.fn_uuid_random() || ''',timestamp''' ||
timestamp '2017-01-01 00:00:00' + random() * (timestamp '2017-04-01 00:00:00' - timestamp '2017-01-01 00:00:00')
 || ''',' ||  '''' ||
case /*Customer*/
ceil(random()*(5-1)+1)
when 1 then public.fn_uuid('1')
when 2 then public.fn_uuid('2')
when 3 then public.fn_uuid('3')
when 4 then public.fn_uuid('4')
else  public.fn_uuid('5')  end
||  ''',''' ||
case /* CrediCard*/
ceil(random()*(5-1)+1)
when 1 then public.fn_uuid('creditcard1')
when 2 then public.fn_uuid('creditcard2')
when 3 then public.fn_uuid('creditcard2')
when 4 then public.fn_uuid('creditcard3')
else  public.fn_uuid('creditcard2')     end
||  ''',''' ||
case /* Merchant Processor */
ceil(random()*(4-1)+1)
when 2 then public.fn_uuid('Mer1')
when 3 then public.fn_uuid('Mer2')
else public.fn_uuid('Mer3')  end
||  ''',''' ||
case /* Campaign */ ceil(random()*(4-1)+1)
when 1 then public.fn_uuid('Campaign1')
when 2 then public.fn_uuid('Campaign2')
when 3 then public.fn_uuid('Campaign3')
else public.fn_uuid('Campaign4')  end
||  ''',''' ||
case /* Affiliate */ ceil(random()*(4-1)+1)
when 1 then public.fn_uuid('Affiliate1')
when 2 then public.fn_uuid('Affiliate2')
when 3 then public.fn_uuid('Affiliate3')
else public.fn_uuid('Affiliate4')  end ||   '''',
  ',' || cast(random()*100 as numeric(8,2))  /* amount */
||  ',''' ||
case /* Result */ ceil(random()*(3-1)+1)
when 2 then 'success'
when 3 then 'decline'
else 'error' end   ||  ''',''' ||
case /* Product  */
ceil(random()*(4-1)+1)
when 1 then 'product1'
when 2 then 'product2'
when 3 then 'product3'
else  'product4' end  ||  ''',''' ||
case /* Account */ ceil(random()*(4-1)+1)
when 1 then public.fn_uuid('account1'){}
when 2 then public.fn_uuid('account2')
when 3 then public.fn_uuid('account3')
else  public.fn_uuid('account3')  end  ||  ''',''' ||
case  /* Type */
 ceil(random()*(3-1)+1)
when 2 then 'new'
else  'rebill' end ||  ''',''' ||
case /* Product schedule */ ceil(random()*(3-1)+1)
when 1 then public.fn_uuid('schedule1')
when 2 then public.fn_uuid('schedule2')
else  public.fn_uuid('schedule3')  end
|| ''');'
from generate_series(1,300) ;
