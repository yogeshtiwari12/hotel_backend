import mongoose from "mongoose";
import express from "express";
import fileUpload from "express-fileupload";
import cloudinary from 'cloudinary'
import cors from "cors";
import cookieParser from "cookie-parser";
import hotelroutes from "./routes/hotelroutes.js"
import userroutes from "./routes/userroutes.js"
import payment from "./routes/paymentroutes.js"

const app = express();


mongoose.connect("mongodb+srv://yt781703:pIGoNKqhC67O9fT7@cluster0.4lvgqj3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {


})
.then(()=>{ // it return the promise
  console.log("Connected to MongoDB", mongoose.connection.db.databaseName);
})
.catch(err =>{
console.log("Error connecting to MongoDB", err);
})
app.use(cookieParser())



  app.use(cors({
    origin: 'https://hotel-frontend-blush.vercel.app',
    credentials: true,
  }));
  
  app.use(express.json());

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));


cloudinary.config({
  cloud_name: 'da4yjfao6',
  api_key: '425893122783979',
  api_secret: '0NzDAxq8evq_IcRSd3butcKQBG4'
});

app.use('/hotelroutes',hotelroutes)
app.use('/userroutes',userroutes)
app.use('/payments',payment)

app.listen(4000,()=>{
console.log("Connected to MongoDB ");
})
