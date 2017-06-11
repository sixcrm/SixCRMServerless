'use strict'
const  _ =  require('underscore');
const util = require('util');
const chalk = require('chalk');

const arrayutilities = global.routes.include('lib','array-utilities');

module.exports = class DebugUtilities {

    static emit(verbosity_level){

        if(_.has(process.env, 'SIX_VERBOSE') && process.env.SIX_VERBOSE >= verbosity_level){

            return true;

        }

        return false;

    }

    static debug(){

        if(this.emit(2)){

            this.echo(arguments, (output) => { return chalk.grey(output); });

        }

    }

    static deep(){

        if(this.emit(3)){

            this.echo(arguments, (output) => { return chalk.grey(output); });

        }

    }

    static echo(argumentation, output_function){

        let args = Array.from(argumentation);
        let output = [];

        args.forEach((a_argument) => {

            if(_.isString(a_argument)){
                output.push(a_argument);
            }else if(_.isObject(a_argument)){
                output.push(util.inspect(a_argument, {depth : null}));
            }else{
                output.push(a_argument);
            }

        });

        output = arrayutilities.compress(output, '\n','');

        // eslint-disable-next-line no-console
        console.log(output_function(output));

    }

    static warning(){

        if(this.emit(2)){

            this.echo(arguments, (output) => { return chalk.bold.bgRed(output); });

        }

    }

    static highlight(){

        if(this.emit(2)){

            this.echo(arguments, (output) => { return chalk.underline.green(output); });

        }

    }

    static output(){

        if(this.emit(1)){

            this.echo(arguments, (output) => { return chalk.green(output); });

        }

    }

    static error(){

        if(this.emit(2)){

            this.echo(arguments, (output) => { return chalk.black.bgYellow(output); });

        }

    }

    static info(){

        if(this.emit(2)){

            this.echo(arguments, (output) => { return chalk.blue(output); });

        }

    }

}
