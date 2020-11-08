const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../model/userModel');
const errorHandler = require('./../utils/errorHandler');
const sendEmail = require('./../utils/email');

//* models
const Course = require('./../model/courseModel');

//? local function
const signToken = (id) => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXP_TIME
    })
};

const createAndSignToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXP_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true
    }
    res.cookie('jwt', token, cookieOptions)

    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        data: {
            user
        }
    })
}

const response = (res, statusCode, model) => {

    res.status(statusCode).json({
        success: true,
        results: users.length,
        data: {
            model
        }
    })
}


exports.signUp = async (req, res, next) => {
    try {
        if (req.body.role === 'admin' || req.body.role === 'subAdmin') {
            return next(new errorHandler('Unauthorized role', 406))
        }
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email, 
            password: req.body.password,
            photo: req.body.photo,
            role: req.body.role,
            ConfirmPassword: req.body.ConfirmPassword
        });

        createAndSignToken(newUser, 201, res)
    } catch (err) {
        next(err)
    }
}

exports.belongingTo = async (req, res, next) => {
    try {
        if (!req.body.course) {
            return next(new errorHandler('this part must belong to a Course. Please provide a course Id', 400))
          }
          
        const course = await Course.findById(req.body.course).select('+createdBy')

        if (!course) return next(new errorHandler('This Document does not exist', 404))

        const ifCreatedByThisUser = (req.user.id === course.createdBy.toString())
        
        if (!ifCreatedByThisUser) return next(new errorHandler('You cannot modify other\'s Document', 401))

        next()
    } catch (err) {
      next(err)
    }
}

exports.ifCreatedBy = (model) => async (req, res, next) => {
    try {
        let roled
            req.user.role.map((UserRoles) => {
                roled = UserRoles
            })
        const schema = await model.findById(req.params.id).select('+createdBy')
        if (!schema) return next(new errorHandler('Document not found', 404))
        // console.log(schema)

        if (roled !== 'admin') {
            const ifCreatedByThisUser = (req.user.id === schema.createdBy.toString())
            console.log(typeof(req.user.id), req.user.id)
            console.log(typeof(schema.createdBy.toString()), schema.createdBy)
            if (!ifCreatedByThisUser) {
                return next(new errorHandler('You cannot delete or modify this Document', 401))
            }
        }
      next()
    } catch (err) {
      next(err)
    }
}


exports.login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;

        //? 1) check for if there is an email and password
        if (!email || !password) {
            return next(new errorHandler('Please Provide Email and password', 400))
        }


        //? 2.a) check for if the user exists
        const user = await User.findOne({
            email
        }).select('+password')


        //? 2.b) check for if the password is correct with this line => await user.correctPass(password, user.password)

        if (!user || !(await user.correctPass(password, user.password))) {
            return next(new errorHandler('Incorrect email or password', 401))
        }



        //? 1) If everything went well then Login user
        createAndSignToken(user, 200, res)

    } catch (err) {
        next(err)
    }
}

exports.restrict = async (req, res, next) => {
    try {
        let accessingUserRole, userRole;
        req.user.role.map((roles) => {
            accessingUserRole = roles;
        })
        const user = await User.findById(req.params.id)
        user.role.map((roles) => {
            userRole = roles;
        })
        const users = await User.find()

        //* should accesscontrol here
        
        res.status(200).json({
            success: true,
            results: users.length,
            data: {
                users
            }
        })

        console.log(accessingUserRole)
        console.log(userRole)
      next()
    } catch (err) {
      next(err)
    }
}


exports.protected = async (req, res, next) => {
    try {
        //? 1) Check for if the token is there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }
        // console.log(token)
        if (!token) {
            return next(new errorHandler('Please Log-In to get access to this route!', 401))
        }
        //? 2) Verifying the token 
        let dectoken;
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET, (err, decodedTkn) => {
            if (err) {
                next(new errorHandler('Cannot verify as a User please try logging in again!', 401))
            } else {
                dectoken = decodedTkn;
            }
        })
        // console.log(decodedToken)

        //? 3) Check for if the User, the token was issued to exists
        const user = await User.findById(dectoken.id)
        if (!user) {
            next(new errorHandler('This user does not exists!', 401))
        }

        //? 4) Check for if the user have changed it's password after the token was issued
        //// todo this is process belongs to the userModel so an instance method has been created named =>(changedPasswordAfter)
        if (user.changedPasswordAfter(dectoken.iat)) {
            next(new errorHandler('You have Recently changed your password... Please Log-in again', 401))
        }

        //* If the use passes all tests then grant access and attach the user data with the req to the next middleware
        req.user = user
        next()
    } catch (err) {
        next(err)
    }
}

