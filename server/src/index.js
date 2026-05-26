import http from "http";
import connectDB from "./config/db.js";
import {app} from './app.js'
import {PORT} from "./config/config.js"
import { initSocket } from "./socket/index.js";

const server = http.createServer(app); // required for socket

initSocket(server);

// DB + server start
connectDB()
.then(()=>{
    server.listen(PORT,()=>{
        console.log(`Server is running at PORT: ${PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongodb connection failed !!!", err)
    process.exit(1)
})