const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
let users = [];
const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    const validar=users.some((user)=>user.username===username) 
    return validar
}
const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
 const validarAuten=users.some((user)=>(user.username===username && user.password===password))
 return validarAuten
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username=req.body.username
  const password=req.body.password
  if(authenticatedUser(username,password)){
    let accessToken=jwt.sign({
        data:{username}
        },'access',{expiresIn:60*120})
        req.session.authorization={accessToken}
        return res.status(200).json({message:"User logged in successfully!"})
  }else{
    return res.status(404).json({message:"The user is incorrect."})
  }  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn=parseInt(req.params.isbn)
  const reviewU=req.body.review
  const username=req.user.data.username
  if(!books[isbn]){
    return res.status(404).json({message:"That book doesn't exist"})
  }
  books[isbn].reviews[username]=reviewU
  return res.status(200).json({message:"Review has been added",reviews:books[isbn].reviews});
});
regd_users.delete("/auth/review/:isbn",(req,res)=>{
    const isbn=parseInt(req.params.isbn)
    const username=req.user.data.username
    if(!books[isbn]){
        return res.status(404).json({message:"That book doesn't exist"})
    }
    delete books[isbn].reviews[username]
    return res.status(200).json({message:"Review has been deleted",reviews:books[isbn].reviews});
})
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
