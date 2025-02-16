import app from "./config/app.config"
import dotenv from "dotenv"

dotenv.config();
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    
})