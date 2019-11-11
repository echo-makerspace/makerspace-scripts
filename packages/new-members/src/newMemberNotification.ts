const slackWebhook = PropertiesService.getScriptProperties().getProperty("PROD_WEBHOOK");
const channel = PropertiesService.getScriptProperties().getProperty("PROD_CHANNEL");

interface Answers {
  timestamp: Date;
  name: String;
  email: String;
  graduationDate: Date;
  why: String;
}

interface Response {
  authMode: Object;
  values: String[];
  namedValues: [Object];
  range: Object;
  source: Object;
  triggerUid: number;
}

// To activate the script, run `initialize` once in the Script Editor.
function initialize() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });

  ScriptApp.newTrigger("sendToSlack")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();
}

// Get headers that applicant fills in using Google Forms.
function getHeaders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, 5);
  const names = headers.getValues()[0];

  return names;
}

// Create the blocks used in the message sent to Slack, see their API for more documentation.
function constructMessage(answers: Answers) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const url = sheet.getUrl();

  const blocks = [
    {
      type: "section",
      block_id: "newMember",
      text: {
        type: "mrkdwn",
        text: `<!channel> Vi har et nytt medlem! :partyparrot:\n*${answers.name}*`
      }
    },
    {
      type: "section",
      block_id: "about",
      fields: [
        {
          type: "mrkdwn",
          text: `*Dato*\n<!date^${Math.floor(
            answers.timestamp.valueOf() / 1000
          )}^{date}|${answers.timestamp.toISOString()}>`
        },
        {
          type: "mrkdwn",
          text: "*E-post*\n" + answers.email
        }
      ]
    },
    {
      type: "section",
      block_id: "why",
      fields: [
        {
          type: "mrkdwn",
          text: "*Hvorfor vil du være med?:*\n" + answers.why
        }
      ]
    },
    {
      type: "actions",
      block_id: "actions",
      elements: [
        {
          type: "button",
          style: "primary",
          text: {
            type: "plain_text",
            text: "Gå til skjema"
          },
          url: url
        }
      ]
    }
  ];

  return blocks;
}

// Send message to our Slack instance.
function sendToSlack(response: Response) {
  if (slackWebhook === null) {
    return;
  }

  const answers = convertToAnswers(response);
  const message = constructMessage(answers);
  const payload = { text: "Vi har fått et nytt medlem!", blocks: message };
  const options = {
    method: "post",
    payload: JSON.stringify(payload)
  };

  let resp = UrlFetchApp.fetch(slackWebhook, options);
  Logger.log(resp);
}

// Get the answers from the applicant to the form.
function convertToAnswers(response: Response): Answers {
  const answers: Answers = {
    timestamp: convertToDate(response.values[0]),
    email: response.values[1],
    name: response.values[2],
    why: response.values[3],
    graduationDate: convertToDate(response.values[4])
  };

  return answers;
}

// Because fuck date parsing.
function convertToDate(input: String): Date {
  const [date, ,] = input.split(" ");
  const [day, month, year] = date.split(".");

  return new Date(parseInt(year), parseInt(month), parseInt(day));
}
