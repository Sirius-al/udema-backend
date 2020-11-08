const mongoose = require('mongoose');
// const Course = require('./courseModel')

const LessonSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'course',
        required: [true, 'Please provide the id for the course which it belongs to!!']
    },
    video: {
        type: Array,
        required: [true, 'Please provide video link and label for the video'],
        video: String,
        video_Name: String
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        select: false
    }

}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})


const Lesson = mongoose.model('lesson', LessonSchema);

module.exports = Lesson;