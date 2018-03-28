'use strict'
const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib','array-utilities.js');

function getExampleContext(){

  return {
    event: {
      account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
      campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
      customer: {
        email: 'Pierce.Connelly@kathryne.org',
        firstname: 'Pierce',
        lastname: 'Connelly',
        phone: '(144) 257-9625 x499',
        address: {
          line1: '4899 Flatley Forks',
          city: 'North Jenaberg',
          state: 'ND',
          zip: '80609-7441',
          country: 'GG',
          line2: 'Apt. 652'
        },
        billing: {
          line1: '4899 Flatley Forks',
          city: 'North Jenaberg',
          state: 'ND',
          zip: '80609-7441',
          country: 'GG',
          line2: 'Apt. 652'
        },
        id: 'e17d5346-0fd0-44c1-9c9d-028b40ab568b',
        account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
        created_at: '2018-03-18T21:22:40.036Z',
        updated_at: '2018-03-18T21:22:40.036Z',
        entity_type: 'customer',
        index_action: 'add'
      },
      affiliates: {
        affiliate: 'cdeaaa9d-27be-4d8e-8ce7-2cfc20595042',
        subaffiliate2: 'V6SD4YQ6QF4UTACCEY5B',
        subaffiliate3: 'UZA6HYA52EBCPQY7PDS9',
        cid: '3c3662b9-0520-4db7-bb62-bacafbb405ef'
      }
    },
    campaign: {
      updated_at: '2018-03-18T20:23:20.698Z',
      productschedules: [
        '12529a17-ac32-4e46-b05b-83862843055d',
        '8d1e896f-c50d-4a6b-8c84-d5661c16a046'
      ],
      created_at: '2018-01-18T14:52:47.220Z',
      emailtemplates: [
        'b44ce483-861c-4843-a7d6-b4c649d6bdde',
        '8108d6a3-2d10-4013-9e8e-df71e2dc578b',
        '102131a0-4cc4-4463-a614-e3157c3f03c2'
      ],
      allow_prepaid: false,
      affiliate_allow: [ 'ad58ea78-504f-4a7e-ad45-128b6e76dc57' ],
      account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
      show_prepaid: false,
      affiliate_deny: [ '*' ],
      id: '70a6689a-5814-438b-b9fd-dd484d0812f9',
      name: 'Example Campaign'
    },
    customer:{
      email: 'Pierce.Connelly@kathryne.org',
      firstname: 'Pierce',
      lastname: 'Connelly',
      phone: '(144) 257-9625 x499',
      address:{
        line1: '4899 Flatley Forks',
        city: 'North Jenaberg',
        state: 'ND',
        zip: '80609-7441',
        country: 'GG',
        line2: 'Apt. 652'
      },
      billing:{
        line1: '4899 Flatley Forks',
        city: 'North Jenaberg',
        state: 'ND',
        zip: '80609-7441',
        country: 'GG',
        line2: 'Apt. 652'
      },
      id: 'e17d5346-0fd0-44c1-9c9d-028b40ab568b',
      account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
      created_at: '2018-03-18T21:22:40.036Z',
      updated_at: '2018-03-18T21:22:40.036Z',
      entity_type: 'customer',
      index_action: 'add'
    },
    affiliates: {
      affiliate: 'cdeaaa9d-27be-4d8e-8ce7-2cfc20595042',
      subaffiliate2: 'V6SD4YQ6QF4UTACCEY5B',
      subaffiliate3: 'UZA6HYA52EBCPQY7PDS9',
      cid: '3c3662b9-0520-4db7-bb62-bacafbb405ef'
    },
    session_prototype: {
      customer: 'e17d5346-0fd0-44c1-9c9d-028b40ab568b',
      campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
      completed: false,
      affiliate: 'cdeaaa9d-27be-4d8e-8ce7-2cfc20595042',
      subaffiliate2: 'V6SD4YQ6QF4UTACCEY5B',
      subaffiliate3: 'UZA6HYA52EBCPQY7PDS9',
      cid: '3c3662b9-0520-4db7-bb62-bacafbb405ef'
    },
    session: {
      completed: false,
      customer: 'e17d5346-0fd0-44c1-9c9d-028b40ab568b',
      campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
      affiliate: 'cdeaaa9d-27be-4d8e-8ce7-2cfc20595042',
      cid: '3c3662b9-0520-4db7-bb62-bacafbb405ef',
      alias: 'S281P5BKSZ',
      id: 'db63ba2d-8a0c-4df5-8332-ab500de93fcc',
      account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
      created_at: '2018-03-18T21:22:40.264Z',
      updated_at: '2018-03-18T21:22:40.264Z',
      entity_type: 'session',
      index_action: 'add'
    }
  };

}
describe('helpers/context/Context.js', () => {
  describe('constructor', () => {
    it('successfully constructs', () => {
      const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
      let contextHelperController = new ContextHelperController();
      expect(objectutilities.getClassName(contextHelperController)).to.equal('ContextHelperController');
    });
  });

  describe('getFromContext', () => {
    it('successfully retrieves objects from context', () => {
      const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
      let contextHelperController = new ContextHelperController();

      let desired_user = 'some@user.com';

      let contexts = [
        {
          user:{ id: desired_user }
        },
        {
          user: { id: desired_user },
          account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
        },
        {
          event: {
            user: { id: desired_user },
          },
          account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
        }
      ];

      arrayutilities.map(contexts, context => {
        let user = contextHelperController.getFromContext(context, 'user.id', 'id');
        expect(user).to.equal(desired_user);
      });

    });

    it('successfully retrieves objects from context', () => {
      const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
      let contextHelperController = new ContextHelperController();

      let desired_user = 'some@user.com';

      let contexts = [
        {
          user: desired_user
        },
        {
          event: {
            user: desired_user
          }
        }
      ];

      arrayutilities.map(contexts, context => {
        let user = contextHelperController.getFromContext(context, 'user', 'id');
        expect(user).to.equal(desired_user);
      });

    });

    it('successfully identifies the account from context', () => {

      let context = getExampleContext();

      const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
      let contextHelperController = new ContextHelperController();

      let discovered_account = contextHelperController.getFromContext(context, 'account', 'id');
      expect(discovered_account).to.equal('d3fa3bf3-7824-49f4-8261-87674482bf1c');

    })

    it('successfully identifies the campaign.name from context', () => {

      let context = getExampleContext();

      const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
      let contextHelperController = new ContextHelperController();

      let discovered_account = contextHelperController.getFromContext(context, 'campaign.name', false);
      expect(discovered_account).to.equal('Example Campaign');

    })

  });
});
