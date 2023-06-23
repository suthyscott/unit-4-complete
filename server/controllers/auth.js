require('dotenv').config()
const {SECRET} = process.env
const {User} = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// This function receives user information and uses that information generate a unique authentication token that can be used to prove the user's identity in the future. 
const createToken = (username, id) => {
    return jwt.sign(
        {
            username,
            id
        },
        SECRET,
        { 
            expiresIn: '2 days' 
        }
    )
}

module.exports = {
    // 3. We receive the request in the below function and begin the logic in that function. 
    register: async (req, res) => {
        // We put all our logic in the 'try' block so that if something goes wrong we can pass the error down to our catch block and have detailed error handling.
        try {
            const {username, password} = req.body
            // 4. We'll use the username and password from req.body to check if the user is already in the database. 
            let foundUser = await User.findOne({where: {username}})
            if (foundUser) {
                // 4.1 If there is a user, we'll send back an error code to inform the user that that username is taken. 
                res.status(400).send('cannot create user')
            } else {
                // 5. If there is no user with that username already, we register the user by adding their info the db. 

                // 5.1 Generate the salt (a string of random characters to help encrypt our password)
                const salt = bcrypt.genSaltSync(10)
                console.log(salt)
                // 5.2 mix the salt with the password to generate the encrypted (hashed) password. 
                const hash = bcrypt.hashSync(password, salt)

                // 5.3 Make a SQL  insert statement using the .create function to add the user's info (including the hashed password) to the db. We then receive the new user's data. 
                const newUser = await User.create({username, hashedPass: hash})

                // 5.4 We use our createToken function to generate a unique identifying token (long, complicated string) for the user to prove their identity in the future. 
                const token = createToken(newUser.dataValues.username, newUser.dataValues.id)
                console.log('TOOOOOOKEN', token)

                // 5.5 generate a JS timestamp to show when the token will expire. 
                const exp = Date.now() + 1000 * 60 * 60 * 48

                // 6 send back the user's info, the user's token and the expiration time for the user to the front end. 
                res.status(200).send({
                    username: newUser.dataValues.username, 
                    userId: newUser.dataValues.id,
                    token, 
                    exp})
            }
        } catch (error) {
            console.log('ERROR IN register')
            console.log(error)
            res.sendStatus(400)
        }
    },

    login: async (req, res) => {
        try {
            const {username, password} = req.body
            let foundUser = await User.findOne({where: {username}})
            if (foundUser) {
                const isAuthenticated = bcrypt.compareSync(password, foundUser.hashedPass)

                if (isAuthenticated) {
                    const token = createToken(foundUser.dataValues.username, foundUser.dataValues.id)
                    const exp = Date.now() + 1000 * 60 * 60 * 48
                    res.status(200).send({
                        username: foundUser.dataValues.username, 
                        userId: foundUser.dataValues.id,
                        token, 
                        exp
                    })
                } else {
                    res.status(400).send('cannot log in')
                }

            } else {
                res.status(400).send('cannot log in')
            }
        } catch (error) {
            console.log('ERROR IN register')
            console.log(error)
            res.sendStatus(400)
        }
    },
}