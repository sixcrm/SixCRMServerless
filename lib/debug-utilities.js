'use strict'
const  _ =  require('underscore');
const util = require('util');
const chalk = require('chalk');
let arrayutilities = global.SixCRM.routes.include('lib','array-utilities.js');


module.exports = class DebugUtilities {

    static emit(verbosity_level){

        if(_.has(process.env, 'SIX_VERBOSE') && process.env.SIX_VERBOSE >= verbosity_level){

            return true;

        }

        return false;

    }

    static echo(argumentation, output_function, critical){

        let args = Array.from(argumentation);
        let output = [];

        if(_.isUndefined(critical)){
          critical == false;
        }

        let critical_string = '********************';

        args.forEach((a_argument) => {

          if(critical == true){
            output.push(critical_string)
            output.push('\n');
          }

          if(_.isString(a_argument)){
              output.push(a_argument);
          }else if(_.isObject(a_argument)){
              output.push(util.inspect(a_argument, {depth : null}));
          }else{
              output.push(a_argument);
          }

          if(critical == true){
            output.push('\n');
            output.push(critical_string)
          }

        });

        output = this.arrayutilities().compress(output, '\n','');

        // eslint-disable-next-line no-console
        console.log(output_function(output));

    }

    static immutable(){

      this.echo(arguments, (output) => { return chalk.green(output); });

    }

    static debug(){

        if(this.emit(2)){

            this.echo(arguments, (output) => { return chalk.grey(output); });

        }

    }

    static critical(){

        if(this.emit(1)){

            this.echo(arguments, (output) => { return chalk.grey(output); }, true);

        }

    }

    static deep(){

        if(this.emit(3)){

            this.echo(arguments, (output) => { return chalk.grey(output); });

        }

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

    static arrayutilities() {
        if (!_.isFunction(arrayutilities)) {
            arrayutilities = global.SixCRM.routes.include('lib','array-utilities');
        }

        return arrayutilities;
    }

}
