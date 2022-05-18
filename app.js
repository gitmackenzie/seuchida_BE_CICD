require("dotenv").config();
const express = require('express');
const connect = require('./schemas');
const cors = require('cors');
const passportConfig = require('./passport');
const fs = require('fs');
const https = require('https');
const socket = require('./socket');

const privateKey = fs.readFileSync(__dirname + '/private.key', 'utf8');
const certificate = fs.readFileSync(__dirname + '/certificate.crt', 'utf8');
const ca = fs.readFileSync(__dirname + '/ca_bundle.crt', 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
};
const app_low = express();
const app = express();
const httpPort = process.env.HTTP_PORT;
const httpsPort = process.env.HTTPS_PORT;

app_low.use((req, res, next) => {
    if (req.secure) {
        next();
    } else {
        const to = `https://${req.hostname}:${httpsPort}${req.url}`;
        res.redirect(to);
    }
});

connect();
passportConfig();
//마지막에 cors 수정해야함
app.use(cors());

const postsRouter = require('./routes/post');
const usersRouter = require('./routes/user');
const reviewsRouter = require('./routes/review');
const mypageRouter = require('./routes/mypage');
const chatsRouter = require('./routes/chatting');
// const evlaueRouter = require('./routes/evalue');

const requestMiddleware = (req, res, next) => {
    console.log('Request URL:', req.originalUrl, ' - ', new Date());
    next();
};
//프론트에서 오는 데이터들을 body에 넣어주는 역할
app.use(express.json());
app.use(requestMiddleware);

//form 형식으로 데이터를 받아오고 싶을 때(false->true)
app.use('/api', express.urlencoded({ extended: false }), postsRouter);
app.use('/oauth', express.urlencoded({ extended: false }), usersRouter);
app.use('/api', express.urlencoded({ extended: false }), reviewsRouter);
app.use('/api', express.urlencoded({ extended: false }), mypageRouter);
app.use('/api', express.urlencoded({ extended: false }), chatsRouter);
// app.use('/api', express.urlencoded({ extended: false }), evlaueRouter);
app.get('/', (req, res) => {
    res.send('hi????');
});
app.get(
    '/.well-known/pki-validation/6448FFC6223A036C982B8E3F95226766.txt',
    (req, res) => {
        res.sendFile(
            __dirname +
                '/well-known/pki-validation/6448FFC6223A036C982B8E3F95226766.txt'
        );
    }
);
const server = https.createServer(credentials, app);
socket(server)

app.listen(httpPort, () => {
    console.log('local서버가 켜졌어요!');
});

server.listen(httpsPort, () => {
    console.log('https서버가 켜졌어요!');
});

