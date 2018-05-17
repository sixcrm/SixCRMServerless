const chai = require('chai');
const expect = chai.expect;
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js')

describe('core/Configuration.js', () => {

  describe('getStageDomain', () => {

    let configuration;

    beforeEach(() => {
      configuration = global.SixCRM.configuration;
    });
    afterEach(() => {
      global.SixCRM.configuration = configuration;
    });

    it('retrieves site domain', () => {

      global.SixCRM.configuration.site_config.site.domain = 'furbolg.zoo';
      global.SixCRM.configuration.stage = 'fuzzy';

      let domain = global.SixCRM.configuration.getStageDomain();
      expect(domain).to.equal('furbolg.zoo');

    });

    it('retrieves site domain', () => {

      delete global.SixCRM.configuration.site_config.site.domain;

      let domain = global.SixCRM.configuration.getStageDomain();
      expect(domain).to.equal(null);

    });

  });

  describe('getSubdomainPath', () => {

    let configuration;

    beforeEach(() => {
      configuration = global.SixCRM.configuration;
    });
    afterEach(() => {
      global.SixCRM.configuration = configuration;
    });

    it('retrieves the correct domain', () => {

      global.SixCRM.configuration.site_config.site.domain = 'furbolg.zoo';
      global.SixCRM.configuration.stage = 'fuzzy';
      let domain_path = global.SixCRM.configuration.getSubdomainPath('critters');
      expect(domain_path).to.equal('fuzzy-critters.furbolg.zoo');

    });

    it('retrieves the correct domain (no stage)', () => {

      global.SixCRM.configuration.site_config.site.domain = 'furbolg.zoo';
      global.SixCRM.configuration.site_config.site.include_stage = false
      global.SixCRM.configuration.stage = 'fuzzy';
      let domain_path = global.SixCRM.configuration.getSubdomainPath('critters');
      expect(domain_path).to.equal('critters.furbolg.zoo');

    });

    it('retrieves the correct domain (undefined stage)', () => {

      global.SixCRM.configuration.site_config.site.domain = 'furbolg.zoo';
      delete global.SixCRM.configuration.site_config.site.include_stage;
      global.SixCRM.configuration.stage = 'fuzzy';
      let domain_path = global.SixCRM.configuration.getSubdomainPath('critters');
      expect(domain_path).to.equal('critters.furbolg.zoo');

    });

    it('retrieves the correct domain (undefined subdomain)', () => {

      global.SixCRM.configuration.site_config.site.domain = 'furbolg.zoo';
      global.SixCRM.configuration.stage = 'fuzzy';
      let domain_path = global.SixCRM.configuration.getSubdomainPath();
      expect(domain_path).to.equal('furbolg.zoo');

    });

  });

});

/*

getStageDomain(){

  du.debug('Get Stage Domain');

  if(_.has(this, 'site_config') && _.has(this.site_config, 'site') && _.has(this.site_config.site, 'domain')){
    return this.site_config.site.domain;
  }

  return null;

}
*/
