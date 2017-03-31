const du = require('../lib/debug-utilities.js');
var rebill_object = {
  "amount": "34.99",
  "billdate": 1485842247,
  "id": "55c103b4-670a-439e-98d4-5a2834bb5fc3",
  "parentsession": "668ad918-0d09-4116-a6fe-0e8a9eda36f7",
  "processing": "true",
  "product_schedules": [
    "12529a17-ac32-4e46-b05b-83862843055d"
  ],
  "products": [
    "be992cea-e4be-4d3e-9afa-8e020340ed16"
  ]
}

du.output(JSON.stringify(rebill_object));
