// This Google Sheets script will post to a slack channel when a user submits data to a Google Forms Spreadsheet
// View the README for installation instructions. Don't forget to add the required slack information below.

// Source: https://github.com/markfguerra/google-forms-to-slack

/////////////////////////
// Begin customization //
/////////////////////////

// Alter this to match the incoming webhook url provided by Slack
var slackIncomingWebhookUrl = "https://hooks.slack.com/services/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";

// Include # for public channels, omit it for private channels
var postChannel = "#makerspace-styret";

var postIcon = ":star:";
var postColor = "#0000DD";

var messageFallback = "Nytt medlem!";

///////////////////////
// End customization //
///////////////////////

// In the Script Editor, run initialize() at least once to make your code execute on form submit
function initialize() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i in triggers) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger("submitValuesToSlack")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();
}

// Running the code in initialize() will cause this function to be triggered this on every Form Submit
function submitValuesToSlack(e) {
  // Test code. uncomment to debug in Google Script editor
  // if (typeof e === "undefined") {
  //   e = {namedValues: {"Question1": ["answer1"], "Question2" : ["answer2"]}};
  //   messagePretext = "Debugging our Sheets to Slack integration";
  // }

  var aliasAndAttachments = constructAliasAndAttachments(e.values);
  var alias = aliasAndAttachments[0];
  var attachments = aliasAndAttachments[1];

  var payload = {
    channel: postChannel,
    username: alias,
    icon_emoji: postIcon,
    link_names: 1,
    attachments: attachments
  };

  var options = {
    method: "post",
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(slackIncomingWebhookUrl, options);
}

// Creates an array containing the submitter's alias and Slack message attachments which
// contain the data from the Google Form submission, which is passed in as a parameter
// https://api.slack.com/docs/message-attachments
var constructAliasAndAttachments = function(values) {
  var aliasAndTsAndFields = makeAliasAndTsAndFields(values);
  var alias = aliasAndTsAndFields[0];
  var timestamp = aliasAndTsAndFields[1];
  var fields = aliasAndTsAndFields[2];

  var messagePretext = "".concat("*[Slackup]*\n", "On ", timestamp, ", *", alias, "* says");

  var attachments = [
    {
      fallback: messageFallback,
      pretext: messagePretext,
      mrkdwn_in: ["pretext"],
      color: postColor,
      fields: fields
    }
  ];

  return [alias, attachments];
};

// Creates an array containing submitter's alias, submission timestamp, and an
// array of Slack fields containing the questions and answers
var makeAliasAndTsAndFields = function(values) {
  var fields = [];
  var alias = "";
  var timestamp = "";

  var columnNames = getColumnNames();

  for (var i = 0; i < columnNames.length; i++) {
    var colName = columnNames[i];
    var val = values[i];

    if (colName == "Timestamp") {
      timestamp = val;
    } else if (colName == "Email Address") {
      alias = val.substring(0, val.lastIndexOf("@") + 1);
    } else {
      fields.push(makeField(colName, val));
    }
  }

  return [alias, timestamp, fields];
};

// Creates a Slack field for your message
// https://api.slack.com/docs/message-attachments#fields
var makeField = function(question, answer) {
  var field = {
    title: question,
    value: answer,
    short: false
  };
  return field;
};

// Extracts the column names from the first row of the spreadsheet
var getColumnNames = function() {
  var sheet = SpreadsheetApp.getActiveSheet();

  // Get the header row using A1 notation
  var headerRow = sheet.getRange("1:1");

  // Extract the values from it
  var headerRowValues = headerRow.getValues()[0];

  return headerRowValues;
};
