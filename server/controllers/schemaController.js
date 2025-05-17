import YAML from 'yamljs';
import SchemaModal from '../modals/schemaModal.js';
import validator from 'oas-validator';


// utility function to check is application name is valid
const checkAppName = (appName,res) => {
  if (!appName || typeof appName !== 'string' || appName.trim().length === 0) {
    return res.status(400).json({ error: 'Application name is required and must be a non-empty string' });
  }
}

// Controller to upload OpenApi Spec
const uploadSchema = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No spec file given' });
    }
    const appName = req.body.application;
    checkAppName(appName,res)
    const serviceName = req.body.service || null;
    const fileMimetype = req.file.mimetype;
    let specContentString = req.file.buffer.toString('utf8');
    let fileType = null;
    let specData;

    try {
      // check file type and parse it
      if (fileMimetype === 'application/json') {
        specData = JSON.parse(specContentString);
        fileType = 'json';
      } else if (fileMimetype === 'application/x-yaml' || fileMimetype === 'text/yaml') {
        specData = YAML.parse(specContentString);
        fileType = 'yaml';
      } else {
        return res.status(400).json({ error: 'Unsupported file type. Only JSON and YAML are allowed.' });
      }

      // validate openapi spec file
      validator.validate(specData, {}).catch((error) => {
        console.error('OpenAPI specification validation error:', error);
        return res.status(400).json({ error: 'Invalid OpenAPI specification format' });
      });

    } catch (error) {
      return res.status(400).json({ error: `Failed to parse schema file, Check the schema syntax.` });
    }

    const latestSchema = await SchemaModal.findOne(
      { applicationName: appName, serviceName: serviceName },
      { version: 1 }, { sort: { version: -1 } }
    );

    const nextVersion = latestSchema ? latestSchema.version + 1 : 0;
    const uploadTimestamp = new Date();

    const result = await SchemaModal.create({
      applicationName: appName,
      serviceName: serviceName,
      version: nextVersion,
      spec: specContentString,
      format: fileType,
      uploadTimestamp: uploadTimestamp,
    });

    res.status(201).json({ message: 'Schema uploaded successfully', version: nextVersion, id: result._id });
  } catch (error) {
    console.error('Error uploading schema:', error);
    res.status(500).json({ error: 'Failed to upload schema' });
  }
};

// controller to get latestSchema support with service name also
const getLatestSchemaByApplication = async (req, res) => {
  try {
    const appName = req.body.application;
    checkAppName(appName,res)
    const service = req.body.service||null;
    const latestSchema = await SchemaModal.findOne(
      { applicationName: appName, serviceName: service },
      {}, { sort: { version: -1 } }
    );
    if (!latestSchema) {
      return res.status(404).json({ error: 'No schema found for the given application' });
    }
    res.status(200).json({ version: latestSchema.version, spec: latestSchema.spec });
  } catch (error) {
    console.error('Error getting latest schema:', error);
    res.status(500).json({ error: 'Failed to get latest schema' });
  }
}

// controller to get schema of particular version support with service name also
const getSchemaByApplicationAndVersion = async (req, res) => {
  try {
    const appName = req.body.application;
    checkAppName(appName,res)
    const version = req.body.version;
    if (!version) {
      return res.status(400).json({ error: 'Version is required and must be a number' });
    }
    const service = req.body.service||null;
    const schema = await SchemaModal.findOne(
      { applicationName: appName, version: version, serviceName: service },
      {}, { sort: { version: -1 } }
    );
    if (!schema) {
      return res.status(404).json({ error: 'No schema found for the given application and version' });
    }
    res.status(200).json({ version: schema.version, spec: schema.spec });
  } catch (error) {
    console.error('Error getting schema by application and version:', error);
    res.status(500).json({ error: 'Failed to get schema by version' });
  }
}


export { uploadSchema, getLatestSchemaByApplication, getSchemaByApplicationAndVersion };