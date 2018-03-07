'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getValidSession(){

  return {
    "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
    "affiliate": "1d3cf546-9e67-47de-9e69-bf1231b5ec82",
    "alias": "SM5USJ2MG6",
    "campaign": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
    "completed": false,
    "created_at": "2018-03-06T17:19:32.291Z",
    "customer": "cf0d917f-0190-463c-a562-00abd46a64dd",
    "id": "f36cae71-feae-450a-b98b-731e73bc5c8b",
    "updated_at": "2018-03-06T17:33:58.765Z",
    "watermark": {
      "product_schedules": [
        {
          "product_schedule": {
            "schedule": [
              {
                "end": 0,
                "period": 14,
                "price": 1,
                "product": {
                  "id": "6c6ec904-5315-4214-a057-79a7ff308cde",
                  "name": "Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
                },
                "start": 0
              },
              {
                "end": 0,
                "period": 14,
                "price": 1,
                "product": {
                  "id": "92bd4679-8fb5-47ff-93f5-8679c46bcaad",
                  "name": "Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
                },
                "start": 0
              }
            ]
          },
          "quantity": 1
        }
        /*,
        {
          "product_schedule": {
            "schedule": [
              {
                "period": 14,
                "price": 1,
                "product": {
                  "id": "92bd4679-8fb5-47ff-93f5-8679c46bcaad",
                  "name": "Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
                },
                "start": 0
              }
            ]
          },
          "quantity": 1
        },
        {
          "product_schedule": {
            "schedule": [
              {
                "period": 14,
                "price": 1,
                "product": {
                  "id": "6c6ec904-5315-4214-a057-79a7ff308cde",
                  "name": "Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
                },
                "start": 0
              }
            ]
          },
          "quantity": 1
        },
        {
          "product_schedule": {
            "schedule": [
              {
                "period": 14,
                "price": 1,
                "product": {
                  "id": "92bd4679-8fb5-47ff-93f5-8679c46bcaad",
                  "name": "Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
                },
                "start": 0
              }
            ]
          },
          "quantity": 1
        },
        {
          "product_schedule": {
            "schedule": [
              {
                "period": 14,
                "price": 1,
                "product": {
                  "id": "6c6ec904-5315-4214-a057-79a7ff308cde",
                  "name": "Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
                },
                "start": 0
              }
            ]
          },
          "quantity": 1
        },
        {
          "product_schedule": {
            "schedule": [
              {
                "period": 14,
                "price": 1,
                "product": {
                  "id": "92bd4679-8fb5-47ff-93f5-8679c46bcaad",
                  "name": "Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
                },
                "start": 0
              }
            ]
          },
          "quantity": 1
        },
        {
          "product_schedule": {
            "schedule": [
              {
                "period": 14,
                "price": 1,
                "product": {
                  "id": "6c6ec904-5315-4214-a057-79a7ff308cde",
                  "name": "Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
                },
                "start": 0
              }
            ]
          },
          "quantity": 1
        }
        */
      ],
      "products": [
        /*
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": [
                {
                  "default_image": false,
                  "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/e023cdccdee2b175edf3a84a4bd0dd96b59b252f.jpg"
                }
              ]
            },
            "created_at": "2018-02-19T20:08:14.888Z",
            "default_price": 5.98,
            "description": "120ct Easy Tie Bags",
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "4efa7820-38d4-4643-9745-ba581a665557",
            "name": "Bark Dog Waste Bags",
            "ship": true,
            "shipping_delay": 60,
            "sku": "DWB-120",
            "updated_at": "2018-02-19T20:12:24.928Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": []
            },
            "created_at": "2018-01-25T17:09:37.435Z",
            "default_price": 15.96,
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "78c02d93-e9e0-4077-817e-eaf6d3316b10",
            "name": "Bully Stick - Steer, 6\"(4 pcs/ 1 pkg)",
            "ship": true,
            "shipping_delay": 60,
            "sku": "EFT BLS-600MC",
            "updated_at": "2018-02-22T20:12:02.709Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": [
                {
                  "default_image": false,
                  "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/5627243dc22fc65b79b19399f0af461b44f479d9.png"
                }
              ]
            },
            "created_at": "2018-02-19T20:11:31.708Z",
            "default_price": 20.97,
            "description": "Sheep Ears, Crunchy Spare Ribs, Lamb Puffs ",
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "ab9aa4d0-0c2e-47f3-a458-b4d0bc8f371e",
            "name": "Newts Chews Sampler Pack",
            "ship": true,
            "shipping_delay": 60,
            "sku": "NCNZ-Sampler",
            "updated_at": "2018-02-19T20:12:38.246Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": [
                {
                  "default_image": false,
                  "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/e023cdccdee2b175edf3a84a4bd0dd96b59b252f.jpg"
                }
              ]
            },
            "created_at": "2018-02-19T20:08:14.888Z",
            "default_price": 5.98,
            "description": "120ct Easy Tie Bags",
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "4efa7820-38d4-4643-9745-ba581a665557",
            "name": "Bark Dog Waste Bags",
            "ship": true,
            "shipping_delay": 60,
            "sku": "DWB-120",
            "updated_at": "2018-02-19T20:12:24.928Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": []
            },
            "created_at": "2018-01-25T17:09:37.435Z",
            "default_price": 15.96,
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "78c02d93-e9e0-4077-817e-eaf6d3316b10",
            "name": "Bully Stick - Steer, 6\"(4 pcs/ 1 pkg)",
            "ship": true,
            "shipping_delay": 60,
            "sku": "EFT BLS-600MC",
            "updated_at": "2018-02-22T20:12:02.709Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": [
                {
                  "default_image": false,
                  "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/5627243dc22fc65b79b19399f0af461b44f479d9.png"
                }
              ]
            },
            "created_at": "2018-02-19T20:11:31.708Z",
            "default_price": 20.97,
            "description": "Sheep Ears, Crunchy Spare Ribs, Lamb Puffs ",
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "ab9aa4d0-0c2e-47f3-a458-b4d0bc8f371e",
            "name": "Newts Chews Sampler Pack",
            "ship": true,
            "shipping_delay": 60,
            "sku": "NCNZ-Sampler",
            "updated_at": "2018-02-19T20:12:38.246Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": [
                {
                  "default_image": false,
                  "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/e023cdccdee2b175edf3a84a4bd0dd96b59b252f.jpg"
                }
              ]
            },
            "created_at": "2018-02-19T20:08:14.888Z",
            "default_price": 5.98,
            "description": "120ct Easy Tie Bags",
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "4efa7820-38d4-4643-9745-ba581a665557",
            "name": "Bark Dog Waste Bags",
            "ship": true,
            "shipping_delay": 60,
            "sku": "DWB-120",
            "updated_at": "2018-02-19T20:12:24.928Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": []
            },
            "created_at": "2018-01-25T17:09:37.435Z",
            "default_price": 15.96,
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "78c02d93-e9e0-4077-817e-eaf6d3316b10",
            "name": "Bully Stick - Steer, 6\"(4 pcs/ 1 pkg)",
            "ship": true,
            "shipping_delay": 60,
            "sku": "EFT BLS-600MC",
            "updated_at": "2018-02-22T20:12:02.709Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": [
                {
                  "default_image": false,
                  "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/5627243dc22fc65b79b19399f0af461b44f479d9.png"
                }
              ]
            },
            "created_at": "2018-02-19T20:11:31.708Z",
            "default_price": 20.97,
            "description": "Sheep Ears, Crunchy Spare Ribs, Lamb Puffs ",
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "ab9aa4d0-0c2e-47f3-a458-b4d0bc8f371e",
            "name": "Newts Chews Sampler Pack",
            "ship": true,
            "shipping_delay": 60,
            "sku": "NCNZ-Sampler",
            "updated_at": "2018-02-19T20:12:38.246Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": [
                {
                  "default_image": false,
                  "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/e023cdccdee2b175edf3a84a4bd0dd96b59b252f.jpg"
                }
              ]
            },
            "created_at": "2018-02-19T20:08:14.888Z",
            "default_price": 5.98,
            "description": "120ct Easy Tie Bags",
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "4efa7820-38d4-4643-9745-ba581a665557",
            "name": "Bark Dog Waste Bags",
            "ship": true,
            "shipping_delay": 60,
            "sku": "DWB-120",
            "updated_at": "2018-02-19T20:12:24.928Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": []
            },
            "created_at": "2018-01-25T17:09:37.435Z",
            "default_price": 15.96,
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "78c02d93-e9e0-4077-817e-eaf6d3316b10",
            "name": "Bully Stick - Steer, 6\"(4 pcs/ 1 pkg)",
            "ship": true,
            "shipping_delay": 60,
            "sku": "EFT BLS-600MC",
            "updated_at": "2018-02-22T20:12:02.709Z"
          },
          "quantity": 1
        },
        {
          "price": 1,
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": [
                {
                  "default_image": false,
                  "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/5627243dc22fc65b79b19399f0af461b44f479d9.png"
                }
              ]
            },
            "created_at": "2018-02-19T20:11:31.708Z",
            "default_price": 20.97,
            "description": "Sheep Ears, Crunchy Spare Ribs, Lamb Puffs ",
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "ab9aa4d0-0c2e-47f3-a458-b4d0bc8f371e",
            "name": "Newts Chews Sampler Pack",
            "ship": true,
            "shipping_delay": 60,
            "sku": "NCNZ-Sampler",
            "updated_at": "2018-02-19T20:12:38.246Z"
          },
          "quantity": 1
        }
        */
      ]
    }
  }

}

