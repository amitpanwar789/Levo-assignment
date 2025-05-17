import express from 'express';
import { uploadSchema, getLatestSchemaByApplication, getSchemaByApplicationAndVersion } from '../controllers/schemaController.js';
import multer from 'multer';
const router = express.Router();


// Storing file in memory
const upload = multer({ storage: multer.memoryStorage() }); 


router.post('/upload', upload.single('spec'), uploadSchema);


router.post('/application', getLatestSchemaByApplication);


router.post('/application/version', getSchemaByApplicationAndVersion);


export default router;