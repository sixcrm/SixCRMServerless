const yargs = require('yargs');

yargs
	.usage('Usage: <command> [options]')
	.commandDir('./commands', {
		extensions: ['js']
	})
	.help('h')
	.alias('h', 'help')
	.demand(1)
	.argv;
