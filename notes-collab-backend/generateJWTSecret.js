const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
console.log('Votre secret JWT :');
console.log(secret);