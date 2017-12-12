'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider');

class ThreePLController extends fulfillmentProviderController {

  constructor({fulfillment_provider}){

    super(arguments[0]);

    this.parameter_validation = {};

    this.parameter_definition = {};

    // Technical Debt: Read this from config.
    this.wsdl = 'https://secure-wms.com/webserviceexternal/contracts.asmx?wsdl';

    const SoapUtilities = global.SixCRM.routes.include('lib', 'soap-utilities.js');

    this.soaputilities = new SoapUtilities({wsdl: this.wsdl});

  }

  fulfill({customer, products}){

    du.debug('Trigger fulfillment in Hashtag.');

    return this.parameters.setParameters({arumentation: arguments[0], action: 'fulfill'})
    .then(() => this.createParametersObject('fulfill'))
    .then(() => this.issueRequest())
    .then(() => this.processResponse())
    .then(() => this.respond());


    // Technical Debt: Finish, probably using this:
    // https://secure-wms.com/webserviceexternal/contracts.asmx?op=CreateOrders

  }

  createParametersObject(action){

    du.debug('Create Parameters Object');

    let fulfillment_provider = this.parameters.get('fulfillmentprovider');
    let parameters_object = {
      ThreePLID: fulfillment_provider.threepl_id,
      ThreePLKey: fulfillment_provider.threepl_key,
      Login: fulfillment_provider.username,
      Password: fulfillment_provider.password,
      FacilityID: fulfillment_provider.facility_id,
      ReferenceNum: fulfillment_provider.reference_number
    };

    /*
    this.setParametersObjectCustomerFields()
        Name: customer_name
        CompanyName:
        Address1:
        Address2:
        City:
        State:
        Zip
        Country
        Address:
        Carrier: 'UPS'
        Mode: 'Ground',
        BillingCode: 'FreightCollect'
        Account: 12345675
      */
  }

