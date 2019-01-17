import * as chai from 'chai';
const expect = chai.expect;
import du, { LogLevel } from '../../../src/util/debug-utilities';

/* eslint-disable no-console */
describe('lib/debug-utilities', () => {
	let verbose_setting: string | undefined;
	before(() => {
		verbose_setting = process.env.SIX_VERBOSE;
	});

	after(() => {
		process.env.SIX_VERBOSE = verbose_setting;
	});

	describe('emit', () => {

		it('does not emit if SIX_VERBOSE is not set', () => {
			delete process.env.SIX_VERBOSE;
			expect(du.emit(LogLevel.fatal)).to.equal(false);
		});

		it('does not emit if selected level is greater than configured level', () => {
			process.env.SIX_VERBOSE = '2';
			expect(du.emit(LogLevel.debug)).to.equal(false);
		});

		it('emits if selected level is equal to configured level', () => {
			process.env.SIX_VERBOSE = '2';
			expect(du.emit(LogLevel.info)).to.equal(true);
		});

		it('emits if selected level is less than configured level', () => {
			process.env.SIX_VERBOSE = '2';
			expect(du.emit(LogLevel.error)).to.equal(true);
		});

	});

	describe('debug', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = '6';
			du.debug('test');
		});

	});

	describe('info', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = '6';
			du.info('test');
		});

	});

	describe('warning', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = '6';
			du.warning('test');
		});

	});

	describe('error', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = '6';
			du.error('test');
		});

	});

	describe('fatal', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = '6';
			du.fatal('test');
		});

	});

});
