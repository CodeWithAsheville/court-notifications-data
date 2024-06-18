const pg = require('pg');

const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const s3Client = new S3Client({});
const region = 'us-east-1';
let secret;

async function getConnection(secretName) {
    const client = new SecretsManagerClient({
      region
    });
  
    let response;
    try {
      response = await client.send(
        new GetSecretValueCommand({
          SecretId: secretName,
          VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
      );
      console.log('Result from secret get is console.log(response.SecretString)')
    } catch (error) {
      console.log(error);
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      throw error;
    }
    console.log(response.SecretString)
    return JSON.parse(response.SecretString);
}

function parseLine(line) {
    const date = `${line.substring(33,37)}-${line.substring(37,39)}-${line.substring(39,41)}`;
    return {
        case_number: line.substring(1,14).trim(),
        case_type: line.substring(17,19).trim(),
        citation_number: line.substring(22,30).trim(),
        calendar_date: date,
        calendar_session: line.substring(44,46).trim(),
        courtroom: line.substring(49, 53).trim(),
        defendant_name: line.substring(56,84).trim(),
        defendant_race: line.substring(98,99).trim(),
        defendant_sex: line.substring(102,103).trim(),
        offence_code: line.substring(106,110).trim(),
        offense_description: line.substring(113,141).trim(),
        officer_witness_type: line.substring(144,145).trim(),
        officer_agency: line.substring(148,178).trim(),
        officer_number: line.substring(181,187).trim(),
        officer_name: line.substring(190,218).trim(),
        officer_city: line.substring(221,266).trim(),
        court_type: line.substring(269,270).trim(),
        ethnicity: line.substring(273, 274).trim(),
    };
}

const query = `
    INSERT INTO ct.criminal_dates (case_number, case_type, citation_number, calendar_date, calendar_session, 
    defendant_name, defendant_race, defendant_sex, offense_code, offense_description, officer_witness_type, 
    officer_agency, officer_number, officer_name, officer_city, court_type, ethnicity)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    ON CONFLICT (case_number)
    DO UPDATE SET
    case_type = EXCLUDED.case_type,
    citation_number = EXCLUDED.citation_number,
    calendar_date = EXCLUDED.calendar_date, 
    calendar_session = EXCLUDED.calendar_session, 
    defendant_name = EXCLUDED.defendant_name, 
    defendant_race = EXCLUDED.defendant_race, 
    defendant_sex = EXCLUDED.defendant_sex, 
    offense_code = EXCLUDED.offense_code, 
    offense_description = EXCLUDED.offense_description, 
    officer_witness_type = EXCLUDED.officer_witness_type, 
    officer_agency = EXCLUDED.officer_agency, 
    officer_number = EXCLUDED.officer_number, 
    officer_name = EXCLUDED.officer_name, 
    officer_city = EXCLUDED.officer_city, 
    court_type = EXCLUDED.court_type, 
    ethnicity = EXCLUDED.ethnicity
`;

exports.lambda_handler = async function x(event, context) {
    let message = 'Data loaded successfully';
    let statusCode = 200;
    let lines = [];
    let pgClient = null;
    console.log('Bucket name: ', event.Records[0].s3.bucket.name);
    console.log('Object key:  ', event.Records[0].s3.object.key);
    const command = new GetObjectCommand({
      Bucket: event.Records[0].s3.bucket.name,
      Key: event.Records[0].s3.object.key,
    });
  
    try {
        const response = await s3Client.send(command);
        const str = await response.Body.transformToString('UTF-16LE');
        lines = str.split('\n');
    } catch (err) {
        message = 'Error getting court dates file from S3: ' + err;
        statusCode = 500;
        console.error(message);
        return {
            statusCode: statusCode,
            body: message,
        }    
    }

    try {
        const connection = await getConnection('court-texts-database');
        console.log('Connection is ', connection);
        const config = {
            host: connection.host,
            port: connection.port,
            user: connection.username,
            password: connection.password,
            database: connection.database,
            max: 10,
            idleTimeoutMillis: 10000,
          };
        console.log('Config is ', config);
        console.log('Now create the client');
        pgClient = new pg.Client(config);
    } catch (err) {
        message = 'Error connecting to the database: ' + err;
        statusCode = 500;
        console.error(message);
        return {
            statusCode: statusCode,
            body: message,
        }    
    }

    try {
        // PostgreSQL client setup
        pgClient.connect();

        for (let i = 1; i < lines.length; i += 1) {
            const record = parseLine(lines[i]);
            if (record.case_number.length > 0) {
                const values = [
                    record.case_number,
                    record.case_type,
                    record.citation_number,
                    record.calendar_date,
                    record.calendar_session,
                    record.defendant_name,
                    record.defendant_race,
                    record.defendant_sex,
                    record.offense_code,
                    record.offense_description,
                    record.officer_witness_type,
                    record.officer_agency,
                    record.officer_number,
                    record.officer_name,
                    record.officer_city,
                    record.court_type,
                    record.ethnicity,
                ];
                await pgClient.query(query, values);
            }
        }
        pgClient.end();
    } catch (err) {
        message = 'Error loading to the database: ' + err;
        statusCode = 500;
        console.error(message);
    }
    finally {
        pgClient.end();
    }
    return {
        statusCode: statusCode,
        body: message,
    }    
  };
