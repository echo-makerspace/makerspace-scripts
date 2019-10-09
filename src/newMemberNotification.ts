// ///////////////////////
// Begin customization //
// ///////////////////////

// Alter this to match the incoming webhook url provided by Slack
const slackIncomingWebhookUrl = "";

// Include # for public channels, omit it for private channels
const postChannel = "#makerspace-testing";

const postIcon = ":star:";
const postColor = "#0000DD";

const messageFallback = "Nytt medlem!";

// /////////////////////
// End customization //
// /////////////////////

// In the Script Editor, run initialize() at least once to make your code execute on form submit
function initialize() {
  const triggers = ScriptApp.getProjectTriggers();
  for (const i in triggers) {
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

  const aliasAndAttachments = constructAliasAndAttachments(e.values);
  const alias = aliasAndAttachments[0];
  const attachments = aliasAndAttachments[1];

  const payload = {
    channel: postChannel,
    username: alias,
    icon_emoji: postIcon,
    link_names: 1,
    attachments
  };

  const options = {
    method: "post",
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(slackIncomingWebhookUrl, options);
}

// Creates an array containing the submitter's alias and Slack message attachments which
// contain the data from the Google Form submission, which is passed in as a parameter
// https://api.slack.com/docs/message-attachments
var constructAliasAndAttachments = function(values) {
  const aliasAndTsAndFields = makeAliasAndTsAndFields(values);
  const alias = aliasAndTsAndFields[0];
  const timestamp = aliasAndTsAndFields[1];
  const fields = aliasAndTsAndFields[2];

  const messagePretext = "".concat("*[Slackup]*\n", "On ", timestamp, ", *", alias, "* says");

  const attachments = [
    {
      fallback: messageFallback,
      pretext: messagePretext,
      mrkdwn_in: ["pretext"],
      color: postColor,
      fields
    }
  ];

  return [alias, attachments];
};

// Creates an array containing submitter's alias, submission timestamp, and an
// array of Slack fields containing the questions and answers
var makeAliasAndTsAndFields = function(values) {
  const fields = [];
  let alias = "";
  let timestamp = "";

  const columnNames = getColumnNames();

  for (let i = 0; i < columnNames.length; i++) {
    const colName = columnNames[i];
    const val = values[i];

    if (colName == "Timestamp") {
      timestamp = val;
    } else if (colName == "Navn") {
      alias = val;
    } else {
      fields.push(makeField(colName, val));
    }
  }

  return [alias, timestamp, fields];
};

// Creates a Slack field for your message
// https://api.slack.com/docs/message-attachments#fields
var makeField = function(question, answer) {
  const field = {
    title: question,
    value: answer,
    short: false
  };
  return field;
};

// Extracts the column names from the first row of the spreadsheet
var getColumnNames = function() {
  const sheet = SpreadsheetApp.getActiveSheet();

  // Get the header row using A1 notation
  const headerRow = sheet.getRange("1:1");

  // Extract the values from it
  const headerRowValues = headerRow.getValues()[0];

  return headerRowValues;
};
