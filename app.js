const express=require('express');
const app=express();
const port=process.env.PORT||3000;
const mongoose=require('mongoose');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
const path=require('path');
const { ensureAuthenticated}=require('./config/auth')

const users={};
const io = require('socket.io')(80, {
    cors: {
      origin: '*',
    }
  });
require('./config/passport')(passport);


//db
const db=require('./config/keys').MongoURI;
//connect to mongoose
mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology:true})
 .then(()=>{
    console.log("mongodb connected");
 })
  .catch(err=>console.log(err));
//ejs
const expresslayouts=require('express-ejs-layouts')
app.use(expresslayouts);
app.set('view engine','ejs');
app.set('views', __dirname + '/views');
//bodyparser
app.use(express.urlencoded({extended:false}))
//express session
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitiated:true
}));
//passport  middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());
//global vars
app.use((req,res,next)=>{
  res.locals.success_msg=req.flash('success_msg');
  res.locals.error_msg=req.flash('error_msg');
  res.locals.error=req.flash('error');
  next();
})
//routes

app.use('/',require("./routes/index"));

app.use('/users',require("./routes/users"));
app.get('/home',ensureAuthenticated,(req,res)=>{
  app.use(express.static(__dirname+'/public'))
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chat Room</title>
      <script defer src="http://localhost:80/socket.io/socket.io.js"></script>
      <script defer src="/js/client.js"></script>   
      <link rel="stylesheet" href="/css/style.css">
      
  </head>
  <body>
      <nav>
          <img src='/chat.webp' alt="chat img" class="logo">
      </nav>
     <center><h3 id="user" style="color: rgb(250, 246, 246);"></h5></center> 
      <div class="container">
      </div>
      <div class="send">
          <form action="#" id="send-container">
              <input type="text" name="messageinp" id="messageinp">
              <button class="btn" type="submit">send</button>
          </form>
      </div>
  </body>
  </html>`)
})

//start server
io.on('connection',socket =>{
  socket.on('new-user-joined',namee =>{
     console.log('new user',namee);
     users[socket.id]=namee; 
     socket.broadcast.emit('user-joined',namee);

  })
  socket.on('send',message =>{
      socket.broadcast.emit('recieve',{message: message,name:users[socket.id]})
  })
  socket.on('disconnect',message =>{
      socket.broadcast.emit('left',users[socket.id])
      delete users[socket.id];
  })
})
app.listen(port,()=>{
    console.log("server running")
})
