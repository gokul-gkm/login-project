const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("mongodb connected...");
})
.catch(() => {
    console.log("failed to connect");
})

const loginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
})

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    trailer: {
        type: String,
        required: true
    }
});

const userdb =  mongoose.model("users", loginSchema)
const admindb =  mongoose.model("admin", adminSchema);
const moviedb =  mongoose.model("movie", movieSchema);


module.exports = {  
    userdb,
    admindb,
    moviedb
};