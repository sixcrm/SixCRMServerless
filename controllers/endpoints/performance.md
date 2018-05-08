Before:

  acquireToken
    constructor
      ✓ successfully constructs (88ms)
    validateCampaign
      ✓ successfully validates the campaign (108ms)
      ✓ throws an error when the campaign does not validate (56ms)
    acquireToken
      ✓ successfully acquires a token (45ms)
    handleAffiliateInformation
      ✓ successfully updates the event with affiliate information (66ms)
    postProcessing
      ✓ successfully executes post processing methods (71ms)
    execute
      ✓ successfully executes (113ms)

  controllers/endpoints/authenticated
    isUserIntrospection
      ✓ returns true when event body has valid user introspection structure
      ✓ returns false when event body does not have a valid user introspection structure
    acquireAccount
      ✓ successfully sets global account
      ✓ throws error when account is missing in path parameters

  checkout
    constructor
      ✓ successfully constructs
    createLead
      ✓ successfully creates a lead (351ms)
    createOrder
      ✓ successfully creates a order (972ms)
    confirmOrder
      ✓ successfully confirms a order (453ms)
    setSession
      ✓ successfully sets the session property in the event (195ms)
    postProcessing
      ✓ successfully executes all post processing functions (139ms)
    execute
      ✓ successfully executes a checkout event (1434ms)

  confirmOrder
    constructor
      ✓ successfully constructs
    hydrateSession
      ✓ successfully hydrates a session (117ms)
    validateSession
      ✓ successfully validates a session (100ms)
      ✓ successfully throws an error when a session does not validate (103ms)
    hydrateSessionProperties
      ✓ successfully hydrates session properties (183ms)
    closeSession
      ✓ successfully closes a session (110ms)
    buildResponse
      ✓ successfully builds a response (265ms)
    postProcessing
      ✓ successfully executes post processing (102ms)
    execute
      ✓ successfully executes (293ms)
    confirmOrder
      ✓ successfully executes (281ms)

  createLead
    constructor
      ✓ successfully constructs
    execute
      ✓ successfully executes (199ms)
      ✓ successfully executes with local event (193ms)
    assureCustomer
      ✓ successfully sets a new customer (55ms)
      ✓ successfully retrieves a existing customer (53ms)
    assureAffiliates
      ✓ successfully assures affiliates (52ms)
      ✓ does not update parameter affiliates if not needed (40ms)
    setCampaign
      ✓ successfully sets the campaign (54ms)
    assureLeadProperties
      ✓ successfully assures lead properties (71ms)
    createSessionPrototype
      ✓ successfully creates a session prototype (80ms)
      ✓ creates a session prototype even without affiliate parameter (64ms)
    assureSession
      ✓ successfully assures the session (112ms)
    postProcessing
      ✓ successfully triggers all post processing (112ms)
    createLead
      ✓ successfully creates a lead (186ms)

  createOrder
    constructor
      ✓ successfully constructs
    execute
      ✓ successfully runs execute method (815ms)
      ✓ successfully runs execute method if required customer fields provided (787ms)
      ✓ successfully runs execute method in the absence of a event creditcard (upsell) (792ms)
    hydrateSession
      ✓ successfully gets event session property (146ms)
    hydrateEventAssociatedParameters
      ✓ successfully gets associated event properties (282ms)
    validateEventProperties
      ✓ successfully validates event properties (97ms)
      ✓ throws an error if the session is closed (108ms)
      ✓ throws an error if the session is expired (99ms)
    addCreditCardToCustomer
      ✓ successfully adds the credit card to the customer (95ms)
    createRebill
      ✓ successfully creates the order rebill (178ms)
      ✓ throws an error if no products could be found (98ms)
    processRebill
      ✓ successfully processes a rebill (152ms)
    buildInfoObject
      ✓ successfully builds and sets the info object (359ms)
    postProcessing
      ✓ successfully executes post processing methods (544ms)
      ✓ handles no watermark products (537ms)
      ✓ handles no watermark product schedules (537ms)
      ✓ marks rebill as no_process if register result unsuccessful (539ms)
    addRebillToQueue
      ✓ successfully adds the rebill to the appropriate queue (55ms)
    setProductSchedules
      ✓ successfully sets product schedules (99ms)
    setProducts
      ✓ successfully sets product schedules (97ms)
    setTransactionSubType
      ✓ successfully sets the transaction subtype (90ms)
      ✓ returns "main" when event doesn't have a transaction subtype (81ms)
    setCreditCard
      ✓ successfully sets a creditcard (143ms)
      ✓ successfully skips when creditcard is not set (75ms)
    setCampaign
      ✓ successfully sets the campaign (111ms)
    setCustomer
      ✓ successfully sets a customer (157ms)
      ✓ updates customer with properties from event (160ms)
      ✓ fails if customer is not processable (157ms)
    setPreviousRebill
      ✓ retrieves rebill (106ms)
      ✓ resolves immediately if no previous rebill (78ms)
    reversePreviousRebill
      ✓ resolves immediately if no previous rebill (57ms)
      ✓ reverses all associated transactions (91ms)
    createOrder
      ✓ successfully creates a order (776ms)

  controllers/endpoints/endpoint.js
    constructor
      ✓ successfully constructs
    execute
      ✓ calls preamble
      ✓ calls body
      ✓ calls epilogue
      ✓ returns body
    clearState
      ✓ successfully clears the state
    acquireRequestProperties
      ✓ successfully acquires request properties
    acquireBody
      ✓ successfully acquires a JSON string body
      ✓ successfully acquires a JSON object body
      ✓ throws an error when neither case resolves
      ✓ returns no data if event body is not a string
      ✓ returns no data when there is no event body
    acquirePathParameters
      ✓ sets path parameters
      ✓ throws an error when event does not have pathParameters property.
    acquireQueryStringParameters
      ✓ acquires query string parameters
      ✓ returns parsed query string parameters
      ✓ return empty object when query string parameters can't be acquired
    normalize event
      ✓ successfully normalizes events
    validateEvent
      ✓ validates a good event
      ✓ validates a good event
      ✓ throws error when path parameter is missing
      ✓ throws error when path parameter is incorrect type
      ✓ throws error when requestContext is missing
      ✓ throws error when requestContext is incorrect type
    parseEventQueryString
      ✓ successfully parses encoded querystring parameters
      ✓ successfully returns when queryStringParameters is a object
      ✓ successfully returns when queryStringParameters is not set
      ✓ throws an error when queryStringParameters is not parsable
    throwUnexpectedEventStructureError
      ✓ successfully throws an error

  tracking
    constructor
      ✓ successfully constructs
    execute
      ✓ successfully runs execute method (73ms)
    respond
      ✓ successfully responds with trackers (40ms)
    acquireTrackers
      ✓ successfully acquires trackers (61ms)
      ✓ successfully returns no trackers (61ms)
    acquireCampaign
      ✓ successfully acquires campaign (46ms)
    acquireAffiliate
      ✓ successfully acquires affiliate (44ms)
    acquireEventProperties
      ✓ successfully acquires event properties (56ms)

  controllers/endpoints/transaction
    initialize
      ✓ successfully initialize the transaction class without callback function
      - successfully initialize the transaction class with callback function
    validateInput
      ✓ throws error if validation function is not a function
      ✓ throws error if event input is undefined
      ✓ throws validation error
      ✓ validates input


  118 passing (17s)
  1 pending

After:

  confirmOrder
    constructor
      ✓ successfully constructs (58ms)
    hydrateSession
      ✓ successfully hydrates a session (46ms)
    validateSession
      ✓ successfully validates a session (43ms)
      ✓ successfully throws an error when a session does not validate
    hydrateSessionProperties
      ✓ successfully hydrates session properties (42ms)
    closeSession
      ✓ successfully closes a session (165ms)
    postProcessing
      ✓ successfully executes post processing (146ms)
    execute
      ✓ successfully executes (74ms)
    confirmOrder
      ✓ successfully executes (43ms)
