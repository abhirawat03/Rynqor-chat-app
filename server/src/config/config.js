const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
const DB = {
    url: process.env.MONGODB_URL,
    name:process.env.DB_NAME
}
const CLOUDINARY = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
}

const ACCESS_TOKEN = {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiry: process.env.ACCESS_TOKEN_EXPIRY
}

const REFRESH_TOKEN = {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiry: process.env.REFRESH_TOKEN_EXPIRY
}


export {PORT, DB, CLOUDINARY, ACCESS_TOKEN, REFRESH_TOKEN}