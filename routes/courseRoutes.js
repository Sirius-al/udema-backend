const express = require('express');
const courseController = require('../controller/courseController')
const reviewRouter = require('./reviewRoutes');
const auth = require('../controller/auth')

//* models
const Course = require('./../model/courseModel')
const Learn = require('./../model/learnModel')
const Lesson = require('./../model/lessonsModel')


const router = express.Router()

//
router.use('/:courseId/reviews', reviewRouter)

//

router.route('/top-best-courses/')
    .get(courseController.aliasTopCourses, courseController.getAllCourses)

router.route('/courses-stats-by/:id?')
    .get(courseController.AllCoursesStats)


router.route('/')
    .get(courseController.getAllCourses)
    .post(auth.protected, auth.restrictedTo('admin', 'publisher'), courseController.createCourse)

router.route('/lessons')
    .post(auth.protected, auth.restrictedTo('admin', 'publisher'), auth.belongingTo, courseController.createLessons)

router.route('/lessons/:id')
    .post(auth.protected, auth.restrictedTo('admin', 'publisher'), auth.ifCreatedBy(Lesson), courseController.updateLessons)

router.route('/learns/:id')
    .patch(auth.protected, auth.restrictedTo('admin', 'publisher'), auth.ifCreatedBy(Learn), courseController.updateLearningCurve)

router.route('/learns')
    // .get(courseController.getAllLearns)
    .post(auth.protected, auth.restrictedTo('admin', 'publisher'), auth.belongingTo, courseController.createLearningCurve)
    
router.route('/:id')
    .get(courseController.getCourse)
    .patch(auth.protected, auth.restrictedTo('admin', 'publisher'), auth.ifCreatedBy(Course), courseController.updateCourse)
    .delete(auth.protected, auth.restrictedTo('admin', 'publisher'), auth.ifCreatedBy(Course), courseController.deleteCourse)



module.exports = router;