function getValidCustomer(){

  return {
    "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
    "address": {
      "city": "Lake Oswego",
      "country": "US",
      "line1": "4120 Canal Rd.",
      "state": "OR",
      "zip": "97034"
    },
    "billing": {
      "city": "Lake Oswego",
      "country": "US",
      "line1": "4120 Canal Rd.",
      "state": "OR",
      "zip": "97034"
    },
    "created_at": "2018-03-06T17:19:31.887Z",
    "creditcards": [
      "34c785d2-3fd5-4982-bea9-16a5dbbe98a2"
    ],
    "email": "kris@sixcrm.com",
    "firstname": "Kristopher",
    "id": "cf0d917f-0190-463c-a562-00abd46a64dd",
    "lastname": "Trujillo",
    "phone": "1234567890",
    "updated_at": "2018-03-06T17:19:36.772Z"
  }

}

function getValidFulfillmentProvider(){

  return{
    "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
    "created_at": "2018-01-24T21:03:09.957Z",
    "id": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
    "name": "Shipstation",
    "provider": {
      "api_key": "f3b8be9a3b0f4483bcd965d66efa3d0f",
      "api_secret": "fc45ddf0a0834f7fae4e4fbade1aa05d",
      "name": "ShipStation"
    },
    "updated_at": "2018-01-28T20:41:46.662Z"
  }

}