exports.restrictGettingAllUsersData = async (req, res, next) => {
    try {
        let roled
        req.user.role.map(els => {


            if (els.includes('admin')) {
                roled = ''
            } else if (els.includes('subAdmin')) {
                roled = `{ $ne: 'admin' }`//{$nin: ['admin', 'subAdmin']}
            } else if (els.includes('publisher')) {
                roled = 'user'
            } else {
                next(new errorHandler('You are not authorized to perform this action', 403))
            }
            
        })
        // console.log(roled)
        req.roled = roled;
        next()
      
    } catch (err) {
      next(err)
    }
}

exports.restrictedTo = (...roles) => {
    return (req, res, next) => {
        // console.log(req.user)
        try {
            let roled
            req.user.role.map((UserRoles) => {
                roled = UserRoles
            })
            if (!roles.includes(roled)) {
                next(new errorHandler('You are not authorized to perform this action', 403))
            }
            next()
        } catch (err) {
            next(err)
        }
    }
}



exports.forgotPassword = async (req, res, next) => {

    try {
        //? 1) Get the User based on the provided email address
        const user = await User.findOne({
            email: req.body.email
        })
        //* check for if the user exists
        if (!user) {
            return next(new errorHandler(`No user Found with this email address ${req.body.email}`))
        }
        //? 2) Generate a random token
        //// todo this is process belongs to the userModel so an instance method has been created named =>(changedPasswordAfter)
        const resetToken = user.createResetPassToken();
        await user.save({
            validateBeforeSave: false
        })
        //? sending the token to user's email
        const resetUrl = `${req.protocol}://${req.hostname}/api/v0/users/reset-password/:${resetToken}}`;

        const message = `Apparently it seems you have forgotten your password, and submited a request for changing your password.. Follow this link ${resetUrl} and submit a PATCH Request with password and confirmPassword \n If you haven't requested for password reset! Ignore this email`;

        try {
            await sendEmail({
                email: req.body.email,
                subject: 'Reset Your Password (valid for 10 mins)',
                message
            })
            res.status(200).json({
                success: true,
                message: `A reset token has been sent to your email! ${user.email}`
            })

        } catch (err) {
            user.PassResetToken = undefined;
            user.resetPassTokenExpIn = undefined;
            await user.save({
                validateBeforeSave: false
            })

            next(new errorHandler('Error Sending Email.. Please Try again after some time!', 500))
        }
    } catch (err) {
        next(err)

    }

}

exports.resetPassword = async (req, res, next) => {
    try {
        //? 1) get the user based on the token
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            PassResetToken: hashedToken,
            resetPassTokenExpIn: {
                $gt: Date.now()
            }
        })

        //? 2.A) if the token has not been expired then set the new password
        if (!user) {
            return next(new errorHandler('the token is Invalid or the token has expired. Please try again', 400))
        }
        //? 2.B) change the password and reset everything to it's older dataset
        user.password = req.body.password;
        user.ConfirmPassword = req.body.ConfirmPassword;

        user.PassResetToken = undefined;
        user.resetPassTokenExpIn = undefined;

        await user.save()
        //? 3) update the passwordChangedAt property for the user
        //// todo this part belongs to the userSchema (a pre middleware)

        //? 4) log the user in by sending jwt

        createAndSignToken(user, 200, res)

    } catch (err) {
        next(err)
    }
}


exports.updatePassword = async (req, res, next) => {

    try {
        //? 1) get the user from the collection (based on login user)
        const user = await User.findById(req.user.id).select('+password');

        //? 2) check for if the posted password matches the Db password
        if (!(await user.correctPass(req.body.currentPassword, user.password))) {
            return next(new errorHandler('Wrong Current Password!', 401))
        }
        //? 3) IF the current Password is Correct then update the password with confirmation
        user.password = req.body.newPassword
        user.ConfirmPassword = req.body.ConfirmPassword
        await user.save()

        //? 4) sign the token 
        createAndSignToken(user, 200, res)

    } catch (err) {
        next(err)
    }



}