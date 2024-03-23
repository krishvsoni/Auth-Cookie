import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = 'process.env.JWT_SECRET';
const DATABASE_URI = process.env.DATABASE_URI;

if (!DATABASE_URI) {
    console.error("DATABASE_URI is not provided in the environment variables");
    process.exit(1);
}

mongoose.connect(DATABASE_URI, {
    // @ts-ignore
    useUnifiedTopology: true as any,
});
;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const UserModel = mongoose.model("User", userSchema);

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }

    if (!JWT_SECRET) {
        return res.status(500).send("JWT secret is not provided");
    }

    const user = await UserModel.findOne({ email, password }).exec();
    if (!user) {
        return res.status(401).send("Invalid email or password");
    }

    const token = jwt.sign({
        id: user._id
    }, JWT_SECRET);

    res.cookie("token", token);
    res.send("Logged In");
});


app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }

    try {
        const existingUser = await UserModel.findOne({ email }).exec();
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        const newUser = new UserModel({ email, password });
        await newUser.save();

        res.status(201).send("User created successfully");
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Internal server error");
    }
});


app.get('/users', async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send("Token not provided");
    }

    if (!JWT_SECRET) {
        return res.status(500).send("JWT secret is not provided");
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const user = await UserModel.findById(decoded.id).exec();
        if (!user) {
            return res.status(401).send("User not found");
        }
        res.send({
            userId: user._id,
            email: user.email
        });
    } catch (err) {
        res.status(401).send("Invalid token");
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "Logged Out"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
