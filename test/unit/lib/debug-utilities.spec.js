const chai = require('chai');
const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

/* eslint-disable no-console */
describe('lib/debug-utilities', () => {

	let verbose_level;
	let log;

	before(() => {
		verbose_level = process.env.SIX_VERBOSE;
		log = console.log;
		console.log = function(){
			expect(arguments).to.be.defined;
		}
	});

	after(() => {
		process.env.SIX_VERBOSE = verbose_level;
		console.log = log;
	});

	describe('emit', () => {
		before(() => {
			console.log = log;
		});
		after(() => {
			console.log = function(){
				expect(arguments).to.be.defined;
			}
		});

		it('does not emit if SIX_VERBOSE is not set', () => {
			delete process.env.SIX_VERBOSE;
			expect(du.emit('immutable')).to.equal(false);
		});

		it('does not emit if selected level is greater than configured level', () => {
			process.env.SIX_VERBOSE = 2;
			expect(du.emit('deep')).to.equal(false);
		});

		it('emits if selected level is equal to configured level', () => {
			process.env.SIX_VERBOSE = 2;
			expect(du.emit('debug')).to.equal(true);
		});

		it('emits if selected level is less than configured level', () => {
			process.env.SIX_VERBOSE = 2;
			expect(du.emit('critical')).to.equal(true);
		});

	});

	describe('immutable', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.immutable('test');
		});

	});

	describe('debug', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.debug('test');
		});

	});

	describe('critical', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.critical('test');
		});

	});

	describe('deep', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.deep('test');
		});

	});

	describe('warning', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.warning('test');
		});

	});

	describe('highlight', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.highlight('test');
		});

	});

	describe('output', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.output('test');
		});

	});

	describe('error', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.error('test');
		});

	});

	describe('info', () => {

		it('prints output', () => {
			process.env.SIX_VERBOSE = 6;
			du.info('test');
		});

	});



});
