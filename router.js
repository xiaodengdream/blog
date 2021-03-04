var express = require('express')
const session = require('express-session')
var User = require('./user')
const { fstat, readdir } = require('fs')
var md5 = require('blueimp-md5')//密码加密
const { time } = require('console')
const { title } = require('process')
var router = express.Router()
//User.connect();
router.get('/', function (req, res) {
    var sel = 'SELECT* FROM comments'
    User.query(sel, function (err, data) {
        if (err) {
            console.log(err)
        }
        else {
            data = JSON.parse(JSON.stringify(data))
            res.render('./main.html', { nickname: req.session.nickname, avatar: req.session.avatar, data: data })
        }
    })

})
router.get('/dgmdream', function (req, res) {
    res.render('./dgmdream.html', { nickname: req.session.nickname, avatar: req.session.avatar })
})
router.get('/about', function (req, res) {
    res.render('./about.html', { nickname: req.session.nickname, avatar: req.session.avatar })
})
router.get('/info', function (req, res) {
    var sel = 'SELECT* FROM comments where nickname=?'
    User.query(sel, [req.session.nickname], function (err, comments) {
        if (err) {
            console.log(err)
        }
        else {
            comments = JSON.parse(JSON.stringify(comments))

            var sels = 'SELECT* FROM collection where nicknames=?'
            User.query(sels, [req.session.nickname], function (err, collection) {
                if (err) {
                    console.log(err)
                }
                else {
                    collection = JSON.parse(JSON.stringify(collection))

                    res.render('./info.html', {
                        nickname: req.session.nickname,
                        avatar: req.session.avatar,
                        email: req.session.email,
                        bio: req.session.bio,
                        birthday: req.session.birthday,
                        gender: req.session.gender,
                        createtime: req.session.createtime,
                        title: req.session.title,
                        content: req.session.content,
                        comments: comments,
                        collection: collection
                    })
                }
            })
        }
    })
})
router.get('/infos', function (req, res) {
    var del = 'DELETE FROM comments where id=?'
    User.query(del, [req.query.id], function (err, dels) {
        if (err) {
            console.log(err)
        }
        else {
            var sel = 'SELECT* FROM comments where nickname=?'
            User.query(sel, [req.session.nickname], function (err, comments) {
                if (err) {
                    console.log(err)
                }
                else {
                    res.render('./info.html', {
                        nickname: req.session.nickname,
                        avatar: req.session.avatar,
                        email: req.session.email,
                        bio: req.session.bio,
                        birthday: req.session.birthday,
                        gender: req.session.gender,
                        createtime: req.session.createtime,
                        title: req.session.title,
                        content: req.session.content,
                        comments: comments
                    })
                }
            })
        }
    })
})
router.get('/set', function (req, res) {
    res.render('./set.html', {
        nickname: req.session.nickname, email: req.session.email,
        gender: req.session.gender, birthday: req.session.birthday, bio: req.session.bio,
        password: req.session.password, avatar: req.session.avatar
    })
})
router.post('/set', function (req, res) {
    var body = req.body
    //body.password=md5(md5(body.password))
    var selSql = 'SELECT* FROM user where nickname=?'
    User.query(selSql, [body.nickname],
        function (err, data) {
            if (err) {
                res.status(500).json({
                    code: 500,
                    message: 'server err'
                })
            }
            if (data[0]) {
                if (data[0].nickname === req.session.nickname) {

                    var addSql = 'UPDATE user SET nickname = ?, bio=? ,gender = ?,birthday=?,avatar=? WHERE email = ?'
                    var addSqlParams = [body.nickname, body.bio, body.gender, body.birthday, body.avatar, req.session.email]
                    User.query(addSql, addSqlParams, function (err, user) {
                        if (err) {
                            console.log(err)

                        }


                        var upsql = 'UPDATE comments SET nickname = ?,avatar=? WHERE email=?'
                        var updata = [body.nickname, body.avatar, req.session.email]
                        User.query(upsql, updata, function (err, comments) {

                            if (err) {
                                console.log(err)
                            }
                            req.session.nickname = addSqlParams.nickname
                            res.status(200).json({
                                code: 0,
                                message: 'ok'
                            })
                        })

                    })

                }
                else {
                    return res.status(200).json({//自动把对象转化为字符串发送给浏览器
                        code: 1,
                        message: '昵称存在'
                    })
                }
            }
            if (!data[0]) {
                var addSql = 'UPDATE user SET nickname = ?, bio=? ,gender = ?,birthday=?,avatar=? WHERE email = ?'
                var addSqlParams = [body.nickname, body.bio, body.gender, body.birthday, body.avatar, req.session.email]
                User.query(addSql, addSqlParams, function (err, user) {
                    if (err) {
                        console.log(err)

                    }

                    var upsql = 'UPDATE comments SET nickname = ?,avatar=? WHERE email=?'
                    var updata = [body.nickname, body.avatar, req.session.email]
                    User.query(upsql, updata, function (err, comments) {

                        if (err) {
                            console.log(err)
                        }
                        req.session.nickname = addSqlParams.nickname
                        res.status(200).json({
                            code: 0,
                            message: 'ok'
                        })
                    })

                })
            }
        })

})
router.post('/sets', function (req, res) {
    var body = req.body
    var upsql = 'UPDATE user SET password=? WHERE email=?'
    var updata = [body.password2, req.session.email]
    User.query(upsql, updata, function (err, data) {
        if (err) {
            console.log(err)
        }
        else {
            res.redirect('/set')
        }
    })
})
router.get('/register', function (req, res) {
    res.render('./register.html')
})
router.post('/register', function (req, res) {
    var body = req.body
    //body.password=md5(md5(body.password))
    var selSql = 'SELECT* FROM user where email =? or nickname=?'
    User.query(selSql, [body.email, body.nickname],
        function (err, data) {
            if (err) {
                res.status(500).json({
                    code: 500,
                    message: 'server err'
                })
            }
            if (data[0]) {
                return res.status(200).json({//自动把对象转化为字符串发送给浏览器
                    code: 1,
                    message: '邮箱或者昵称存在'
                })
            }
            //body.password=md5(md5(body.password))
            var addSql = 'INSERT INTO user SET?'
            var addSqlParams = { email: body.email, nickname: body.nickname, password: body.password }
            //var addSql = 'INSERT INTO user(email,nickname,password) VALUES(?,?,?)'
            //var addSqlParams = [body.email, body.nickname, body.password];
            User.query(addSql, addSqlParams, function (err, user) {
                if (err) {
                    res.status(500).json({
                        code: 500,
                        message: 'server err'
                    })
                }
                // req.session.nickname = addSqlParams.nickname
                // req.session.email = addSqlParams.email
                // req.session.avatar = '/public/img/default.jpg'
                res.status(200).json({
                    code: 0,
                    message: 'ok'
                })

            })

        })
})
router.get('/login', function (req, res) {
    res.render('./login.html')
})
router.post('/login', function (req, res) {
    var body = req.body
    //body.password=md5(md5(body.password))
    var selSql = 'SELECT* FROM user where email =? and password=?'
    User.query(selSql, [body.email, body.password], function (err, user) {
        if (err) {
            res.status(500).json({
                code: 500,
                message: 'server err'
            })
        }
        if (!user[0]) {
            return res.status(200).json({//自动把对象转化为字符串发送给浏览器
                code: 1,
                message: '邮箱或者昵称存在'
            })
        }
        req.session.nickname = user[0].nickname
        req.session.email = body.email
        req.session.password = body.password
        req.session.birthday = user[0].birthday
        req.session.gender = user[0].gender
        req.session.bio = user[0].bio
        req.session.avatar = user[0].avatar



        var year = user[0].createtime.getFullYear(); //得到年份
        var month = user[0].createtime.getMonth() + 1;//得到月份
        var date = user[0].createtime.getDate();//得到日期
        //var day = user[0].createtime.getDay();//得到周几
        var hour = user[0].createtime.getHours();//得到小时
        var minu = user[0].createtime.getMinutes();//得到分钟
        req.session.createtime = year + "-" + month + "-" + date + " " + hour + ":" + minu
        res.status(200).json({
            code: 0,
            message: 'ok'
        })
    })
})
router.get('/speak', function (req, res) {
    res.render('./speak.html')
})
router.post('/speak', function (req, res) {
    var addSql = 'INSERT INTO comments(Id,title,content,avatar,nickname,email) VALUES(0,?,?,?,?,?)'
    var addSqlParams = [req.body.title, req.body.content, req.session.avatar, req.session.nickname, req.session.email]
    User.query(addSql, addSqlParams, function (err, comments) {
        if (err) {
            console.log(err)
        }
        //req.session.nickname = addSqlParams.nickname
        else {
            req.session.title = req.body.title
            req.session.content = req.body.content
            res.redirect('/')
        }
    })
})
router.get('/comments', function (req, res) {
    var sel = 'SELECT* FROM comments WHERE id=?'
    User.query(sel, [req.query.id], function (err, data) {
        if (err) {
            console.log(err)
        }
        else {
            data = JSON.parse(JSON.stringify(data))
            var sels = 'SELECT* FROM reply WHERE id=?'
            User.query(sels, [req.query.id], function (err, reply) {
                if (err) {
                    console.log(err)
                }
                else {
                    reply = JSON.parse(JSON.stringify(reply))
                    res.render('./comments.html', { nickname: req.session.nickname, avatar: req.session.avatar, data: data, reply: reply })
                }
            })

        }
    })
})
router.post('/collection', function (req, res) {
    var addSql = 'INSERT INTO collection(names,titles,contents,nicknames) VALUES(?,?,?,?)'
    var addSqlParams = [req.body.names, req.body.titles, req.body.contents, req.session.nickname]
    User.query(addSql, addSqlParams, function (err, collection) {
        if (err) {
            console.log(err)
        }
        else {
            res.redirect('/')

        }
    })
})
router.post('/collections', function (req, res) {
    var addSql = 'INSERT INTO comments(avatar,nickname,title,content) VALUES(?,?,?,?)'
    var addSqlParams = [req.body.avatar, req.body.nickname, req.body.title, req.body.content]
    User.query(addSql, addSqlParams, function (err, comments) {
        if (err) {
            console.log(err)
        }
        else {

            res.redirect('/')

        }
    })
})
router.get('/collections', function (req, res) {
    var del = 'DELETE FROM collection where id=?'
    User.query(del, [req.query.id], function (err, dels) {
        if (err) {
            console.log(err)
        }
        else {
            res.redirect('/info')
        }
    })
})
router.post('/reply', function (req, res) {
    var addSql = 'INSERT INTO reply(id,nickname,avatar,rcontent) VALUES(?,?,?,?)'
    var addSqlParams = [req.body.id, req.session.nickname, req.session.avatar, req.body.rcontent,]
    User.query(addSql, addSqlParams, function (err, reply) {
        if (err) {
            console.log(err)
        }
        else {
            res.redirect('/')

        }
    })
})
router.get('/dreply', function (req, res) {
    var del = 'DELETE FROM reply where ids=?'
    User.query(del, [req.query.ids], function (err, dels) {
        if (err) {
            console.log(err)
        }
        else {
            res.redirect('/')
        }
    })
})
router.get('/logout', function (req, res) {
    req.session.nickname = null
    req.session.email = null
    req.session.password = null
    req.session.birthday = null
    req.session.gender = null
    req.session.bio = null
    req.session.avatar = null
    res.redirect('/')
})
module.exports = router