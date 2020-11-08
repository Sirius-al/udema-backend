const Course = require('./../model/courseModel')
const Lessons = require('./../model/lessonsModel')
const Learn = require('./../model/learnModel')
// const ApiFeatures = require('./../utils/ApiFeatures')
const errorHandler = require('./../utils/errorHandler')
const factory = require('./factoryHandler')


exports.aliasTopCourses = async (req, res, next) => {
    if (req.params.courseCatagory) {
        console.log(req.params.courseCatagory);
    }
    req.query.limit = '5'
    req.query.sort = '-price,ratingsAverage';
    req.query.fields = 'name, description, price, ratingsQuantity, level';
    next()
}




exports.getAllCourses = factory.getAll(Course)

exports.getCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id).populate('lessons').populate({
            path: 'reviews',
            select: '-course review rating'
        }).populate('learn').populate({ path: 'teachers', select: 'name photo'})

        res.status(200).json({
            success: true,
            data: {
                course
            }
        })
    } catch (err) {
        next(err)
    }
}


exports.createCourse = async (req, res, next) => {
    try {
        const course = await Course.create({
            name : req.body.name,
            description : req.body.description,
            duration : req.body.duration,
            coverImage : req.body.coverImage,
            catagory : req.body.catagory,
            website : req.body.website,
            email : req.body.email,
            address : req.body.address,
            level : req.body.level,
            requirements : req.body.requirements,
            teachers : req.body.teachers,
            price : req.body.price,
            discountPerc : req.body.discountPerc,
            boxDetail : req.body.boxDetail,
            createdBy : req.user._id
        })
        

        res.status(200).json({
            success: true,
            data: {
                course
            }
        })
    } catch (err) {
        next(err)
    }
}

exports.createLessons = async (req, res, next) => {
    try {
        const lessons = await Lessons.create({
            course: req.body.course,
            video: req.body.video,
            createdBy : req.user._id
        })

        res.status(200).json({
            success: true,
            data: {
                lessons
            }
        })
    } catch (err) {
        next(err)
    }
}
exports.updateLessons = async (req, res, next) => {

    const lessons = await Lessons.findByIdAndUpdate(req.params.id, {
        video: req.body.video}, {new: true, runValidators: false})

    res.status(200).json({
        success: true,
        data: {
            lesson: lessons
        }
    })

}

exports.createLearningCurve = async (req, res, next) => {
    try {
        const learning_curve = await Learn.create({
            title: req.body.title,
            description: req.body.description,
            course: req.body.course,
            createdBy: req.user.id
            })

        res.status(200).json({
            success: true,
            data: {
                learning_curve
            }
        })
    } catch (err) {
        next(err)
    }
}

exports.updateLearningCurve = async (req, res, next) => {
    try {
        

        const learning_curve = await Learn.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            description: req.body.description}, {

            new: true,
            runValidators: false
        })

        res.status(200).json({
            success: true,
            data: {
                learn: learning_curve
            }
        })
    } catch (err) {
        next(err)
    }
}

exports.getAllLearns = async (req, res, next) => {
    try {
        const learns = await Learn.find()

        res.status(200).json({
            success: true,
            total: learns.length,
            data: {
                learns
            }
        })
    } catch (err) {
        next(err)
    }
}




exports.updateCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            success: true,
            data: {
                course
            }
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return next(new errorHandler(`No course found with this Id: ${req.params.id}`, 404))
        }

        await Learn.deleteMany({course: req.params.id})
        await Lessons.deleteMany({course: req.params.id})
        
        res.status(204).json({
            success: true,
            data: null
        })
    } catch (err) {
        next(err)
    }
}

exports.AllCoursesStats = async (req, res) => {
    try {
        let stuff;
        if (req.params.id) {
            stuff = req.params.id;
        } else {
            stuff = 'level'
        }

        const stats = await Course.aggregate([{
                $match: {
                    ratingsAverage: {
                        $gte: 4
                    }
                }
            },
            {
                $group: {
                    _id: `$${stuff}`,
                    Total_Courses: {
                        $sum: 1
                    },
                    Course_names: {
                        $push: '$name'
                    },
                    Course_ids: {
                        $push: `$_id`
                    },
                    AvgRatings: {
                        $avg: '$ratingsAverage'
                    },
                    AvgPrice: {
                        $avg: '$price'
                    },
                    minPrice: {
                        $min: '$price'
                    },
                    maxPrice: {
                        $max: '$price'
                    }
                }
            }

        ])
        res.status(200).json({
            success: true,
            data: stats
        })
    } catch (err) {
        next(err)
    }
}