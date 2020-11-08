const Review = require('./../model/reviewModel')
const errorHandler = require('./../utils/errorHandler')
const factory = require('./factoryHandler')


exports.getAllReviews = factory.getAll(Review)

exports.createReview = async (req, res, next) => {

    try {
      const review = await Review.create({
        review: req.body.review,
        rating: req.body.rating,
        course: req.params.courseId,
        user: req.user._id

    })
    res.status(200).json({
        success: true,
        data: {
            review
        }
    })

    } catch (err) {
      next(err)
    }
}

exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return next(new errorHandler(`No review found with this Id: ${req.params.id}`, 404))
        }

        res.status(204).json({
            success: true,
            data: null
        })
    } catch (err) {
        next(err)
    }
}


exports.updateReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        if (!review) {
            return next(new errorHandler(`No review found with this Id: ${req.params.id}`, 404))
        }
        res.status(200).json({
            success: true,
            data: {
                review
            }
        })
    } catch (err) {
        next(err)
    }
}