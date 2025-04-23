const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email: { type: String, required: true },
    username: { type: String, required: true },
    token: { type: String, required: true },
    password: { type: String, required: true },
    donneeBancaire: { type: String, default: null },
    telephone: { type: String, default: null },
    bookmark: [{ type: mongoose.Schema.Types.ObjectId, ref: 'articles', default: [] }]   
})

const User = mongoose.model('users', userSchema)
module.exports = User;