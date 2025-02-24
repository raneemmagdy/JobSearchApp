import env from 'dotenv'
import express from 'express'
import bootstrap from './src/app.controller.js'
import { initializeSocket } from './src/modules/socket.io.js'
env.config()
const app=express()
const port=process.env.PORT||3000

bootstrap(app,express)
const server=app.listen(port,()=>{
    console.log(`Server is Running On Port ${port}`);
    
})

initializeSocket(server)