const errorHandler = require('./../utils/errorHandler');

//******************************************************************** Dev error
const devError = (err, res) => {
    res.status(err.statusCode).json({
        success: err.success,
        error: err,
        message: err.message,
        err_stack: err.stack
    })
}

//******************************************************************** Production error
const prodError = (err, res) => {
    if (err.is_Operational_Error = true) {
        res.status(err.statusCode).json({
            success: err.success,
            message: err.message
        })
    } else {
        console.log('The Error is:', err)
        res.status(500).json({
            success: 'Error',
            message: `Something went wrong with the server...`
        })
    }
}
//******************************************************************** production error's FUNCTIONS
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;

    return new errorHandler(message, 400)
}

const DuplicateFieldsDB = err => {
    const value = err.errmsg.match(/{([^}]*)}/)
    const message = `Dulplicate key value at: ${value[1]}`

    return new errorHandler(message, 400)

}

const ValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid Input: ${errors.join('..  ')}`

    return new errorHandler(message, 400)
}
const JwtErrorToken = () => new errorHandler('Invalid Token. Try Logging in again!', 401)

const JwtExpErrorToken = () => new errorHandler('Your Token has Expired. Please Log-in again!', 401)



//******************************************************************** Main error handler
module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.success = err.success || false;

    if (process.env.NODE_ENV === 'development') {
        devError(err, res)

    } else if (process.env.NODE_ENV === 'production') {
        let error = {
            ...err
        }
        if (error.name === 'CastError') error = handleCastErrorDB(error)
        if (error.code === 11000) error = DuplicateFieldsDB(error)
        if (error.name === 'ValidationError') error = ValidationErrorDB(error)
        if (error.name === 'JsonWebTokenError') error = JwtErrorToken()
        if (error.name === 'TokenExpiredError') error = JwtExpErrorToken()


        prodError(error, res)
    }

}