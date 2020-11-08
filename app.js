//* Core modules
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const permittedCrossDomainPolicies = require('helmet-crossdomain');
const mongoSanitize = require('express-mongo-sanitize')
const xss_clean = require('xss-clean')
const hpp = require('hpp')


//* Local modules
const errorHandler = require('./utils/errorHandler');
const errController = require('./controller/errorController');
const courseRoute = require('./routes/courseRoutes');
const userRoute = require('./routes/userRoutes');
const reviewRoute = require('./routes/reviewRoutes');

//* initiating middlewares and crutial functions
const app = express()

app.use(helmet())

app.use(permittedCrossDomainPolicies())


app.use(express.json())

app.use(mongoSanitize())
app.use(xss_clean())


app.use(hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'level', 'price']
}))


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

const limiter = rateLimit({
    max: 150,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP! Please try again in an hour'
})

app.use('/api/v0', limiter)



//* Serving Static files
app.use(express.static(`${__dirname}/public`))


app.use('/api/v0/courses/', courseRoute);
app.use('/api/v0/users/', userRoute);
app.use('/api/v0/reviews', reviewRoute);

app.all('*', (req, res, next) => {
    next(new errorHandler(`No data found on ${req.originalUrl}`, 404))
})

app.use(errController);


module.exports = app;