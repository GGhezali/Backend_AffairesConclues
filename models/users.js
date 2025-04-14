const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email:String,
    username:String,
    token:String,
    password:String,
   donneeBancaire:String,
   telephone:Number,
   //👇 Clé etrangere pour connection avec collection articles . 
   bookmark:[{ type: mongoose.Schema.Types.ObjectId, ref: 'articles' }],   
})

const User = mongoose.model('users', userSchema)
module.exports = User;