const mongoose = require('mongoose');
const slugify = require('slugify');

// const Lessons = require('./lessonsModel');

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A course must have a name'],
        unique: true,
        trim: true
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'A course must have a Description'],
        trim: true
    },
    duration: {
        type: Number,
    },
    coverImage: {
        type: String,
        required: [true, 'Please provide an Cover Image for your Course']

    },
    catagory: {
        type: String,
        required: [true, 'A course must have a Catagory to fit into'],
        enum: {
            values: ['programming', 'marketing', 'writing', 'seo'],
            message: `A course Catagory must fit in between programming/ marketing/ writing/ seo`
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        max: [5, 'A course\'s rating has to be less than or equal 5'],
        min: [1, 'A course\'s rating has to be more than or equal 1'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },

    website: {
        type: String,
        trim: true,
        default: 'http://siriusal.dev'
    },
    email: {
        type: String,
        required: [true, 'Please provide Your Email address']
    },
    address: {
        type: String,
        default: 'Not yet defined'
    },
    /* learnWhat: {
        type: Array,
        title: String,
        description: String

    }, */
    /* lessons: {
        
    }, */
    level: {
        type: [String],
        required: [true, 'A course must have level for students between "beginners", "intermediate", "advanced"'],
        enum: {
            values: ["beginners", "intermediate", "advanced"],
            message: 'levels must be in between beginners, intermediate, advanced'
        }
    },
    requirements: [String],
    boxDetail: String,
    teachers: [        
        {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
        }
    ],
    price: {
        type: Number,
        required: [true, 'A Course must have a price'],
        min: 10,
    },
    discountPerc: {
        type: Number,
        default: 0
    },
    timesSold: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        select: false
    },
    CreatedAt: {
        type: Date,
        Default: Date.now(),
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

CourseSchema.index({catagory: 1, ratingsAverage: 1}) 
CourseSchema.index({slug: 1}) 


CourseSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true
    })
    next()
})

CourseSchema.pre(/^create/, function (next) {
    this.createdBy = req.user._id
    
    next()
})
CourseSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'learn',
        select: '-_id -__v'
    }).populate({
        path: 'lessons',
        select: '-_id -__v'
    })
    next()
})

//? Virtual populate
CourseSchema.virtual('learn', {
    ref: 'learn',
    foreignField: 'course',
    localField: '_id'
})

CourseSchema.virtual('lessons', {
    ref: 'lesson',
    foreignField: 'course',
    localField: '_id'
})

CourseSchema.virtual('reviews', {
    ref: 'review',
    foreignField: 'course',
    localField: '_id'
})




const course = mongoose.model('course', CourseSchema);

module.exports = course;