const mongoose = require("mongoose");

const editeurSchema = mongoose.Schema({
    editeur: String,
});

const Editeur = mongoose.model("editeurs", editeurSchema);

module.exports = Editeur;