  issueRequest(){

    du.debug('Issue Request');

    let create_orders_parameters_object = this.parameters.get('createordersparametersobject');

    return this.soaputilities.executeMethod({
        name: 'FindOrders',
        parameters: create_orders_parameters_object
    }).catch(error => {
        return { error_message: error.message }
    });

  }
    /*
    <soap:Body>
<extLoginData xmlns="http://www.JOI.com/schemas/ViaSub.WMS/">
<ThreePLKey>string</ThreePLKey> <Login>string</Login> <Password>string</Password> <FacilityID>int</FacilityID>
 5


     </extLoginData>
<orders xmlns="http://www.JOI.com/schemas/ViaSub.WMS/">
<Order> <TransInfo>
<ReferenceNum>TestOrder123</ReferenceNum> <EarliestShipDate>20130101</EarliestShipDate> [OPTIONAL] <ShipCancelDate>20130131</ShipCancelDate> [OPTIONAL] <PONum>TestPO</PONum> [OPTIONAL]
</TransInfo> <ShipTo>
<Name>John Smith</Name> [OPTIONAL] <CompanyName>John’s Bakery</CompanyName> <Address>
<Address1>1212 Main Street</Address1> <Address2>string</Address2> [OPTIONAL] <City>Los Angeles</City> <State>CA</State>
<Zip>90010</Zip>
<Country>US</Country>
</Address>
<PhoneNumber1>string</PhoneNumber1> [OPTIONAL]
<Fax>string</Fax> [OPTIONAL]
<EmailAddress1>string</EmailAddress1> [OPTIONAL] <CustomerName>string</CustomerName> [OPTIONAL]
<Vendor>string</Vendor> [OPTIONAL]
<Dept>string</Dept> [OPTIONAL]
<RetailerID>int</RetailerID> [OPTIONAL – do not send if not matching with value in the 3PL
Central]
</ShipTo> <ShippingInstructions>
<Carrier>UPS</Carrier>
<Mode>Ground</Mode> <BillingCode>FreightCollect</BillingCode> <Account>12345675</Account> <ShippingNotes>string</ShippingNotes> [OPTIONAL]
</ShippingInstructions> <ShipmentInfo>
<NumUnits1>decimal</NumUnits1> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<NumUnits1TypeID>int</NumUnits1TypeID> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<NumUnits1TypeDesc>string</NumUnits1TypeDesc> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<NumUnits2>decimal</NumUnits2> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<NumUnits2TypeID>int</NumUnits2TypeID> [OPTIONAL – do not send if not matching with value in the 3PL Central]
  6

     <NumUnits2TypeDesc>string</NumUnits2TypeDesc> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<TotalWeight>decimal</TotalWeight> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<TotalVolume>decimal</TotalVolume> [OPTIONAL – do not send if not matching with value in the 3PL Central]
</ShipmentInfo>
<Notes>string</Notes>
<PalletCount>int</PalletCount> [OPTIONAL – do not send if not matching with value in the 3PL
Central]
<OrderLineItems> <OrderLineItem>
<SKU>TestItem</SKU>
<Qualifier>string</Qualifier> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<Qty>12</Qty>
<Packed>decimal</Packed> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<CuFtPerCarton>decimal</CuFtPerCarton> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<LotNumber>string</LotNumber> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<SerialNumber>string</SerialNumber> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<ExpirationDate>dateTime</ExpirationDate> [OPTIONAL – do not send if not matching with value in the 3PL Central]
<Notes>string</Notes> [OPTIONAL] <FulfillmentSalePrice>decimal</FulfillmentSalePrice> [OPTIONAL] <FulfillmentDiscountPercentage>decimal</FulfillmentDiscountPercentage> [OPTIONAL] <FulfillmentDiscountAmount>decimal</FulfillmentDiscountAmount> [OPTIONAL]
</OrderLineItem>
<SavedElements> [ENTIRE SEGMENT IS OPTIONAL]
<CodeDescrPair> <Code>string</Code> <Description>string</Description>
</CodeDescrPair> <CodeDescrPair>
<Code>string</Code>
<Description>string</Description> </CodeDescrPair>
</SavedElements>
<FulfillmentInfo> [ENTIRE SEGMENT IS OPTIONAL]
<FulfillInvShippingAndHandling>decimal</FulfillInvShippingAndHandling> <FulfillInvTax>decimal</FulfillInvTax> <FulfillInvDiscountCode>string</FulfillInvDiscountCode> <FulfillInvDiscountAmount>decimal</FulfillInvDiscountAmount> <FulfillInvGiftMessage>string</FulfillInvGiftMessage>
  7


</FulfillmentInfo>
<SoldTo> [ENTIRE SEGMENT IS OPTIONAL]
<Name>string</Name> <CompanyName>string</CompanyName> <Address>
<Address1>string</Address1> <Address2>string</Address2> <City>string</City> <State>string</State> <Zip>string</Zip> <Country>string</Country>
</Address> <PhoneNumber1>string</PhoneNumber1> <Fax>string</Fax> <EmailAddress1>string</EmailAddress1> <CustomerName>string</CustomerName> <Vendor>string</Vendor> <Dept>string</Dept> <RetailerID>int</RetailerID>
</SoldTo> </Order>
</orders>
<warnings xmlns="http://www.JOI.com/schemas/ViaSub.WMS/">string</warnings> </soap:Body>
</soap:Envelope>
*/



  testConnection({username, password, threepl_id, threepl_key, facility_id, customer_id}) {

    du.debug('Test connection.');

    return this.soaputilities.executeMethod({
        name: 'FindOrders',
        parameters: {
            ThreePLID: threepl_id,
            ThreePLKey: threepl_key,
            Login: username,
            Password: password,
            FacilityID: facility_id,
            CustomerID: customer_id
        }
    }).catch(error => {
        return { error_message: error.message }
    });
  }

}

module.exports = new ThreePLController();
