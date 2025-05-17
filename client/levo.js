#!/usr/bin/env node
const { Command } = require('commander');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const dotenv = require('dotenv');
dotenv.config();
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/schemas';
const program = new Command();

program
  .command('import')
  .requiredOption('-s, --spec <path>', 'Path to the schema file')
  .requiredOption('-a, --application <name>', 'Name of the application')
  .option('-S, --service [name]', 'Name of the service')
  .description('Import schema from a file')
  .action(async (options) => {
    console.log('Importing schema...');
    const { spec, application, service } = options;
    console.log(`Uploading schema from ${spec} for application ${application}${service ? ` and service ${service}` : ''}`);

    try {
      const fileBuffer = fs.readFileSync(spec);
      const formData = new FormData();
      formData.append('application', application);
      if (service) {
        formData.append('service', service);
      }
      formData.append('spec', fileBuffer, spec);

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      if (response.status === 201) {
        console.log(`Schema uploaded successfully. Version: ${response.data.version}, ID: ${response.data.id}`);
      } 
    } catch (error) {
      console.error('Error uploading schema:', error.message);
    }
  });

program
  .command('get-latest')
  .requiredOption('-a, --application <name>', 'Name of the application')
  .option('-S, --service [name]', 'Name of the service')
  .description('Get the latest schema for an application/service')
  .action(async (options) => {
    console.log('Getting latest schema...');
    const { application, service } = options;
    console.log(`Fetching latest schema for application ${application}${service ? ` and service ${service}` : ''}`);

    try {
      const response = await axios.post(`${API_BASE_URL}/application`, {
        application,
        service,
      });

      if (response.status === 200) {
        console.log(`Latest schema version: ${response.data.version}`);
        console.log('Schema spec:', response.data.spec);
      } 
    } catch (error) {
      console.error('Error fetching latest schema:', error?.response?.data);
    }
  });

program
  .command('get-schema-by-version')
  .requiredOption('-a, --application <name>', 'Name of the application')
  .requiredOption('-v, --version <number>', 'Version of the schema')
  .option('-S, --service [name]', 'Name of the service')
  .description('Get a specific version of the schema for an application/service')
  .action(async (options) => {
    console.log('Getting schema by version...');
    const { application, version, service } = options;
    console.log(`Fetching schema for application ${application}, version ${version}${service ? ` and service ${service}` : ''}`);

    try {
      const response = await axios.post(`${API_BASE_URL}/application/version`, {
        application,
        version,
        service,
      });

      if (response.status === 200) {
        console.log(`Schema version: ${response.data.version}`);
        console.log('Schema spec:', response.data.spec);
      } 
    } catch (error) {
      console.error('Error fetching latest schema:', error?.response?.data);
    }
  });

program.parse();