function getValidRebill(){

  return {
    "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
    "amount": 5,
    "bill_at": "2018-03-06T17:19:32.000Z",
    "created_at": "2018-03-06T17:26:58.195Z",
    "history": [
      {
        "entered_at": "2018-03-06T17:27:07.714Z",
        "state": "hold"
      }
    ],
    "id": "bd11b0ce-4dfc-4c8a-a455-d89f63db4636",
    "parentsession": "f36cae71-feae-450a-b98b-731e73bc5c8b",
    "processing": true,
    "products": [
      {
        "amount": 1,
        "product": {
          "id": "92bd4679-8fb5-47ff-93f5-8679c46bcaad",
          "name": "Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
        },
        "quantity": 1
      },
      {
        "amount": 1,
        "product": {
          "id": "6c6ec904-5315-4214-a057-79a7ff308cde",
          "name": "Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
        },
        "quantity": 1
      }
      /*,
      {
        "amount": 1,
        "product": {
          "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
          "attributes": {
            "images": [
              {
                "default_image": false,
                "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/e023cdccdee2b175edf3a84a4bd0dd96b59b252f.jpg"
              }
            ]
          },
          "created_at": "2018-02-19T20:08:14.888Z",
          "default_price": 5.98,
          "description": "120ct Easy Tie Bags",
          "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
          "id": "4efa7820-38d4-4643-9745-ba581a665557",
          "name": "Bark Dog Waste Bags",
          "ship": true,
          "shipping_delay": 60,
          "sku": "DWB-120",
          "updated_at": "2018-02-19T20:12:24.928Z"
        },
        "quantity": 1
      },
      {
        "amount": 1,
        "product": {
          "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
          "attributes": {
            "images": []
          },
          "created_at": "2018-01-25T17:09:37.435Z",
          "default_price": 15.96,
          "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
          "id": "78c02d93-e9e0-4077-817e-eaf6d3316b10",
          "name": "Bully Stick - Steer, 6\"(4 pcs/ 1 pkg)",
          "ship": true,
          "shipping_delay": 60,
          "sku": "EFT BLS-600MC",
          "updated_at": "2018-02-22T20:12:02.709Z"
        },
        "quantity": 1
      },
      {
        "amount": 1,
        "product": {
          "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
          "attributes": {
            "images": [
              {
                "default_image": false,
                "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/5627243dc22fc65b79b19399f0af461b44f479d9.png"
              }
            ]
          },
          "created_at": "2018-02-19T20:11:31.708Z",
          "default_price": 20.97,
          "description": "Sheep Ears, Crunchy Spare Ribs, Lamb Puffs ",
          "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
          "id": "ab9aa4d0-0c2e-47f3-a458-b4d0bc8f371e",
          "name": "Newts Chews Sampler Pack",
          "ship": true,
          "shipping_delay": 60,
          "sku": "NCNZ-Sampler",
          "updated_at": "2018-02-19T20:12:38.246Z"
        },
        "quantity": 1
      }
      */
    ],
    "state": "hold",
    "state_changed_at": "2018-03-06T17:27:07.714Z",
    "updated_at": "2018-03-06T17:27:08.101Z"
  }

}

