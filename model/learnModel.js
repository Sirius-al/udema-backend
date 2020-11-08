const mongoose = require('mongoose');

const LearnSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A course must describe what students will learn "TITLE"']
    },
    description: {
        type: String,
        required: [true, 'A course must describe what students will learn "DESCRIPTION"']
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'course',
        required: [true, 'this learn part must belong to a course']
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

const learn = mongoose.model('learn', LearnSchema)
module.exports = learn

