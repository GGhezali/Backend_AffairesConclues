const mongoose = require("mongoose");

const etatSchema = mongoose.Schema({
  condition: String,
});

const Etat = mongoose.model("etats", etatSchema);

module.exports = Etat;
