import mongoose, { Schema, model, models } from 'mongoose';

const SubjectSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Subject name is required'],
        unique: true,
    },
    description: {
        type: String,
    },
}, { timestamps: true });

const Subject = models.Subject || model('Subject', SubjectSchema);

export default Subject;
