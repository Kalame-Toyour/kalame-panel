// Export and import data between production and local databases
// This script provides two main functions:
// 1. Export data from production database to SQL files
// 2. Import data from SQL files to local database

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const PROD_DB_CONFIG = {
  host: 'your-production-host',
  user: 'your-production-user',
  password: 'your-production-password',
  database: 'your-production-database'
};

const LOCAL_DB_CONFIG = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'madrese'
};

// Tables to export/import
const TABLES = [
  'learning__year',
  'learning__field',
  'learning__book',
  'learning__lessons',
  'learning__questions',
  'learning__model_interactions'
];

// Directory to store SQL files
const EXPORT_DIR = path.join(__dirname, 'exported_data');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'export') {
    await exportData();
  } else if (command === 'import') {
    await importData();
  } else {
    console.log('Usage: node export-import-data.js [export|import]');
    process.exit(1);
  }
}

async function exportData() {
  console.log('Starting data export from production database...');
  
  try {
    // Create export directory if it doesn't exist
    await fs.mkdir(EXPORT_DIR, { recursive: true });
    
    // Connect to production database
    const connection = await mysql.createConnection(PROD_DB_CONFIG);
    
    // Export each table
    for (const table of TABLES) {
      console.log(`Exporting table: ${table}`);
      
      // Get table structure
      const [structureRows] = await connection.execute(`SHOW CREATE TABLE ${table}`);
      const createTableSQL = structureRows[0]['Create Table'];
      
      // Get table data
      const [dataRows] = await connection.execute(`SELECT * FROM ${table}`);
      
      // Create SQL file
      const sqlContent = [
        `-- Table structure for ${table}`,
        `DROP TABLE IF EXISTS ${table};`,
        createTableSQL + ';',
        '',
        `-- Data for ${table}`,
        ...dataRows.map(row => {
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "\\'")}'`;
            return val;
          });
          return `INSERT INTO ${table} (${Object.keys(row).join(', ')}) VALUES (${values.join(', ')});`;
        })
      ].join('\n');
      
      // Write to file
      await fs.writeFile(path.join(EXPORT_DIR, `${table}.sql`), sqlContent);
      console.log(`Exported ${dataRows.length} rows from ${table}`);
    }
    
    // Close connection
    await connection.end();
    
    console.log('Data export completed successfully!');
    console.log(`SQL files saved to: ${EXPORT_DIR}`);
  } catch (error) {
    console.error('Error during data export:', error);
    process.exit(1);
  }
}

async function importData() {
  console.log('Starting data import to local database...');
  
  try {
    // Connect to local database
    const connection = await mysql.createConnection(LOCAL_DB_CONFIG);
    
    // Import each table
    for (const table of TABLES) {
      const sqlFile = path.join(EXPORT_DIR, `${table}.sql`);
      
      try {
        // Check if file exists
        await fs.access(sqlFile);
        
        console.log(`Importing table: ${table}`);
        
        // Read SQL file
        const sqlContent = await fs.readFile(sqlFile, 'utf8');
        
        // Split SQL content into statements
        const statements = sqlContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        // Execute each statement
        for (const statement of statements) {
          await connection.execute(statement);
        }
        
        console.log(`Imported data for ${table}`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`No SQL file found for table: ${table}`);
        } else {
          console.error(`Error importing table ${table}:`, error);
        }
      }
    }
    
    // Close connection
    await connection.end();
    
    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error during data import:', error);
    process.exit(1);
  }
}

// Run the script
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 