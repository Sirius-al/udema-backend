const mongoose = require('mongoose');
const Course = require('./courseModel')

const ReviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Please provide us with a review for the course']
    },
   rating: {
       type: Number,
       max: [5, 'rating cannot be greater than 5'],
       min: [1, 'rating has to be at-least 1 or greater'],
       required: [true, 'Please provide us with a rating number for the review']
   },
   user: {
       type: mongoose.Schema.ObjectId,
       ref: 'user'
   },
   course: {
       type: mongoose.Schema.ObjectId,
       ref: 'course',
       required: [true, 'The review must belong to a Course']
    },
   createdAt: {
       type: Date,
       default: Date.now()
    }

    }, 
    {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    })



ReviewSchema.index({course: 1, user: 1}, {unique: true})

//? Document middleware
ReviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })/* .populate({
        path: 'course',
        select: '-lessons name'//coverImage description catagory price
    }) */

    next()
})


ReviewSchema.statics.calcAvgRatings = async function (courseId) {
    const stats = await this.aggregate([
        {
            $match: {course: courseId}
        },
        {
            $group: {
                _id: '$course',
                numRatings: { $sum: 1 },
                AvgRatings: { $avg: '$rating' }
            }
        }
    ])

    // console.log(stats)

    if (stats.length > 0) {
            await Course.findByIdAndUpdate(courseId, {
            ratingsAverage: stats[0].AvgRatings,
            ratingsQuantity: stats[0].numRatings
        })
    } else {
        await Course.findByIdAndUpdate(courseId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        })
    }
}

ReviewSchema.post('save', function () {
    
    this.constructor.calcAvgRatings(this.course)
})

/*//* this is a very tricky part to updated review's rating (Jonas -> 11.23) */
ReviewSchema.pre(/^findOneAnd/, async function (next) {
    this.rev = await this.findOne()
    // console.log(this.rev)
    next()
})
ReviewSchema.post(/^findOneAnd/, async function () {

   await this.rev.constructor.calcAvgRatings(this.rev.course)
})
/*//* we used this 2 step process cuz if we have used calcAvgRatings() on the pre middleware the the updated doc wouldn't have been calculated that's why we passed the rev doc from pre to post via saving it on the doc as (rev)*/

const review = mongoose.model('review', ReviewSchema)
module.exports = review;