'use strict';
const _ = require("underscore");
const graphql =  require('graphql').graphql;

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

let authenticatedController = global.routes.include('controllers', 'endpoints/authenticated.js');
const resolveController = global.routes.include('providers', 'Resolve.js');

module.exports = class graphController extends authenticatedController {

    constructor(){

        super();

        this.sixSchema = global.routes.include('handlers', 'endpoints/graph/schema');

        this.resolveController = new resolveController();

    }

    execute(event){

      du.debug('Execute');

      return this.parseEvent(event)
			.then((event) => this.acquireAccount(event))
      .then((event) => this.acquireUser(event))
      .then((event) => this.acquireQuerystring(event))
      .then((event) => this.acquireQuery(event))
      .then((event) => this.acquireQueryParameters(event))
      .then((event) => this.acquireOutputParameters(event))
      .then((event) => this.setCacheParameters(event))
			.then((event) => this.graphQuery(event))
      .then((response) => this.handleGraphErrors(response));

    }

    setCacheParameters(event){

        du.debug('Set Cache Parameters');

        if(_.has(this.queryString, 'use_cache')){

            this.resolveController.setCacheParameters({use_cache: this.queryString.use_cache});

        }

        return Promise.resolve(event);

    }

    acquireOutputParameters(event){

        du.debug('Acquire Output Parameters');

        if(_.has(this, 'queryString') && _.has(this.queryString, 'download') && !_.isNull(this.queryString.download)){

            this.resolveController.setDownloadParameters({type: this.queryString.download});

        }

        return Promise.resolve(event);

    }

    acquireQuery(event){

        du.debug('Acquire Query');

        this.query = this.sanitizeQuery(event.body);

        return Promise.resolve(event);

    }

    //Technical Debt:  This is largely inadequate...
    sanitizeQuery(query){

        du.debug('Sanitize Query');

        return query.replace(/[\n\r\t]+/g, '');

    }

    acquireQueryParameters(event){

        du.debug('Acquire Query Parameters');

        this.query_parameters = {};

        return Promise.resolve(event);

    }

    graphQuery() {

        du.debug('Graph Query');

        let graph_resolver = () => {

            return graphql(this.sixSchema, this.query, null, null, this.query_parameters);

        };

        return this.resolveController.resolve(graph_resolver);

    }

    handleGraphErrors(response){

      if(_.has(response, 'errors') && _.isArray(response.errors) && response.errors.length > 0){

        let graph_error = response.errors[0];

        let error_name = graph_error.stack.substring(0, graph_error.stack.indexOf(':'));

        let correct_error = eu.getErrorByName(error_name);

        if(_.isError(correct_error)){

          if(_.has(graph_error, "message")){
            correct_error.message = graph_error.message;
          }

          throw correct_error;

        }

        throw graph_error;

      }

      return response;

    }

}
