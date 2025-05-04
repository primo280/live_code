const { v4: uuidv4 } = require('uuid');

// Combiner plusieurs UUIDs pour plus de sécurité
const secret = `${uuidv4()}${uuidv4()}${uuidv4()}`.replace(/-/g, '');
console.log('Votre JWT_SECRET :');
console.log(secret);