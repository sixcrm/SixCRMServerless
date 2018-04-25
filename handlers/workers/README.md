Lambda invokes the Relay (done)
Lambda does not expect a response (done)

Relay accepts a worker response and acts on the response putting whatever the message is from the worker response in the destination queue, failed_queue
Relay only cares that the appropriate Process.env settings are in place. (done)
Relay requires knowledge of the worker (done)
Relay is message agnostic (done)

Workers are message aware.  Particular workers care for particular messages
Workers do things and respond with the Worker Response
