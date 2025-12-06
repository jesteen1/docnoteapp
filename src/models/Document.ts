import mongoose, { Schema, model, models } from 'mongoose';

const DocumentSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
    },
    lessonId: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
    },
    fileData: {
        type: Buffer,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Document = models.Document || model('Document', DocumentSchema);

export default Document;
