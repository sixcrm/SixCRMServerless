## Do we have?
Fulfillment Providers?
Affiliate?
Tracking?

#extract command

EXAMPLE:

NODE_CONFIG_DIR=config/local NODE_CONFIG_ENV=site SIX_DEBUG_LOCAL=true SIX_VERBOSE=3 node cli/index.js extract --crm limelight --client elyfe.limelightcrm.com --web-user Nguyen --web-password "Agility*12" --api-user pushinnovation --api-password  6XtkVUXV8mArnP

npm run test-cli-extract -- --web-user Nguyen --web-password "Agility*12" --api-user pushinnovation --api-password  6XtkVUXV8mArnP

NODE_CONFIG_DIR=config/local NODE_CONFIG_ENV=site SIX_DEBUG_LOCAL=true SIX_VERBOSE=3 node cli/index.js ingest --acount 1234 --extract-directory extract/limelight/elyfe.limelightcrm.com/2018-06-18T18-21-04.453Z

npm run test-cli-ingest -- --extract-directory extract/limelight/elyfe.limelightcrm.com/2018-06-18T18-21-04.453Z

##scraped-products.json

id\
name\
sku\
vertical\
category\
price\
costOfGoods\
restockFee\
maxQty\
desc\
shippable\
nextRecurringProduct\
subscriptionType\
daysToNextBilling\
maxDiscount\
preserveQuantity

##scraped-payment-routes.json

id\
name\
desc\
dailyWeightReset\
dailyInitialSubscriptionReset\
reserveForecastPercent\
reserveForecastPercentCycle1\
reserveForecastPercentCycle2\
reserveForecastPercentCycle3\
reserveForecastPercentCycle4\
reserveForecastPercentCycle5\
gatewayDeclinesLimit\
gatewayDeclinesLimitAmt\
allowReserveGateways\
threeDVerifyRouting\
paymentRoutingProcess\
midGroupRouting\
currency\
totalGateways\
totalCampaigns\
processingAmt\
amtRemaining\
amtUsed\
monthlyForecast\
remainingForecastedRevenue\
gateways\
&nbsp;&nbsp;id\
&nbsp;&nbsp;alias\
&nbsp;&nbsp;active\
&nbsp;&nbsp;initialOrderLimit\
&nbsp;&nbsp;rebillOrderLimit\
&nbsp;&nbsp;monthlyCap\
&nbsp;&nbsp;preserveBilling\
&nbsp;&nbsp;reserveGateway\
&nbsp;&nbsp;globalMonthlyRemaining\
&nbsp;&nbsp;reserveForecastedRevenue\
&nbsp;&nbsp;currentMonthlyCharges\
&nbsp;&nbsp;remainingBalance\
&nbsp;&nbsp;currentWeight

##scraped-gateways.json

id\
credentials\
user\
password\
status\
alias\
currency\
postProcessorId\\
captureOnShipment
preAuthFilter\
postProductDesc\
mdf1\
mdf2\
mdf3\
mdf4\
mdf5\
mdf6\
mdf7\
mdf8\
mdf9\
mdf10\
mdf11\
mdf12\
mdf13\
mdf14\
mdf15\
mdf16\
mdf17\
mdf18\
mdf19\
mdf20\
test\
postPhone\
requiredSSN\
useDeclineSalvage\
merchantAccountDetails\
&nbsp;&nbsp;merchantDesc\
&nbsp;&nbsp;merchantId\
&nbsp;&nbsp;customerServiceNumber\
&nbsp;&nbsp;midGroup\
&nbsp;&nbsp;processor\
&nbsp;&nbsp;vertical\
limitsAndFees\
&nbsp;&nbsp;visa\
&nbsp;&nbsp;mastercard\
&nbsp;&nbsp;discover\
&nbsp;&nbsp;americanExpress\
&nbsp;&nbsp;other\
&nbsp;&nbsp;cvv\
&nbsp;&nbsp;globalMonthlyCap\
&nbsp;&nbsp;monthlyFee\
&nbsp;&nbsp;batchFee\
&nbsp;&nbsp;transactionFee\
&nbsp;&nbsp;chargebackFee\
&nbsp;&nbsp;reservePercent\
&nbsp;&nbsp;reserveTerm\
&nbsp;&nbsp;reserveTermDays\
&nbsp;&nbsp;reserveCap

##scraped-campaigns.json

 id\
 name\
 desc\
 currency\
 ccGateway\
 paymentRouting\
 products\
&nbsp;&nbsp;id
