const User = require('./../model/userModel');
const errorHandler = require('./../utils/errorHandler')
const ApiFeatures = require('./../utils/ApiFeatures')

//* ************************************************************ important function

const filterObj = (obj, ...allowedFields) => {
    let newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
          newObj[el] = obj[el]
        }
    });
    console.log(newObj)
    return newObj
}


//? ************************************************************ Main middlwares




//? ************************************************************ Main controller methods Starts
//? ************************************************************ Main controller methods Starts


exports.getme = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)

        res.status(200).json({
            success: true,
            data: {
                user
            }
        })
    } catch (err) {
        next(err)
    }
}

// const ApiFeatures = require('./../utils/ApiFeatures')


exports.getAllUsers = async (req, res, next) => {
    try {
        
        let features

        if (req.roled) {
            features = new ApiFeatures(User.find({role: req.roled}), req.query).filter().sort().fields().paginate();
        } else {
            features = new ApiFeatures(User.find(), req.query).filter().sort().fields().paginate();
        }
        let users = await features.modelObj
        // console.log(req.roled)

        res.status(200).json({
            success: true,
            results: users.length,
            data: {
                users
            }
        })
    } catch (err) {
        next(err)
    }
}

exports.updateMyData = async (req, res, next) => {
    try {
        // 1) create an error if user tries to update password
        if (req.body.password || req.body.ConfirmPassword) {
            return next(new errorHandler('This route is not for updating password!', 400))
        } else if (req.body.role) {
            return next(new errorHandler('You cannot update your role. It updates automatically or by Admins', 401))
        } else if (req.body.active) {
            return next(new errorHandler('Unauthorized data structure', 401))
            
        }
        // 2) update data
        const filteredBody = filterObj(req.body, 'name', 'email')
        const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        })
        
        res.status(200).json({
            success: true,
            data: {
                user
            }
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteMe = async (req, res, next) => {
    try {
      await User.findByIdAndUpdate(req.user.id, { active: false })

      res.status(204).json({
        success: true,
        data: null
      })

    } catch (err) {
      next(err)
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return next(new errorHandler(`No user found with this Id: ${req.params.id}`, 404))
        }

        res.status(200).json({
            success: true,
            data: {
                user
            }
        })
    } catch (err) {
        next(err)
    }
}


exports.createUser = (req, res, next) => {
    res.status(200).json({
        success: true,
        data: {
            message: `you can create User form this Route.. Please use this route instead --> ${req.protocol}://${req.hostname}/api/v0/users/sign-up`
        }
    })
    next()
}


exports.updateUser = async (req, res, next) => {
    try {
        if (req.body.password || req.body.ConfirmPassword) {
            return next(new errorHandler(`You cannot update User's password`, 401))
        }

        let updateBody;
        if (req.user.role === 'admin') {
            updateBody = req.body
        } else if ((req.user.role === 'subAdmin')) {
            if (req.body.role === 'admin' || req.body.role === 'subAdmin') {
                return next(new errorHandler(`You do not have the permisson to change admins, subadmins`, 401))
            }
            updateBody = {
                name: req.body.name,
                email: req.body.email,
                photo: req.body.photo,
                role: req.body.role,
                active: req.body.Active_Status,
            }
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        if (!user) {
            return next(new errorHandler(`No user found with this Id: ${req.params.id}`, 404))
        }

        res.status(200).json({
            success: true,
            data: {
                user
            }
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return next(new errorHandler(`No user found with this Id: ${req.params.id}`, 404))
        }

        res.status(204).json({
            success: true,
            data: null
        })
    } catch (err) {
        next(err)
    }
}