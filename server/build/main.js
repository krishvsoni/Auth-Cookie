"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const JWT_SECRET = 'process.env.JWT_SECRET';
const DATABASE_URI = process.env.DATABASE_URI;
if (!DATABASE_URI) {
    console.error("DATABASE_URI is not provided in the environment variables");
    process.exit(1);
}
mongoose_1.default.connect(DATABASE_URI, {
    // @ts-ignore
    useUnifiedTopology: true,
});
;
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    credentials: true,
    origin: "http://localhost:5173"
}));
const userSchema = new mongoose_1.default.Schema({
    email: String,
    password: String,
});
const UserModel = mongoose_1.default.model("User", userSchema);
app.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }
    if (!JWT_SECRET) {
        return res.status(500).send("JWT secret is not provided");
    }
    try {
        const user = yield UserModel.findOne({ email }).exec();
        if (!user) {
            return res.status(401).send("Invalid email or password");
        }
        if (!user.password) {
            return res.status(401).send("Invalid email or password");
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send("Invalid email or password");
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id
        }, JWT_SECRET);
        res.cookie("token", token);
        res.send("Logged In");
    }
    catch (error) {
        console.error("Error signing in:", error);
        res.status(500).send("Internal server error");
    }
}));
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }
    try {
        const existingUser = yield UserModel.findOne({ email }).exec();
        if (existingUser) {
            return res.status(400).send("User already exists");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new UserModel({ email, password: hashedPassword });
        yield newUser.save();
        res.status(201).send("User created successfully");
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Internal server error");
    }
}));
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send("Token not provided");
    }
    if (!JWT_SECRET) {
        return res.status(500).send("JWT secret is not provided");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield UserModel.findById(decoded.id).exec();
        if (!user) {
            return res.status(401).send("User not found");
        }
        res.send({
            userId: user._id,
            email: user.email
        });
    }
    catch (err) {
        res.status(401).send("Invalid token");
    }
}));
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
