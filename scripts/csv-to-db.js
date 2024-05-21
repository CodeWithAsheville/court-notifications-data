const AWS = require('aws-sdk');
const pg = require('pg');
const csv = require('csv-parser');
const { S3 } = AWS;

// Initialize S3 client
const s3 = new S3();

// Database connection configuration
const { DATABASE_URL } = process.env;

// PostgreSQL client setup
const client = new pg.Client(DATABASE_URL);
client.connect();

// Function to process CSV data
async function processCSV(objectData) {
  const results = [];

  return new Promise((resolve, reject) => {
    objectData
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => reject(err));
  });
}

// Lambda handler
exports.handler = async (event) => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    // Get CSV file from S3
    const params = { Bucket: bucket, Key: key };
    const data = s3.getObject(params).createReadStream();

    // Process CSV
    const records = await processCSV(data);

    // Insert or update records in the database
    for (let record of records) {
      const query = `
        INSERT INTO cases (first_name, middle_name, last_name, suffix, birth_date, case_number, court_date, court, room, session)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (case_number)
        DO UPDATE SET
          first_name = EXCLUDED.first_name,
          middle_name = EXCLUDED.middle_name,
          last_name = EXCLUDED.last_name,
          suffix = EXCLUDED.suffix,
          birth_date = EXCLUDED.birth_date,
          court_date = EXCLUDED.court_date,
          court = EXCLUDED.court,
          room = EXCLUDED.room,
          session = EXCLUDED.session
      `;

      const values = [
        record.first_name,
        record.middle_name,
        record.last_name,
        record.suffix,
        record.birth_date,
        record.case_number,
        record.court_date,
        record.court,
        record.room,
        record.session
      ];

      await client.query(query, values);
    }
  } catch (err) {
    console.error('Error:', err);
    throw err;
  } finally {
    client.end();
  }
};
