const chai = require('chai');
const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

/* eslint-disable no-console */
describe('lib/debug-utilities', () => {
	let verbose_setting;
	before(() => {
		verbose_setting = process.env.SIX_VERBOSE;
	});

	after(() => {
		process.env.SIX_VERBOSE = verbose_setting;
	});

	describe('emit', () => {

		it('does not emit if SIX_VERBOSE is not set', () => {
			delete process.env.SIX_VERBOSE;
			expect(du.emit('fatal')).to.equal(false);
		});

		it('does not emit if selected level is greater than configured level', () => {
			process.env.SIX_VERBOSE = 2;
			expect(du.emit('debug')).to.equal(false);
		});

		it('emits if selected level is equal to configured level', () => {
			process.env.SIX_VERBOSE = 2;
			expect(du.emit('info')).to.equal(true);
		});

		it('emits if selected level is less than configured level', () => {
			process.env.SIX_VERBOSE = 2;
			expect(du.emit('error')).to.equal(true);
		});

	});

	describe('debug', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.debug('test');
		});

	});

	describe('info', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.info('test');
		});

	});

	describe('warning', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.warning('test');
		});

	});

	describe('error', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.error('test');
		});

	});

	describe('fatal', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.fatal('test');
		});

	});

});
