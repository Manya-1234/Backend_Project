import dotenv from "dotenv"
import connectDB from "./db/index.js"


dotenv.config({
    path: './env'
})
connectDB()
.then(()=>{
    app.on("error",(err)=>{
        console.log("EROOR: ",err)
        throw err;
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at PORT : ${process.env.PORT}`)
    })
}
)
.catch((err)=>{
    console.log("MONGODB connection failed!!! ",err)
})







































/*
import mongoose from "mongoose"
import { DB_NAME } from "./constants"
import express from "express"
const app= express()
;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Database connected")
        app.on("error",(error)=>{
            console.log("Error",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on PORT: ${process.env.PORT}`)
        })
    }
    catch(error){
        console.log("Error occured in connecting with database ",error)
        throw error;
    }
})()
*/
