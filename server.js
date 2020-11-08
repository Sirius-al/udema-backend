const mongoose = require('mongoose');
const dotenv = require('dotenv');

//! Uncaught Exception ERROR
process.on('uncaughtException', err => {
    console.log(`ERROR::: ${err}`)
    console.log('ERROR_Stack:::', err.stack)
    console.log(`Uncaught Exception, Shutting Down the Server... 😟😟😟😟😟`);
    process.exit(1)
})

//* coding starts
dotenv.config({
    path: './config.env'
})
const app = require('./app');

const db = process.env.DB.replace('<PASS>', process.env.DB_PASS)

mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('Database connected...'))


const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}!`);
});

process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err}`)
    console.log('ERROR_Stack:::', err.stack)
    console.log(`Unhandled Rejection, Shutting Down the Server... 😟😟😟😟😟`);
    server.close(() => {
        process.exit(1)
    })
})