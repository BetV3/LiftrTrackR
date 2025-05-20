import { Schema, model, Types } from 'mongoose';

const PainEntrySchema = new Schema({
    bodyPart:   { type: String, required: true },
    level:      { type: Number, required: true, min: 0, max: 10},
    notes:      { type: String }
}, {_id: false});

const PainLogSchema = new Schema({
    userId:    { type: Types.ObjectId, ref: 'User', required: true },
    date:      { type: Date, required: true },
    entries:   { type: [PainEntrySchema], default: [] }
  }, { timestamps: true });

export const PainLog = model('PainLog', PainLogSchema);