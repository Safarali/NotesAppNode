const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'This field cannot be empty'],
        minlength: [3, 'Name must contain at least 3 characters'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email field cannot be empty'],
        validate: [validator.isEmail, 'Please provide a valid email'],
        unique: true,
        lovercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must contain at least 8 characters'],
        trim: true,
        validate: {
            validator: function() {
                return !this.password.toLowerCase().includes('password');
            },
            message: 'Password must not contain a word password',
        },
    },

    passwordConfirm: {
        type: String,
        required: [true, 'Please provide a password confirmation'],
        validate: {
            validator: function() {
                return this.passwordConfirm === this.password;
            },
            message: 'Password confirmation does not match the password',
        },
    },
});

userSchema.pre('save', async function(next) {
    // Run this function if password was modified
    if (!this.isModified('password')) return next();

    // Hash the password
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the password confirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.isPasswordCorrect = async function(
    candidatePassword,
    savedPassword,
) {
    return await bcrypt.compare(candidatePassword, savedPassword);
};

userSchema.methods.signToken = async function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
