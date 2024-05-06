import  express  from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors  from 'cors';
import path from 'path';


const app = express();
app.use(cookieParser());
app.use(express.json());

const JWT_SECRET = process.env.JWT; 

app.use(cors({
    credentials:true,
    origin: 'http://localhost:5173'
}));


app.post('/signin',(req,res) =>{
    const email = req.body.email;
    const password = req.body.password;
    const token = jwt.sign({
        id:1,
    }, JWT_SECRET as string);
    res.cookie('token',token);
    res.send('Logged In');
});

app.get('/user',(req,res)=>{
    const token = req.cookies.token;
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    res.send({
        userId:decoded.id
    })
});

app.post('/signout',(req,res)=>{
    res.cookie('token','ads');
    res.json({
        message:'Logged Out'
    })
});

app.listen(3000,()=>{
    console.log('Server started on http://localhost:3000');
})
    