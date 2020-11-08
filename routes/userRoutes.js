const express = require('express');
const userController = require('../controller/userController')
const auth = require('../controller/auth')


const router = express.Router()


router.post('/sign-up', auth.signUp)
router.post('/log-in', auth.login)

router.post('/forgot-password', auth.forgotPassword)
router.patch('/reset-password/:token', auth.resetPassword)


router.use(auth.protected) //! All routes are protected after this middleware
router.get('/test', auth.restrict) //* testing route

router.patch('/update-my-password',auth.updatePassword)
router.patch('/update-me',userController.updateMyData)

router.get('/myself',userController.getme)

router.delete('/delete-me',userController.deleteMe)

router.route('/')
    .get(auth.restrictGettingAllUsersData, userController.getAllUsers)
    // .post(userController.createUser)

router.route('/:id')
    .get(auth.restrictedTo('admin', 'subAdmin', 'publisher'), auth.restrict, userController.getUser)
    .patch(auth.restrictedTo('admin'), userController.updateUser)
    .delete(auth.restrictedTo('admin'), userController.deleteUser)



module.exports = router;