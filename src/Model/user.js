const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    googleId:{
        type: String
    },
    provider:{
        type: String,
        required: true
    },
    posts:{
      type:[String]
    }

});
module.exports = mongoose.model("User", userSchema);