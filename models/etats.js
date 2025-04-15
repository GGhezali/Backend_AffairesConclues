const mongoose = require('mongoose');

const etatSchema = mongoose.Schema({
etat: String,
});

const Etat = mongoose.model('etats', etatSchema);

module.exports = Etat;