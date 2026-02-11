const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
let books = require("./router/booksdb.js");
app.use(express.json());
app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))
app.use("/customer/auth/*", function auth(req,res,next){
    if(req.session.authorization){
        let token=req.session.authorization['accessToken']
        jwt.verify(token,"access",(err,user)=>{
            if(!err){
                req.user=user;
                next()
            }
            else{
                return res.status(403).json({message:"Usuario no ha sido autenticado"})
            }
        })
    }else{
        return res.status(403).json({message:"El usuario no ha iniciado sesion."})
    }
});
const PORT =5000;
/*Functionts that allows the using of axios */
// Get book details based on ISBN
genl_routes.get('/books/isbn/:isbn',function (req, res) {
    const isbn=parseInt(req.params.isbn)
    let librosIsbn=books[isbn]
    if(!librosIsbn){
      return res.status(404).json({message:"No existe libro con este ISBN"})
    }
    return res.status(200).json(librosIsbn)})
//Get book details based on title
genl_routes.get('/books/title/:title',function (req, res) {
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
  })
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
