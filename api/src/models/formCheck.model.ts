import { Schema, Types, model} from 'mongoose';

const FormCheckSchema = new Schema({
    userId:     { type: Types.ObjectId, ref: 'User', required: true},
    videoKey:   { type: String, required: true},
    status:     { type: String, enum: ['processing', 'done', 'failed'], default: 'processing'},
    results:    {
        jointAngles: { type: Schema.Types.Mixed },
        deviations:  { type: Schema.Types.Mixed }
    }
}, {timestamps: true});

export const FormCheck = model('FormCheck', FormCheckSchema)