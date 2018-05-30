const chai = require('chai');
const expect = chai.expect;
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js')

const Routes = global.SixCRM.routes.include('root', 'routes.js');

describe('core/Configuration.js', () => {

  describe('getStageDomain', () => {

    it('retrieves site domain', () => {

      const Configuration = global.SixCRM.routes.include('core', 'Configuration.js');
      let configuration = new Configuration(new Routes());

      configuration.site_config.site.domain = 'furbolg.zoo';
      configuration.stage = 'fuzzy';

      let domain = configuration.getStageDomain();
      expect(domain).to.equal('furbolg.zoo');

    });

    it('returns null', () => {

      const Configuration = global.SixCRM.routes.include('core', 'Configuration.js');
      let configuration = new Configuration(new Routes());

      delete configuration.site_config.site.domain;

      let domain = configuration.getStageDomain();
      expect(domain).to.equal(null);

    });

  });

  describe('getSubdomainPath', () => {

    it('retrieves the correct domain', () => {

      //Technical Debt:  This fails when production credentials are used (get stage references...)
      const Configuration = global.SixCRM.routes.include('core', 'Configuration.js');
      let configuration = new Configuration(new Routes());

      configuration.site_config.site.domain = 'furbolg.zoo';
      configuration.stage = 'fuzzy';
      let domain_path = configuration.getSubdomainPath('critters');
      expect(domain_path).to.equal('fuzzy-critters.furbolg.zoo');

    });

    it('retrieves the correct domain (no stage)', () => {

      const Configuration = global.SixCRM.routes.include('core', 'Configuration.js');
      let configuration = new Configuration(new Routes());

      configuration.site_config.site.domain = 'furbolg.zoo';
      configuration.stage = 'fuzzy';
      configuration.site_config.site.include_stage = false

      let domain_path = configuration.getSubdomainPath('critters');
      expect(domain_path).to.equal('critters.furbolg.zoo');

    });

    it('retrieves the correct domain (undefined stage)', () => {

      const Configuration = global.SixCRM.routes.include('core', 'Configuration.js');
      let configuration = new Configuration(new Routes());

      configuration.site_config.site.domain = 'furbolg.zoo';
      delete configuration.site_config.site.include_stage;
      configuration.stage = 'fuzzy';
      let domain_path = configuration.getSubdomainPath('critters');
      expect(domain_path).to.equal('critters.furbolg.zoo');

    });

    it('retrieves the correct domain (undefined subdomain)', () => {

      const Configuration = global.SixCRM.routes.include('core', 'Configuration.js');
      let configuration = new Configuration(new Routes());

      configuration.site_config.site.domain = 'furbolg.zoo';
      configuration.stage = 'fuzzy';
      let domain_path = configuration.getSubdomainPath();
      expect(domain_path).to.equal('furbolg.zoo');

    });

  });

});
