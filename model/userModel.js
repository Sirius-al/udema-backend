const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please Provide a valid Email Address']
    },
    password: {
        type: String,
        required: [true, 'Please Input A password'],
        minlength: [8, 'A Password must be at-least 8 characters long'],
        select: false
    },
    photo: {
        type: String,
        default: 'no_img.jpg'
    },
    role: {
        type: [String],
        enum: {
            values: ['admin', 'subAdmin', 'publisher', 'teacher', 'user'],
            message: 'A role must fit in between one of => publisher/ teacher/ user'
        },
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    ConfirmPassword: {
        type: String,
        required: [true, 'Please Confirm the Password'],
        validate: {
            validator: function (ConfirmPass) {
                return ConfirmPass === this.password;
            },
            message: `Passwords didn't match!`
        }
    },
    passwordChangedAt: Date,
    PassResetToken: String,
    resetPassTokenExpIn: Date


}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})
//? Middlewares
//* update the passwordChangedAt property for the user
UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 2000;
    next()
})


//* querying for active users
UserSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })
    next()
})



//* Hashing password and removing ConfirmPassword from the database
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.ConfirmPassword = undefined;

    next()
})

//* (for login) check for if the user has inputed the correct password or not { this method is: instance method}
UserSchema.methods.correctPass = async function (inputtedPass, dbStoredPass) {
    return await bcrypt.compare(inputtedPass, dbStoredPass)
}

//* (for checking)  if the user has changed it's password after the Jwt was issued
UserSchema.methods.changedPasswordAfter = function (Jwt_iat) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

        return Jwt_iat < changedTimeStamp // So bassically if the Jwt Issued time is less than the password changed time is true then tha pass has been changed <<== returns true
    }
    return false;
}

//* reset password token
UserSchema.methods.createResetPassToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.PassResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // console.log({
    //     resetToken
    // }, this.PassResetToken)

    this.resetPassTokenExpIn = Date.now() + 10 * 60 * 1000;

    return resetToken;
}


const User = mongoose.model('user', UserSchema);

module.exports = User;