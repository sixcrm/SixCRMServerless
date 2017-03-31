function execute(user, context, callback) {
  // short-circuit if the user signed up already
  //if (context.stats.loginsCount > 1) return callback(null, user, context);

  // get your slack's hook url from: https://slack.com/services/10525858050
  var SLACK_HOOK = 'https://hooks.slack.com/services/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';

  var slack = require('slack-notify')(SLACK_HOOK);
  var message = 'New Login: ' + (user.name || user.email) + ' (' + user.email + ')';
  var channel = '#adminsixcrmdotcom';

  slack.success({
   text: message,
   channel: channel
  });

  // don’t wait for the Slack API call to finish, return right away (the request will continue on the sandbox)`
  callback(null, user, context);
}