function getValidTransactions(){

  return [
    {
      "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
      "alias": "T9RN11AKEQ",
      "amount": 5,
      "created_at": "2018-03-06T17:27:06.282Z",
      "id": "332323a7-eed7-461c-8c01-341461a2e3de",
      "merchant_provider": "320a1272-4074-43f9-b53b-37f8f2054ba4",
      "processor_response": "{\"code\":\"success\",\"message\":\"Success\",\"result\":{\"code\":\"success\",\"response\":{\"statusCode\":200,\"statusMessage\":\"OK\",\"body\":{\"id\":\"ch_1C2jZ6CYXcFjdN8NyHRfcxDW\",\"object\":\"charge\",\"amount\":500,\"amount_refunded\":0,\"application\":null,\"application_fee\":null,\"balance_transaction\":\"txn_1C2jZ7CYXcFjdN8NydvFn2m8\",\"captured\":true,\"created\":1520357224,\"currency\":\"usd\",\"customer\":null,\"description\":null,\"destination\":null,\"dispute\":null,\"failure_code\":null,\"failure_message\":null,\"fraud_details\":{},\"invoice\":null,\"livemode\":true,\"metadata\":{},\"on_behalf_of\":null,\"order\":null,\"outcome\":{\"network_status\":\"approved_by_network\",\"reason\":null,\"risk_level\":\"normal\",\"seller_message\":\"Payment complete.\",\"type\":\"authorized\"},\"paid\":true,\"receipt_email\":null,\"receipt_number\":null,\"refunded\":false,\"refunds\":{\"object\":\"list\",\"data\":[],\"has_more\":false,\"total_count\":0,\"url\":\"/v1/charges/ch_1C2jZ6CYXcFjdN8NyHRfcxDW/refunds\"},\"review\":null,\"shipping\":null,\"source\":{\"id\":\"card_1C2jZ5CYXcFjdN8N1DnOGCkw\",\"object\":\"card\",\"address_city\":null,\"address_country\":null,\"address_line1\":null,\"address_line1_check\":null,\"address_line2\":null,\"address_state\":null,\"address_zip\":null,\"address_zip_check\":null,\"brand\":\"Visa\",\"country\":\"US\",\"customer\":null,\"cvc_check\":\"pass\",\"dynamic_last4\":null,\"exp_month\":4,\"exp_year\":2021,\"fingerprint\":\"So5aQ7f10dSeKPLB\",\"funding\":\"debit\",\"last4\":\"4065\",\"metadata\":{},\"name\":null,\"tokenization_method\":null},\"source_transfer\":null,\"statement_descriptor\":null,\"status\":\"succeeded\",\"transfer_group\":null}},\"message\":\"Success\"},\"merchant_provider\":\"320a1272-4074-43f9-b53b-37f8f2054ba4\",\"creditcard\":\"34c785d2-3fd5-4982-bea9-16a5dbbe98a2\"}",
      "products": [
        {
          "amount": 1,
          "merchantprovidergroupassociation": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "campaign": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
            "created_at": "2017-04-06T18:40:41.405Z",
            "entity": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
            "entity_type": "campaign",
            "id": "2108dae2-51cf-4d5d-8c01-98050355e4a6",
            "merchantprovidergroup": "42b72ba4-12a2-458b-b515-51645ee73650",
            "updated_at": "2017-04-06T18:41:12.521Z"
          },
          "product": {
            "id": "92bd4679-8fb5-47ff-93f5-8679c46bcaad",
            "name": "Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
          },
          "quantity": 1
        },
        {
          "amount": 1,
          "merchantprovidergroupassociation": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "campaign": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
            "created_at": "2017-04-06T18:40:41.405Z",
            "entity": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
            "entity_type": "campaign",
            "id": "2108dae2-51cf-4d5d-8c01-98050355e4a6",
            "merchantprovidergroup": "42b72ba4-12a2-458b-b515-51645ee73650",
            "updated_at": "2017-04-06T18:41:12.521Z"
          },
          "product": {
            "id": "6c6ec904-5315-4214-a057-79a7ff308cde",
            "name": "Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
          },
          "quantity": 1
        }
        /*
        ,
        {
          "amount": 1,
          "merchantprovidergroupassociation": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "campaign": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
            "created_at": "2017-04-06T18:40:41.405Z",
            "entity": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
            "entity_type": "campaign",
            "id": "2108dae2-51cf-4d5d-8c01-98050355e4a6",
            "merchantprovidergroup": "42b72ba4-12a2-458b-b515-51645ee73650",
            "updated_at": "2017-04-06T18:41:12.521Z"
          },
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": [
                {
                  "default_image": false,
                  "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/e023cdccdee2b175edf3a84a4bd0dd96b59b252f.jpg"
                }
              ]
            },
            "created_at": "2018-02-19T20:08:14.888Z",
            "default_price": 5.98,
            "description": "120ct Easy Tie Bags",
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "4efa7820-38d4-4643-9745-ba581a665557",
            "name": "Bark Dog Waste Bags",
            "ship": true,
            "shipping_delay": 60,
            "sku": "DWB-120",
            "updated_at": "2018-02-19T20:12:24.928Z"
          },
          "quantity": 1
        },
        {
          "amount": 1,
          "merchantprovidergroupassociation": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "campaign": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
            "created_at": "2017-04-06T18:40:41.405Z",
            "entity": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
            "entity_type": "campaign",
            "id": "2108dae2-51cf-4d5d-8c01-98050355e4a6",
            "merchantprovidergroup": "42b72ba4-12a2-458b-b515-51645ee73650",
            "updated_at": "2017-04-06T18:41:12.521Z"
          },
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": []
            },
            "created_at": "2018-01-25T17:09:37.435Z",
            "default_price": 15.96,
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "78c02d93-e9e0-4077-817e-eaf6d3316b10",
            "name": "Bully Stick - Steer, 6\"(4 pcs/ 1 pkg)",
            "ship": true,
            "shipping_delay": 60,
            "sku": "EFT BLS-600MC",
            "updated_at": "2018-02-22T20:12:02.709Z"
          },
          "quantity": 1
        },
        {
          "amount": 1,
          "merchantprovidergroupassociation": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "campaign": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
            "created_at": "2017-04-06T18:40:41.405Z",
            "entity": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
            "entity_type": "campaign",
            "id": "2108dae2-51cf-4d5d-8c01-98050355e4a6",
            "merchantprovidergroup": "42b72ba4-12a2-458b-b515-51645ee73650",
            "updated_at": "2017-04-06T18:41:12.521Z"
          },
          "product": {
            "account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
            "attributes": {
              "images": [
                {
                  "default_image": false,
                  "path": "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/5627243dc22fc65b79b19399f0af461b44f479d9.png"
                }
              ]
            },
            "created_at": "2018-02-19T20:11:31.708Z",
            "default_price": 20.97,
            "description": "Sheep Ears, Crunchy Spare Ribs, Lamb Puffs ",
            "fulfillment_provider": "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
            "id": "ab9aa4d0-0c2e-47f3-a458-b4d0bc8f371e",
            "name": "Newts Chews Sampler Pack",
            "ship": true,
            "shipping_delay": 60,
            "sku": "NCNZ-Sampler",
            "updated_at": "2018-02-19T20:12:38.246Z"
          },
          "quantity": 1
        }
        */
      ],
      "rebill": "bd11b0ce-4dfc-4c8a-a455-d89f63db4636",
      "result": "success",
      "type": "sale",
      "updated_at": "2018-03-06T17:27:06.282Z"
    }
  ];

}

describe('controllers/providers/terminal/Terminal.js', function () {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  beforeEach(() => {
    global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('fulfill', () => {

    it('successfully ships a the rebill', () => {

      process.env.SIX_VERBOSE = 2;
      PermissionTestGenerators.givenUserWithAllowed('*','*','*');

      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        listTransactions:(rebill) => {
          return Promise.resolve({transactions: transactions});
        },
        getResult:(result, field) => {
          du.debug('Get Result');
          if(_.isUndefined(field)){
            field = this.descriptive_name+'s';
          }
          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
        },
        getSession: (rebill) => {
          return Promise.resolve(session)
        },
        get:({id}) => {
          return Promise.resolve(rebill);
        }
      });

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      return terminalController.fulfill({rebill: rebill}).then(result => {
        du.info(result);
        expect(result.getCode()).to.equal('success');
        expect(objectutilities.getClassName(result)).to.equal('TerminalResponse');
      });

    });

  });

});
