# Database Migration Scripts

This directory contains scripts to help you migrate data between your production and local databases.

## Available Scripts

### 1. phpMyAdmin Export/Import Guide

The `phpmyadmin-export-import.md` file contains step-by-step instructions for exporting data from your production database and importing it into your local database using phpMyAdmin's interface.

### 2. Direct Database Import Script

The `import-data.js` script connects directly to both your production and local databases and transfers data between them. This is useful when you have direct access to both databases.

To use this script:

1. Update the database connection details in the script
2. Run the script: `node scripts/import-data.js`

### 3. SQL Export/Import Script

The `export-import-data.js` script exports data from your production database to SQL files, then imports those files into your local database. This is useful when you don't have direct access to both databases at the same time.

To use this script:

1. Update the database connection details in the script
2. Export data: `node scripts/export-import-data.js export`
3. Import data: `node scripts/export-import-data.js import`

### 4. Schema Comparison Script

The `compare-schemas.js` script compares the table structures between your production and local databases, helping you identify differences that might cause issues during migration.

To use this script:

1. Update the database connection details in the script
2. Run the script: `node scripts/compare-schemas.js`

## Recommended Workflow

1. First, compare the schemas to understand the differences:
   ```
   node scripts/compare-schemas.js
   ```

2. If the schemas are significantly different, use phpMyAdmin to export/import data manually, following the instructions in `phpmyadmin-export-import.md`

3. If the schemas are similar, use one of the automated scripts:
   ```
   node scripts/export-import-data.js export
   node scripts/export-import-data.js import
   ```

## Troubleshooting

- **Foreign Key Constraints**: Import tables in the correct order (parent tables first, then child tables)
- **Data Type Mismatches**: Ensure the data types match between production and local schemas
- **Missing Fields**: Add default values for required fields that don't exist in the exported data
- **Connection Issues**: Check your database connection details and ensure both databases are accessible 