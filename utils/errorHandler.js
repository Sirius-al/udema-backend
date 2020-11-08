class errorHandler extends Error {
    constructor(message, statusCode) {
        super(message)

        this.success = `${statusCode}`.startsWith('4') ? false : 'error';
        this.statusCode = statusCode;
        this.is_Operational_Error = true;

        Error.captureStackTrace(this, this.constructor)
    }

}

module.exports = errorHandler;