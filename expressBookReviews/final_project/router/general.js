const express = require('express');
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
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn=parseInt(req.params.isbn)
  let librosIsbn=books[isbn]
  if(!librosIsbn){
    return res.status(404).json({message:"No existe libro con este ISBN"})
  }
  return res.status(200).send(JSON.stringify(librosIsbn,null,4));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const autor=req.params.author
  const librosAutor=[]
  let claves=Object.keys(books)
  claves.forEach((clave)=>{
    if(books[clave].author===autor){
        librosAutor.push(books[clave])
    }
  })
  if(librosAutor.length>0){
    return res.status(200).json(librosAutor);
  }else{
    return res.status(400).json({message:`There is no book written by ${autor} in this list`})
  }
  }
);

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const titulo=req.params.title
  let claves=Object.keys(books)
  const librosPorTitulo=[]
  claves.forEach((clave)=>{
    if(books[clave].title===titulo){
        librosPorTitulo.push(books[clave])
    }
  })
  if(librosPorTitulo.length>0){
    return res.status(200).json(librosPorTitulo)
  }else{
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
