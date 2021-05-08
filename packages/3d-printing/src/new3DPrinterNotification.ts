const slackWebhook = PropertiesService.getScriptProperties().getProperty("PROD_WEBHOOK");
const channel = PropertiesService.getScriptProperties().getProperty("PROD_CHANNEL");
const url = PropertiesService.getScriptProperties().getProperty("MAIN_SHEET_URL");

interface Answers {
  timestamp: Date;
  name: string;
  email: string;
}

interface Response {
  authMode: Object;
  values: string[];
  namedValues: [Object];
  range: Object;
  source: Object;
  triggerUid: number;
}

// To activate the script, run `initialize` once in the Script Editor.
function initialize() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((trigger) => {
    ScriptApp.deleteTrigger(trigger);
  });

  ScriptApp.newTrigger("sendToSlack").forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onFormSubmit().create();
}

// Get headers that applicant fills in using Google Forms.
function getHeaders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, 3);
  return headers.getValues()[0];
}

// Create the blocks used in the message sent to Slack, see their API for more documentation.
function constructMessage(answers: Answers) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const secondaryURL = sheet.getUrl();

  return [
    {
      type: "section",
      block_id: "newMember",
      text: {
        type: "mrkdwn",
        text: `<!channel> Noen vil ha 3D-printerkurs! :partyparrot:\n*${answers.name}*`,
      },
    },
    {
      type: "section",
      block_id: "about",
      fields: [
        {
          type: "mrkdwn",
          text: `*Dato*\n<!date^${Math.floor(
            answers.timestamp.valueOf() / 1000,
          )}^{date}|${answers.timestamp.toISOString()}>`,
        },
        {
          type: "mrkdwn",
          text: "*E-post*\n" + answers.email,
        },
      ],
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
            text: "Gå til 3D-skjema",
          },
          url: secondaryURL,
        },
        {
          type: "button",
          style: "primary",
          text: {
            type: "plain_text",
            text: "Gå til hovedskjema",
          },
          url: url,
        },
      ],
    },
  ];
}

// Send message to our Slack instance.
function sendToSlack(response: Response) {
  if (slackWebhook === null) {
    return;
  }

  const answers = convertToAnswers(response);
  const message = constructMessage(answers);
  const payload = { text: "Medlem søker 3D-printer kurs!", blocks: message };
  const options = {
    method: "post",
    payload: JSON.stringify(payload),
  };

  const resp = UrlFetchApp.fetch(slackWebhook, options);
  Logger.log(resp);
}

// Get the answers from the applicant to the form.
function convertToAnswers(response: Response): Answers {
  return {
    timestamp: convertToDate(response.values[0]),
    email: response.values[1],
    name: response.values[2],
  };
}

// Because fuck date parsing.
function convertToDate(input: string): Date {
  const [date, ,] = input.split(" ");
  const [day, month, year] = date.split(".");

  return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));
}
