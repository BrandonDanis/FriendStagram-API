module.exports = {
    jwtSecret: "KEYBOARD CAT",
    jwtSession: {session: false},
    development: process.env.DB_URL,
    test: process.env.TEST_DB_URL
}
