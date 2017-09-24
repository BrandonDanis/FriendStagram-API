require('dotenv').config();

module.exports = {
    jwtSecret: process.env.SECRET_KEY,
    jwtSession: {session: false},
    development: process.env.DB_URL,
    test: process.env.TEST_DB_URL,
    saltRounds: process.env.SALT_ROUNDS
};
