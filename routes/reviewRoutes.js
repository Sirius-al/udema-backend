const express = require('express');
const reviewController = require('../controller/reviewController')
const auth = require('../controller/auth')

const router = express.Router({ mergeParams: true })


router.use(auth.protected) //todo All routes are protected after this middleware
router.route('/')
    .get(reviewController.getAllReviews)
    .post(auth.restrictedTo('user'), reviewController.createReview)

router.route('/:id')
    .delete(auth.restrictedTo('user', 'admin'), reviewController.deleteReview)
    .patch(auth.restrictedTo('user', 'admin'), reviewController.updateReview)

module.exports = router