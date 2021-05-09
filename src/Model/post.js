const mongoose = require("mongoose");
// const domPurifier = require("dompurify");
// const {JSDOM} = require("jsdom");
// const htmlPurify = domPurifier(new JSDOM().window);
// const { stripHtml } = require("string-strip-html");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author:{
     type: String,
    },
    content: {
        type: String,
        required: true,
    },
    postedOn: { type: Date, default:Date.now() },
    snippet: {
        type: String,
    },
    edited: {
        type: Boolean,
        default: false,
    },
    img: {
        type: String,
        default: "placeholder.jpg",
    },
    reactions: {
        type: Map,
    },
    reactedUser: {
        type: Map,
    },
    comments: [{
         id: Number,
         comment:String,
        // [{ messages: Array, reactions : Map}
    }],
});
// postSchema.pre('validate',function(next){
//     if(this.content){
//         this.content = htmlPurify.sanitize(this.content);
//         this.snippet = stripHtml(this.content.substring(0,100)).result;
//     }
//     next();
// })
module.exports = mongoose.model("Post", postSchema);
