import * as chai from 'chai';
const expect = chai.expect;
import Configuration from '../../../src/Configuration';
import Routes from '../../../src/routes';

describe('core/Configuration.js', () => {

	describe('getStageDomain', () => {

		it('retrieves site domain', () => {

			const configuration = new Configuration(new Routes());

			configuration.site_config.site.domain = 'furbolg.zoo';
			configuration.stage = 'fuzzy';

			const domain = configuration.getStageDomain();
			expect(domain).to.equal('furbolg.zoo');

		});

		it('returns null', () => {

			const configuration = new Configuration(new Routes());

			delete configuration.site_config.site.domain;

			const domain = configuration.getStageDomain();
			expect(domain).to.equal(null);

		});

	});

	describe('getSubdomainPath', () => {

		it('retrieves the correct domain', () => {

			// Technical Debt:  This fails when production credentials are used (get stage references...)
			const configuration = new Configuration(new Routes());

			configuration.site_config.site.domain = 'furbolg.zoo';
			configuration.stage = 'fuzzy';
			const domain_path = configuration.getSubdomainPath('critters');
			expect(domain_path).to.equal('fuzzy-critters.furbolg.zoo');

		});

		it('retrieves the correct domain (no stage)', () => {

			const configuration = new Configuration(new Routes());

			configuration.site_config.site.domain = 'furbolg.zoo';
			configuration.stage = 'fuzzy';
			configuration.site_config.site.include_stage = false;

			const domain_path = configuration.getSubdomainPath('critters');
			expect(domain_path).to.equal('critters.furbolg.zoo');

		});

		it('retrieves the correct domain (undefined stage)', () => {

			const configuration = new Configuration(new Routes());

			configuration.site_config.site.domain = 'furbolg.zoo';
			delete configuration.site_config.site.include_stage;
			configuration.stage = 'fuzzy';
			const domain_path = configuration.getSubdomainPath('critters');
			expect(domain_path).to.equal('critters.furbolg.zoo');

		});

		it('retrieves the correct domain (undefined subdomain)', () => {

			const configuration = new Configuration(new Routes());

			configuration.site_config.site.domain = 'furbolg.zoo';
			configuration.stage = 'fuzzy';
			const domain_path = configuration.getSubdomainPath();
			expect(domain_path).to.equal('furbolg.zoo');

		});

	});

});
