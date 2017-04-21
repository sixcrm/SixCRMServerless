/* 
21.04.2017 A.Zelen Initial table definition

*/ 
DROP TABLE f_transactions;

CREATE TABLE f_transactions
(
  id                                                VARCHAR(36) NOT NULL PRIMARY KEY,
  stamp                                             TIMESTAMP NOT NULL,
  customer                                          VARCHAR(36) NOT NULL,
  creditcard                                        VARCHAR(36) NOT NULL,
  merchprocessor                                    VARCHAR(36) NOT NULL,
  campaign                                          VARCHAR(36) NOT NULL,
  affiliate                                         VARCHAR(36),
  amount                                            DECIMAL(8,2) NOT NULL,
  RESULT                                            VARCHAR(16) NOT NULL,
  product                                           VARCHAR(36) NOT NULL,
  account                                           VARCHAR(36) NOT NULL,
  TYPE VARCHAR(6) NOT NULL,
  schedule                                          VARCHAR(36)
)
distkey (account) INTERLEAVED sortkey (customer,stamp);

