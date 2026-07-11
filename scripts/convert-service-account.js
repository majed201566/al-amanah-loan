/**
 * Helper to convert service account JSON file to single-line env var format
 * Usage: node scripts/convert-service-account.js path/to/your.json
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2] || 'google-service-account.json';

if (!fs.existsSync(filePath)) {
  console.log(`File not found: ${filePath}`);
  console.log(`Usage: node scripts/convert-service-account.js <path-to-json>`);
  console.log(`\nTrying default locations...`);
  const defaults = [
    'google-service-account.json',
    'service-account.json',
    '/home/user/al-amanah-loan/google-service-account.json',
  ];
  for (const p of defaults) {
    if (fs.existsSync(p)) {
      console.log(`Found: ${p}`);
      convert(p);
      process.exit(0);
    }
  }
  process.exit(1);
}

convert(filePath);

function convert(p) {
  try {
    const content = fs.readFileSync(p, 'utf-8');
    const json = JSON.parse(content);
    
    // Validate required fields
    if (!json.client_email || !json.private_key) {
      console.error('❌ Invalid service account JSON: missing client_email or private_key');
      process.exit(1);
    }

    // Convert to single line
    const singleLine = JSON.stringify(json);
    
    console.log('\n✅ Valid service account file!');
    console.log(`📧 Client Email: ${json.client_email}`);
    console.log(`🆔 Project ID: ${json.project_id}`);
    console.log(`\n--- For Environment Variable (copy this) ---\n`);
    console.log(singleLine);
    console.log(`\n--- Length: ${singleLine.length} chars ---\n`);
    console.log(`Add to Arena as:`);
    console.log(`Name: GOOGLE_SERVICE_ACCOUNT_KEY`);
    console.log(`Value: (paste the line above)\n`);
    
    // Also create .env.local snippet
    const envSnippet = `GOOGLE_SERVICE_ACCOUNT_KEY=${singleLine}\n`;
    fs.writeFileSync('GOOGLE_SERVICE_ACCOUNT_KEY.env.txt', envSnippet);
    console.log(`📄 Also saved to GOOGLE_SERVICE_ACCOUNT_KEY.env.txt for reference (DO NOT COMMIT)\n`);

  } catch (e) {
    console.error(`❌ Error: ${e.message}`);
    process.exit(1);
  }
}
