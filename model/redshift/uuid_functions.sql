/* 
19.04.2017 A.Zelen

Helper functions writen in plpython

*/ 
CREATE OR REPLACE FUNCTION public.fn_uuid_random () /*
  Returns a random uuid number
*/ 
RETURNS CHARACTER VARYING
AS
'import uuid
return uuid.uuid4().__str__()' LANGUAGE plpythonu VOLATILE;

CREATE OR REPLACE FUNCTION public.fn_uuid_seq () /*
  Returns a sequential uuid number
*/ 
RETURNS CHARACTER VARYING
AS
'import uuid
return uuid.uuid1().__str__()' LANGUAGE plpythonu VOLATILE;

CREATE OR REPLACE FUNCTION public.fn_uuid (input CHARACTER VARYING) /*
  Returns a uuid number based on the input
*/ 
RETURNS CHARACTER VARYING
AS
'import uuid
return uuid.uuid5(uuid.NAMESPACE_DNS, input).__str__()' LANGUAGE plpythonu VOLATILE;

