const express=require('express');
const axios= require('axios')
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
public_users.post("/register", (req,res) => {
  const username=req.body.username
  const password=req.body.password
  if(!username || !password){
    return res.status(404).json({message:"Error. It's missing username or password"})
  }
  if(isValid(username)){
    return res.status(300).json({message:"Error.This username already exists."})
  }
  const specialCharacters = "!@#$%^&*()_+[]{}|;:',.<>?";
  const hasspecialChars=password.split('').some((char)=>specialCharacters.includes(char))
  if(!hasspecialChars){
    return res.status(404).json({message:"Error.This password is not valid. It should have a special character"})
  }
  users.push({"username":username,"password":password})
  return res.status(200).json({message:`The user ${username} has been successfully register`})
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Synchronous code
  //return res.status(200).send(JSON.stringify(books,null,4));
  //Use of Promise
  let bookPromises=new Promise((resolve,reject)=>{
    setTimeout(()=>{
        if(books){
            resolve(books)
        }else{
            reject({status:400,
            message:"The requested resource doesn't exist"})
        }
    })
  })
  bookPromises.then((libros)=>{
    return res.status(200).send(JSON.stringify(libros,null,4))
  }).catch((error)=>{
    const statusCode=error.status ||500
    return res.status(statusCode).json({message:error.message || error})
  })
});

// Get book details based on ISBN
 public_users.get('/isbn/:isbn',async(req,res)=>{
    const isbn=parseInt(req.params.isbn)
    try{
        const response=await axios.get(`https://salva6770-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/isbn/${isbn}`)
        return res.status(200).json(response.data)
    }catch(error){
        return res.status(404).json({message:"Book wasn't found"})
    }
 })
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const autor=req.params.author
  const librosAutor=[]
  let claves=Object.keys(books)
  //Use Promise
  claves.forEach((clave)=>{
    if(books[clave].author===autor){
        librosAutor.push(books[clave])
    }
  })
  let PromiseAuthor=new Promise((resolve,reject)=>{
    setTimeout(()=>{
        if(librosAutor.length>0){
            resolve(librosAutor)
        }else{
            reject(`There is no book written by ${autor} in this list`)
        }
    },3000)
  })
  PromiseAuthor.then((LibrosAutorColocado)=>{
    return res.status(200).json(LibrosAutorColocado)}).catch(error=>{
        return res.status(404).json({message:error})
    })
  }
);
// Get all books based on title
public_users.get('/title/:title',async(req, res)=>{
  const titulo=req.params.title
  try{
    const response=await axios
    .get
    (`https://salva6770-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/title/${titulo}`)
    return res.status(200).json(response.data)
  }catch(error){
    return res.status(404).json({message:`There is no book with title ${titulo}`})
  }
});
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn=req.params.isbn
  if(Object.keys(books).includes(isbn)){
    isbn=parseInt(isbn)
    let reviewsIsbn=books[isbn].reviews
    return res.status(200).json(reviewsIsbn)
  }else{
    return res.status(404).json({message:`There is no book with ISBN ${isbn}`})
  };
});

module.exports.general = public_users;
