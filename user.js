var mysql=require('mysql')
var connection=mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'dgm199708',
    database : 'myblog'
});
connection.connect()
module.exports=connection