var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pg = require('pg');

// DB接続
var client = new pg.Client(process.env.DATABASE_URL);

// 静的ファイル配置
app.use(express.static(__dirname + '/'));

// ルーティング
app.get('/', function(req, res)
{
    res.sendFile(__dirname + '/index.html');
});

// ソケット通信
io.on('connection', function(socket)
{
    // ランキング登録
    socket.on('regist', function(name, score)
    {
        // 登録
        client.connect(function(error)
        {
            client.query(
            {
                text: 'insert into t_ranking (name, score, socket) values ($1, $2, $3)',
                values: [name, score, socket.id]
            })
            .catch((error) =>
            {
                console.log('regist error ' + error);
                socket.emit('failed');
            })
            .then(() =>
            {
                socket.emit('registered');
            });
        });
    });
    
    // ランキング取得
    socket.on('get', function(page)
    {
        // 取得
        client.connect(function(error)
        {
            client.query(
            {
                text: 'select name, score from t_ranking order by score desc, id asc offset $1 limit $2',
                values: [page * 15, 15]
            })
            .catch((error) =>
            {
                console.log('get error ' + error);
                socket.emit('failed');
            })
            .then((result) =>
            {
                var ranking = [];
                if(result.rows)
                {
                    for(var i = 0; i < result.rows.length; i++)
                    {
                        ranking[i] = {name:result.rows[i].name, score:result.rows[i].score};
                    }
                }
                socket.emit('got', ranking);
            });
        });
    });
});

// サーバ起動
var port = process.env.PORT || 3000;
http.listen(port, function()
{
    console.log('listening on port ' + port);
});
