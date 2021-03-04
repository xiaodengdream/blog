var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var session = require('express-session')
var router = require('./router.js')
var app = express()
app.use('/public/', express.static(path.join(__dirname, './public')))// /public/css/app.js
//app.use('/a/',express.static('./public'))/a/css/a.css 开放public目录
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules')))

app.engine('html', require('express-art-template'))

app.set('views', path.join(__dirname, './views'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())//配置post请求中的bodyParser，可以直接使用req.body-req.query

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}))//配置session

app.use(router)

app.listen('2000', function () {
    console.log('服务器1000已经启动')
})