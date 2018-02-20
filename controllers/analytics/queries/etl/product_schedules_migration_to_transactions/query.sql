Insert into f_transactions
select
  transactions_id,
  product_schedule,
  "datetime",
  customer,
  creditcard,
  merchant_provider,
  campaign,
  affiliate,
  amount,
  processor_result,
  account,
  type,
  subtype,
  subaffiliate_1,
  subaffiliate_2,
  subaffiliate_3,
  subaffiliate_4,
  subaffiliate_5,
  prepaid,
  result,
  associated_transaction
from f_product_schedules
where not exists(
  select 1 from f_transactions where
  f_transactions.id                     = f_product_schedules.transactions_id   and
  f_transactions.product_schedule       = f_product_schedules.product_schedule  and
  f_transactions."datetime"             = f_product_schedules."datetime"        and
  f_transactions.customer               = f_product_schedules.customer          and
  f_transactions.creditcard             = f_product_schedules.creditcard        and
  f_transactions.merchant_provider      = f_product_schedules.merchant_provider and
  f_transactions.campaign               = f_product_schedules.campaign          and
  f_transactions.affiliate              = f_product_schedules.affiliate         and
  f_transactions.amount                 = f_product_schedules.amount            and
  f_transactions.processor_result       = f_product_schedules.processor_result  and
  f_transactions.account                = f_product_schedules.account           and
  f_transactions.type                   = f_product_schedules.type              and
  f_transactions.subtype                = f_product_schedules.subtype
);
