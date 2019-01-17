import mbu from '../../../src/util/model-builder-utilities';
import * as chai from 'chai';
const expect = chai.expect;

describe('lib/model-builder-utilities', () => {

	describe('build', () => {

		it('works on model with no references', () => {
			const path_to_model_under_test = 'definitions/uuidv4.json';

			const model = global.SixCRM.routes.include('model', path_to_model_under_test);
			const hydrated_model = mbu.build(path_to_model_under_test);

			expect(hydrated_model).to.deep.equal(model);
		});

		it('works on model with references', () => {
			// given
			const path_to_model_under_test = 'definitions/optionaluuidv4.json';
			const path_to_reference = 'definitions/uuidv4.json';

			const model = global.SixCRM.routes.include('model', path_to_model_under_test);

			model.anyOf[0] = global.SixCRM.routes.include('model', path_to_reference); // hydrating manually expected result

			// when
			const hydrated_model = mbu.build(path_to_model_under_test);

			// then
			expect(hydrated_model).to.deep.equal(model);

			// cleanup
			delete require.cache[require.resolve(global.SixCRM.routes.path('model', path_to_model_under_test))];
		});

		it('works recursively', () => {
			// given
			const path_to_model_under_test = 'entities/account.json';
			const path_to_reference = 'model/definitions/sixcrmaccountidentifier.json';
			const path_to_subreference = 'model/definitions/uuidv4.json';

			// when
			const hydrated_model = mbu.build(path_to_model_under_test);

			// then
			expect(hydrated_model.properties.id.$id).to.equal(path_to_reference);
			expect(hydrated_model.properties.id.anyOf[0].$id).to.equal(path_to_subreference);
		});

		it('returns empty object when maximum depth reached', () => {

			// any number higher than 20 (maximum depth limit)
			expect(mbu.build('a_model', 21)).to.deep.equal({});
		});

	});

	describe('getSubmodels', () => {

		it('returns an empty array when there is no reference', () => {
			// given
			const model = global.SixCRM.routes.include('model', 'definitions/uuidv4.json');

			// when
			const references = mbu.getSubmodels(model);

			// then
			expect(references).to.deep.equal([]);
		});

		it('finds a reference', () => {

			// given
			const model = {
				$schema: "http://json-schema.org/draft-07/schema",
				$id: "/definitions/optionaluuidv4.json",
				title: "SixCrmIdentifier",

				type: "string",
				anyOf: [
					{$ref: "uuidv4.json"},
					{type: "string", enum: [""]}
				]
			};

			// when
			const references = mbu.getSubmodels(model);

			// then
			expect(references).to.deep.equal(['uuidv4.json']);
		});

	});

	describe('replaceInstancesOfSubmodel', () => {

		it('does not affect model when reference can\'t be found', () => {
			// given
			const model = global.SixCRM.routes.include('model', 'definitions/optionaluuidv4.json');
			const submodel = global.SixCRM.routes.include('model', 'definitions/uuidv4.json');

			// when
			const replacedModel = mbu.replaceInstancesOfSubmodel(model, 'fake_reference', submodel);

			// then
			expect(replacedModel).to.deep.equal(model);
		});

		it('replaces references with submodels', () => {
			// given
			const model = global.SixCRM.routes.include('model', 'definitions/optionaluuidv4.json');
			const submodel = global.SixCRM.routes.include('model', 'definitions/uuidv4.json');

			// when
			const replacedModel = mbu.replaceInstancesOfSubmodel(model, './uuidv4.json', submodel);

			// then
			expect(replacedModel.anyOf[0]).to.deep.equal(submodel);
		});

	});

});
