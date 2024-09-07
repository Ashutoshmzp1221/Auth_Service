const { JWT_KEY } = require('../config/serverConfig');
const UserRepository = require('../repository/user-repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async create(data) {
        try {
            const user = await this.userRepository.create(data);
            return user;
        } catch (error) {
            if(error.name == 'ValidationError') {
                throw error;
            }
            console.log("Something went wrong in the service layer");
            throw error;
        }
    }

    async signIn(email, plainPassword){
        try {
            // step 1 : fetch the user using the email
            const user = await this.userRepository.getByEmail(email);
            // step 2 : compare incoming plain password with stores encrypted password
            const passwordMatch = await this.checkPassword(plainPassword, user.password);

            if(!passwordMatch) {
                console.log("Password doesn't match");
                throw {error: 'Incorrect password'};
            }

            // step 3 : if password match then create a token and send it to the user
            const newJWT = this.createToken({email: user.email, id: user.id});
            return newJWT;
        } catch (error) {
            console.log("Something went wrong in the sign in process");
            throw error;
        }
    }

    async isAuthenticated(token) {
        try {
            const response =  this.varifyToken(token);
            if(!response) {
                throw {error : 'Invalid token'};
            }
            const user = this.userRepository.getById(response.id);
            if(!user) {
                throw {error: 'No user with the corresponding token exits'};
            }
            return user.id
        } catch (error) {
            console.log("Something went wrong in the sign in process");
            throw error;
        }
    }

    createToken(user) {
        try {
            const result = jwt.sign(user, JWT_KEY, {expiresIn: '1d'});
            return result;
        } catch (error) {
            console.log("Something went wrong in the token creation");
            throw error;
        }
    }

    varifyToken(token) {
        try {
            const response = jwt.verify(token, JWT_KEY);
            return response;
        } catch (error) {
            console.log("Something went wrong in the token validation");
            throw error;
        }
    }

    checkPassword(userInputPlainPassword, encryptedPassword) {
        try {
            return bcrypt.compareSync(userInputPlainPassword, encryptedPassword);
        } catch (error) {
            console.log("Something went wrong in the password comparison");
            throw error;
        }
    }

     isAdmin(userId) {
        try {
            return this.userRepository.isAdmin(userId);
        } catch (error) {
            console.log("Something went wrong in the service layer");
            throw error;
        }
     }
}

module.exports = UserService;

