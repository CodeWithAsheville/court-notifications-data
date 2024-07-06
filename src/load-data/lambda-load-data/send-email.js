const aws = require("aws-sdk");
const ses = new aws.SES({ region: "us-east-1" });

function mapStatusCodeToText(statusCode) {
    switch (statusCode) {
        case 200:
            return 'SUCCESS';
        case 500:
        default:
            return 'FAILED';
    }
}

module.exports = async function sendLoadReportEmail(statusCode, message) {
  const params = {
    Destination: {
      ToAddresses: ["<add-receiving-email>"],
    },
    Message: {
      Body: {
        Text: { Data: message },
        Html: { Data: `<p>${message}</p>`}
      },

      Subject: { Data: `Lambda Load Data Report: ${mapStatusCodeToText(statusCode)} - ${statusCode}` },
    },
    Source: "<add-sending-email>",
  };
 
  return ses.sendEmail(params).promise()
};