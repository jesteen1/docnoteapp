import mongoose, { Schema, model, models } from 'mongoose';

const LessonSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Lesson title is required'],
    },
    description: {
        type: String,
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
    },
}, { timestamps: true });

const Lesson = models.Lesson || model('Lesson', LessonSchema);

export default Lesson;
