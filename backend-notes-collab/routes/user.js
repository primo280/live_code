const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const User = require("../models/User")

// Route pour rechercher des utilisateurs par nom d'utilisateur
router.get("/search", auth, async (req, res) => {
  try {
    const { username } = req.query

    if (!username) {
      return res.status(400).json({ message: "Le paramètre username est requis" })
    }

    // Rechercher des utilisateurs dont le nom d'utilisateur contient la chaîne de recherche
    // Exclure l'utilisateur actuel des résultats
    const users = await User.find({
      username: { $regex: username, $options: "i" },
      _id: { $ne: req.user.id },
    })
      .select("_id username")
      .limit(10)

    res.json(users)
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

module.exports = router
