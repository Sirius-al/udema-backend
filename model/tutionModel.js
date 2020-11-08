const mongoose = require('mongoose');

const TutionSchema = new mongoose.Schema({



}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})


const Tution = mongoose.model('tution', TutionSchema);

module.exports = Tution;