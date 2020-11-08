const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//* local modules
const Courses = require('./model/courseModel');
const Learn = require('./model/learnModel');
const Lessons = require('./model/lessonsModel');
const Users = require('./model/userModel');
const Reviews = require('./model/reviewModel');

dotenv.config({
    path: './config.env'
})

const db = process.env.DB.replace('<PASS>', process.env.DB_PASS)

mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('Database connected...'))

const courses = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/courses.json`))
const learn = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/learn.json`))
const lessons = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/lessons.json`))
const users = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/users.json`))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`))

const importData = async () => {
    try {
        await Courses.create(courses)
        await Learn.create(learn)
        await Lessons.create(lessons)
        await Users.create(users, { validateBeforeSave: false })
        await Reviews.create(reviews)
        console.log('Data SuccessFully Uploaded')
    } catch (err) {
        console.log(err)
    }
    process.exit()
};

const DeleteData = async () => {
    try {
        await Courses.deleteMany()
        await Learn.deleteMany()
        await Lessons.deleteMany()
        await Users.deleteMany()
        await Reviews.deleteMany()
        console.log('Data SuccessFully deleted')
    } catch (err) {
        console.log(err);
    }
    process.exit()
}

if (process.argv[2] === '-i') {
    importData()

} else if (process.argv[2] === '-d') {
    DeleteData()
}