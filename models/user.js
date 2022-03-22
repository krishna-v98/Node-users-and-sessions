const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: { type: String, required: [true, 'cannot be empty'] },
    lastName: { type: String, required: [true, 'cannot be empty'] },
    email: { type: String, required: [true, 'cannot be empty'], unique: true },
    password: { type: String, required: [true, 'cannot be empty'] }
});

//replace plain text password with hashed password before saving doc in database
// pre-middleware

userSchema.pre('save', function (next) {
    let user = this;
    if (!user.isModified('password'))
        return next();
    bcrypt.hash(user.password, 10)
        .then(hash => {
            user.password = hash;
            next();
        })
        .catch(err => next(err));
});


//implement method to compare login password and hashed password in dbb
//write like this to add custom methods to schema

userSchema.methods.comparePassword = function (loginPassword) {
    return bcrypt.compare(loginPassword, this.password); //this represents the current document since this is instance method 
    //also we return a promise
}

module.exports = mongoose.model('User', userSchema);