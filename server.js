require('dotenv').config();



const Koa = require('koa');
const cors = require('@koa/cors');

const app = new Koa();

const router = require('./router.js')


app.use(router.routes());

app.use(cors());




app.listen(process.env.PORT || 3000);

