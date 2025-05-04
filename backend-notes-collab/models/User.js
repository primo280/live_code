const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Assurez-vous que le nom d'utilisateur est unique
    },
    // Autres champs si nécessaire
  },
  {
    timestamps: true,
  },
)

// Ajouter un index pour améliorer les performances de recherche
userSchema.index({ username: 1 })

module.exports = mongoose.model("User", userSchema)
