import mongoose from 'mongoose';
const { Schema } = mongoose;

const schema = new Schema({
    applicationName: String,
    serviceName: { 
        type: String,
        default: null
    },
    version: Number,
    spec: String,
    format: String, 
    uploadTimestamp: Date
});

export default mongoose.model('Schema', schema);