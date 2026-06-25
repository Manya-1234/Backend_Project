import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
    path: './env'
})
connectDB()
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
