enchant();

/**
 * サーバ管理情報
 */
var Server = function()
{
    this.socket = io();
    this.ranking = [];
    this.registered = false;
    this.received = false;
    this.count = 0;
    this.page = 0;
}
var server = new Server();

/**
 * ランキング登録
 */
server.socket.on('registered', function()
{
    server.registered = true;
});

/**
 * ランキング取得
 */
server.socket.on('got', function(args)
{
    server.ranking = args;
    server.received = true;
});

/**
 * サーバ側エラー
 */
server.socket.on('failed', function()
{
    server.ranking = [];
    server.registered = false;
    server.received = false;
});

/**
 * メイン処理
 */
window.onload = function()
{
    // 定数
    const img_button = "img/button.png";
    const img_font = "img/font.png";
    const img_input = "img/input.png";
    const img_message = "img/message.png";
    const img_office = "img/office.png";
    const img_ranking = "img/ranking.png";
    const img_worker = "img/worker.png";
    
    // フレームワーク
    var game = new Game(480, 320);
    game.preload(img_button, img_font, img_input, img_message, img_office, img_ranking, img_worker);
    game.fps = 30;
    orientationChange(game);
    
    // 画面サイズ変更
    window.addEventListener("resize", function()
    {
        orientationChange(game);
    });
    
    // 画面向き変更
    window.addEventListener("orientationchange", function()
    {
        orientationChange(game);
    });
    
    //****************************************************
    // 背景クラス
    //****************************************************
    var Background = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 480, 320);
            this.image = game.assets[img_office];
            this.clear();
            scene.addChild(this);
            
            // 暗転用
            var surface = new Surface(480, 256);
            surface.context.fillStyle = "blakck";
            surface.context.fillRect(0, 0, surface.width, surface.height);
            this.effect = new Sprite(surface.width, surface.height);
            this.effect.image = surface;
            this.effect.x = 0;
            this.effect.y = 16;
            this.effect.opacity = 0;
            scene.addChild(this.effect);
        },
        set: function(type)
        {
            this.frame = type;
            this.x = 0;
            this.y = 0;
            this.effect.opacity = 0;
        },
        setTitle: function()
        {
            this.set(0);
        },
        setMain: function()
        {
            this.set(1);
        },
        setGameClear: function()
        {
            this.set(2);
        },
        setGameOver: function()
        {
            this.set(3);
        },
        blackout: function(val)
        {
            this.effect.opacity = val;
        },
        clear: function()
        {
            this.frame = -1;
            this.x = this.width * -1;
            this.y = this.height * -1;
        }
    });
    
    //****************************************************
    // 社畜クラス
    //****************************************************
    var Worker = Class.create(Sprite,
    {
        initialize: function(scene, id)
        {
            Sprite.call(this, 64, 64);
            this.image = game.assets[img_worker];
            this.id = id;
            this.clear();
            this.on(Event.ENTER_FRAME, this.enterframe);
            scene.addChild(this);
        },
        set: function()
        {
            this.x = 48 + this.id * 64;
            this.y = 192;
            this.maxHp = 12;
            this.hp = this.maxHp;
            this.rest = false;
            this.cutover = false;
        },
        enterframe: function()
        {
            if(this.cutover)
            {
                this.frame = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7];
            }
            else if(this.rest)
            {
                this.frame = -1;
            }
            else if(this.hp <= 0)
            {
                this.clear();
            }
            else if(this.hp <= 1)
            {
                this.frame = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
            }
            else if(this.hp <= 5)
            {
                this.frame = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
            }
            else
            {
                this.frame = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1];
            }
        },
        getHp: function()
        {
            return this.hp;
        },
        addHp: function()
        {
            if(this.hp > 0)
            {
                this.hp += rand(1, this.maxHp);
                if(this.hp > this.maxHp)
                {
                    this.hp = this.maxHp;
                }
            }
        },
        subHp: function()
        {
            if(this.hp > 3)
            {
                this.hp -= rand(1, 2);
            }
            else
            {
                this.hp--;
            }
            if(this.hp < 0)
            {
                this.hp = 0;
            }
        },
        fullHp: function()
        {
            this.hp = this.maxHp;
        },
        setRest: function(flg)
        {
            this.rest = flg;
        },
        setCutover: function(flg)
        {
            this.cutover = flg;
        },
        clear: function()
        {
            this.frame = -1;
            this.x = this.width * -1;
            this.y = this.height * -1;
            this.hp = 0;
            this.rest = false;
            this.cutover = false;
        }
    });
    
    //****************************************************
    // 文字クラス
    //****************************************************
    var Moji = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 16, 16);
            this.image = game.assets[img_font];
            this.clear();
            scene.addChild(this);
        },
        set: function(x, y, c)
        {
            this.id = "　０１２３４５６７８９－あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんっゃゅょ？゛゜".indexOf(c);
            this.frame = this.id;
            this.x = x;
            this.y = y;
        },
        white: function()
        {
            this.frame = this.id;
        },
        black: function()
        {
            this.frame = this.id + 65;
        },
        clear: function()
        {
            this.frame = -1;
            this.x = this.width * -1;
            this.y = this.height * -1;
        }
    });
    
    //****************************************************
    // メッセージクラス
    //****************************************************
    var Message = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 288, 80);
            this.image = game.assets[img_message];
            scene.addChild(this);
            this.moji = [];
            for(var i = 0; i < 48; i++)
            {
                this.moji[i] = new Moji(scene);
            }
            this.clear();
        },
        set: function(...mes)
        {
            this.clear();
            this.frame = -1;
            this.x = game.width / 2 - this.width / 2;
            this.y = 24;
            var a = 0;
            var b = 0;
            var c = 0;
            for(var i = 0; i < mes.length; i++)
            {
                a = 0;
                this.frame++;
                for(var j = 0; j < mes[i].length; j++)
                {
                    if(j >= (b + 1) * 16)
                    {
                        a = 0;
                        b++;
                        this.frame++;
                    }
                    this.moji[c].set((a + 1) * 16 + this.x, (i + b + 1) * 16 + this.y, mes[i].charAt(j));
                    a++;
                    c++;
                }
            }
        },
        clear: function()
        {
            this.frame = -1;
            this.x = this.width * -1;
            this.y = this.height * -1;
            for(var i = 0; i < this.moji.length; i++)
            {
                this.moji[i].clear();
            }
        }
    });
    
    //****************************************************
    // ボタンクラス
    //****************************************************
    var Button = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 112, 48);
            this.image = game.assets[img_button];
            this.clear();
            this.on(Event.TOUCH_START, this.touchStart);
            this.on(Event.TOUCH_MOVE, this.touchMove);
            this.on(Event.TOUCH_END, this.touchEnd);
            scene.addChild(this);
        },
        set: function(id, pos)
        {
            this.clear();
            this.id = id;
            this.frame = this.id;
            switch(pos)
            {
                case 0:
                    this.x = 16;
                    break;
                case 1:
                    this.x = 128;
                    break;
                case 2:
                    this.x = 240;
                    break;
                case 3:
                    this.x = 352;
                    break;
            }
            this.y = 272;
        },
        clear: function()
        {
            this.frame = -1;
            this.x = this.width * -1;
            this.y = this.height * -1;
            this.id = -1;
            this.touch = false;
            this.enabled();
        },
        touchStart: function()
        {
            this.frame = this.id + 4;
            this.touch = true;
        },
        touchMove: function()
        {
            this.frame = this.id;
        },
        touchEnd: function()
        {
            this.frame = this.id;
        },
        isTouch: function()
        {
            if(this.touch)
            {
                this.touch = false;
                return true;
            }
            return false;
        },
        enabled: function()
        {
            this.touchEnabled = true;
        },
        disabled: function()
        {
            this.touchEnabled = false;
        }
    });
    
    //****************************************************
    // インプットクラス
    //****************************************************
    var Input = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 48, 48);
            this.image = game.assets[img_input];
            this.on(Event.TOUCH_START, this.touchStart);
            this.on(Event.TOUCH_MOVE, this.touchMove);
            this.on(Event.TOUCH_END, this.touchEnd);
            this.on(Event.ENTER_FRAME, this.enterframe);
            scene.addChild(this);
            this.moji = new Moji(scene);
            this.moji.on(Event.TOUCH_START, this.touchStart);
            this.moji.on(Event.TOUCH_MOVE, this.touchMove);
            this.moji.on(Event.TOUCH_END, this.touchEnd);
            this.clear();
        },
        set: function(x, y, c)
        {
            this.clear();
            this.x = x;
            this.y = y;
            this.character = c;
            this.black();
            if(this.frame == 0)
            {
                this.moji.set(x + 16, y + 16, c);
            }
            else
            {
                this.moji.clear();
            }
        },
        clear: function()
        {
            this.frame = -1;
            this.character = "";
            this.x = this.width * -1;
            this.y = this.height * -1;
            this.touch = false;
            this.enter = false;
            this.moji.clear();
            this.moji.touch = false;
            this.moji.enter = false;
        },
        touchStart: function()
        {
            this.touch = true;
            this.enter = true;
        },
        touchMove: function()
        {
            this.enter = false;
        },
        touchEnd: function()
        {
            this.enter = false;
        },
        enterframe: function()
        {
            if(this.enter || this.moji.enter)
            {
                this.white();
            }
            else
            {
                this.black();
            }
        },
        black: function()
        {
            switch(this.character)
            {
                case "完":
                    this.frame = 1;
                    break;
                case "消":
                    this.frame = 2;
                    break;
                case "左":
                    this.frame = 3;
                    break;
                case "右":
                    this.frame = 4;
                    break;
                default:
                    this.frame = 0;
                    this.moji.white();
                    break;
            }
        },
        white: function()
        {
            switch(this.character)
            {
                case "完":
                    this.frame = 6;
                    break;
                case "消":
                    this.frame = 7;
                    break;
                case "左":
                    this.frame = 8;
                    break;
                case "右":
                    this.frame = 9;
                    break;
                default:
                    this.frame = 5;
                    this.moji.black();
                    break;
            }
        },
        isTouch: function()
        {
            if(this.touch || this.moji.touch)
            {
                this.touch = false;
                this.moji.touch = false;
                return this.character;
            }
            return "";
        }
    });
    
    //****************************************************
    // ランキングクラス
    //****************************************************
    var Ranking = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 336, 272);
            this.image = game.assets[img_ranking];
            scene.addChild(this);
            this.moji = [];
            for(var i = 0; i < 285; i++)
            {
                this.moji[i] = new Moji(scene);
            }
            this.clear();
        },
        set: function(mes)
        {
            this.clear();
            this.frame = 0;
            this.x = game.width / 2 - this.width / 2;
            this.y = 24;
            var a = 0;
            for(var i = 0; i < mes.length; i++)
            {
                for(var j = 0; j < mes[i].length && a < this.moji.length; j++)
                {
                    this.moji[a].set((j + 1) * 16 + this.x, (i + 1) * 16 + this.y, mes[i].charAt(j));
                    a++;
                }
            }
        },
        clear: function()
        {
            this.frame = -1;
            this.x = this.width * -1;
            this.y = this.height * -1;
            for(var i = 0; i < this.moji.length; i++)
            {
                this.moji[i].clear();
            }
        }
    });
    
    //****************************************************
    // 予算表示
    //****************************************************
    var Budget = function(scene)
    {
        this.moji = [];
        for(var i = 0; i < 4; i++)
        {
            this.moji[i] = new Moji(scene);
        }
        this.set = function(value)
        {
            if(value < 0) value = 0;
            var str = lpad(zenkaku(value), this.moji.length, "　");
            for(var i = 0; i < str.length; i++)
            {
                this.moji[i].set(i * 16 + 48, 0, str.charAt(i));
            }
        }
        this.clear = function()
        {
            for(var i = 0; i < this.moji.length; i++)
            {
                this.moji[i].clear();
            }
        }
    }
    
    //****************************************************
    // 工数表示
    //****************************************************
    var Manhour = function(scene)
    {
        this.moji = [];
        for(var i = 0; i < 3; i++)
        {
            this.moji[i] = new Moji(scene);
        }
        this.set = function(value)
        {
            if(value < 0) value = 0;
            var str = lpad(zenkaku(value), this.moji.length, "　");
            for(var i = 0; i < str.length; i++)
            {
                this.moji[i].set(i * 16 + 368, 0, str.charAt(i));
            }
        }
        this.clear = function()
        {
            for(var i = 0; i < this.moji.length; i++)
            {
                this.moji[i].clear();
            }
        }
    }
    
    //****************************************************
    // 会社情報
    //****************************************************
    var Office = function()
    {
        this.name = "";
        this.yosan = 0;
        this.kousu = 0;
        this.initialize = function()
        {
            this.yosan = 1000;
            this.kousu = 500;
        }
        this.initialize();
    }
    
    //****************************************************
    // メイン処理
    //****************************************************
    game.onload = function()
    {
        var createScene = function()
        {
            // オブジェクト生成
            var scene = new Scene();
            var background = new Background(scene);
            var worker = [];
            for(var i = 0; i < 6; i++)
            {
                worker[i] = new Worker(scene, i);
            }
            var message = new Message(scene);
            var button = [];
            for(var i = 0; i < 4; i++)
            {
                button[i] = new Button(scene);
            }
            var input = [];
            for(var i = 0; i < 52; i++)
            {
                input[i] = new Input(scene);
            }
            var ranking = new Ranking(scene);
            var budget = new Budget(scene);
            var manhour = new Manhour(scene);
            var office = new Office();
            
            // 背景表示
            background.setTitle();
            
            // 状態管理
            var touch = false;
            var state = 0;
            var page = 0;
            var ranking_data = [];
            
            // 画面タッチ
            scene.on(Event.TOUCH_START, function()
            {
                touch = true;
            });
            
            // フレーム処理
            scene.on(Event.ENTER_FRAME, function()
            {
                switch(state)
                {
                    case 0:
                        //****************************************************
                        // タイトル画面
                        //****************************************************
                        if(touch)
                        {
                            background.setMain();
                            office.initialize();
                            budget.set(office.yosan);
                            manhour.set(office.kousu);
                            for(var i = 0; i < button.length; i++)
                            {
                                button[i].set(i, i);
                            }
                            for(var i = 0; i < worker.length; i++)
                            {
                                worker[i].set();
                            }
                            state++;
                        }
                        break;
                    case 1:
                        //****************************************************
                        // メイン画面
                        //****************************************************
                        if(button[0].isTouch())
                        {
                            // 開発
                            var w_yosan = 0;
                            var w_kousu = 0;
                            var w_youin = 0;
                            for(var i = 0; i < worker.length; i++)
                            {
                                if(worker[i].getHp() > 0)
                                {
                                    w_yosan += rand(1, 2);
                                    w_kousu += rand(1, 2);
                                    w_youin++;
                                    worker[i].subHp();
                                }
                            }
                            if(w_youin > 0)
                            {
                                message.set("しんちょくか゛" + zenkaku(w_kousu) + "　あか゛った");
                                w_yosan += 3;
                                office.yosan -= w_yosan;
                                office.kousu -= w_kousu;
                            }
                            else
                            {
                                message.set("た゛れもいません");
                            }
                            state++;
                        }
                        else if(button[1].isTouch())
                        {
                            // 休暇
                            var w_yosan = 0;
                            var w_youin = 0;
                            for(var i = 0; i < worker.length; i++)
                            {
                                if(worker[i].getHp() > 0)
                                {
                                    w_yosan += rand(1, 2);
                                    w_youin++;
                                    worker[i].addHp();
                                    worker[i].setRest(true);
                                }
                            }
                            if(w_youin > 0)
                            {
                                message.set("ほんし゛つは　おやすみて゛す");
                                w_yosan += 3;
                                office.yosan -= w_yosan;
                                background.blackout(0.5);
                            }
                            else
                            {
                                message.set("た゛れもいません");
                            }
                            state++;
                        }
                        else if(button[2].isTouch())
                        {
                            // 会議
                            var w_yosan = 0;
                            var w_kousu = 0;
                            var w_youin = 0;
                            for(var i = 0; i < worker.length; i++)
                            {
                                if(worker[i].getHp() > 0)
                                {
                                    w_yosan += rand(2, 5);
                                    w_kousu += rand(2, 5);
                                    w_youin++;
                                }
                            }
                            if(w_youin > 0)
                            {
                                w_yosan += 3;
                                var w_rand = 0;
                                if(w_youin < 6)
                                {
                                    w_rand = rand(0, 91);
                                }
                                else
                                {
                                    w_rand = rand(0, 80);
                                }
                                if(w_rand < 10)
                                {
                                    // 0～9
                                    message.set("こすとを　さくけ゛んしろ", "よさんか゛" + zenkaku(w_yosan) + "まん　さか゛った");
                                    office.yosan -= w_yosan;
                                }
                                else if(w_rand < 20)
                                {
                                    // 10～19
                                    message.set("は゛く゛か゛みつかった", "しんちょくか゛" + zenkaku(w_kousu) + "　さか゛った");
                                    office.kousu += w_kousu;
                                }
                                else if(w_rand < 30)
                                {
                                    // 20～29
                                    message.set("かいき゛て゛なにも　きまらない", "しゃいんのやるきか゛さか゛った");
                                    for(var i = 0; i < worker.length; i++)
                                    {
                                        if(worker[i].getHp() > 0) worker[i].subHp();
                                    }
                                }
                                else if(w_rand < 40)
                                {
                                    // 30～39
                                    message.set("ついかよさんを　けいし゛ょう", "よさんか゛" + zenkaku(w_yosan) + "まん　あか゛った");
                                    office.yosan += w_yosan;
                                }
                                else if(w_rand < 50)
                                {
                                    // 40～49
                                    message.set("けんあんか゛かいしょうした", "しんちょくか゛" + zenkaku(w_kousu) + "　あか゛った");
                                    office.kousu -= w_kousu;
                                }
                                else if(w_rand < 60)
                                {
                                    // 50～59
                                    message.set("りんし゛ほ゛－なすを　しきゅう", "しゃいんのやるきか゛あか゛った");
                                    for(var i = 0; i < worker.length; i++)
                                    {
                                        if(worker[i].getHp() > 0) worker[i].addHp();
                                    }
                                }
                                else if(w_rand < 70)
                                {
                                    // 60～69
                                    message.set("ひんたほ゛とうに　いあんりょこう", "しゃいんのやるきか゛あか゛った");
                                    for(var i = 0; i < worker.length; i++)
                                    {
                                        if(worker[i].getHp() > 0) worker[i].fullHp();
                                    }
                                }
                                else if(w_rand < 80)
                                {
                                    // 70～79
                                    message.set("かろうて゛にゅういんした", "よういんか゛ひとり　へった");
                                    for(var i = worker.length - 1; i >= 0; i--)
                                    {
                                        if(worker[i].getHp() > 0)
                                        {
                                            worker[i].clear();
                                            break;
                                        }
                                    }
                                }
                                else if(w_rand < 81)
                                {
                                    // 80
                                    message.set("すとらいきか゛はっせい", "そしてた゛れもいなくなった");
                                    for(var i = 0; i < worker.length; i++)
                                    {
                                        if(worker[i].getHp() > 0) worker[i].clear();
                                    }
                                }
                                else if(w_rand < 91)
                                {
                                    // 81～90
                                    message.set("ほんしゃからの　そ゛うえん", "よういんか゛ひとり　ふえた");
                                    for(var i = 0; i < worker.length; i++)
                                    {
                                        if(worker[i].getHp() <= 0)
                                        {
                                            worker[i].set();
                                            break;
                                        }
                                    }
                                }
                                else
                                {
                                    // 91
                                    message.set("よういんけいかくの　みなおし", "くうせきか゛なくなった");
                                    for(var i = 0; i < worker.length; i++)
                                    {
                                        if(worker[i].getHp() <= 0) worker[i].set();
                                    }
                                }
                            }
                            else
                            {
                                message.set("た゛れもいません");
                            }
                            state++;
                        }
                        else if(button[3].isTouch())
                        {
                            // 増員
                            message.set("これいし゛ょう　そ゛ういん", "て゛きません");
                            for(var i = 0; i < worker.length; i++)
                            {
                                if(worker[i].getHp() <= 0)
                                {
                                    worker[i].set();
                                    office.yosan -= 20;
                                    message.set("そ゛ういんしました");
                                    break;
                                }
                            }
                            state++;
                        }
                        if(state == 2)
                        {
                            budget.set(office.yosan);
                            manhour.set(office.kousu);
                            for(var i = 0; i < button.length; i++)
                            {
                                button[i].disabled();
                            }
                            touch = false;
                        }
                        break;
                    case 2:
                        //****************************************************
                        // ターン終了
                        //****************************************************
                        if(touch)
                        {
                            message.clear();
                            background.blackout(0);
                            for(var i = 0; i < worker.length; i++)
                            {
                                worker[i].setRest(false);
                            }
                            if(office.yosan <= 0)
                            {
                                message.set("よさんか゛なくなりました");
                                for(var i = 0; i < worker.length; i++)
                                {
                                    worker[i].clear();
                                }
                                background.blackout(0.5);
                                state = 8;
                            }
                            else if(office.kousu <= 0)
                            {
                                message.set("ふ゛し゛に　かっとお－は゛－", "おつかれさまて゛した　えらいっ");
                                for(var i = 0; i < worker.length; i++)
                                {
                                    worker[i].set();
                                    worker[i].setCutover(true);
                                }
                                state++;
                            }
                            else
                            {
                                for(var i = 0; i < button.length; i++)
                                {
                                    button[i].enabled();
                                }
                                state = 1;
                            }
                            touch = false;
                        }
                        break;
                    case 3:
                        //****************************************************
                        // ランキング登録
                        //****************************************************
                        if(touch)
                        {
                            message.set("らんきんく゛に　とうろく");
                            state++;
                            touch = false;
                        }
                        break;
                    case 4:
                        //****************************************************
                        // 名前入力
                        //****************************************************
                        if(touch)
                        {
                            background.blackout(0.5);
                            message.set(office.name);
                            for(var i = 0; i < worker.length; i++)
                            {
                                worker[i].clear();
                            }
                            for(var i = 0; i < button.length; i++)
                            {
                                button[i].clear();
                            }
                            var kana = "わらやまはなたさかあ" +
                                       "をりゆみひにちしきい" +
                                       "んるよむふぬつすくう" +
                                       "゛れっめへねてせけえ" +
                                       "゜ろ－もほのとそこお";
                            for(var i = 0; i < input.length - 2; i++)
                            {
                                input[i].set(i % 10 * 48 + 0, Math.floor(i / 10) * 48 + 80, kana.charAt(i));
                            }
                            input[input.length - 2].set(8, 24, "消")
                            input[input.length - 1].set(424, 24, "完")
                            state++;
                            touch = false;
                        }
                        break;
                    case 5:
                        //****************************************************
                        // 入力判定
                        //****************************************************
                        var character = "";
                        for(var i = 0; i < input.length; i++)
                        {
                            character = input[i].isTouch()
                            if(character == "完")
                            {
                                if(office.name != "")
                                {
                                    state++;
                                }
                                break;
                            }
                            else if(character == "消")
                            {
                                if(office.name != "")
                                {
                                    office.name = office.name.substr(0, office.name.length - 1);
                                }
                                break;
                            }
                            else if(character != "")
                            {
                                if(office.name.length < 10)
                                {
                                    office.name += character;
                                }
                                break;
                            }
                        }
                        if(state == 6)
                        {
                            for(var i = 0; i < input.length - 1; i++)
                            {
                                input[i].clear();
                            }
                            message.clear();
                            input[0].set(8, 248, "左");
                            input[1].set(424, 248, "右");
                            ranking.set([]);
                            server.socket.emit("regist", office.name, office.yosan);
                            touch = false;
                        }
                        else
                        {
                            message.set(office.name);
                        }
                        break;
                    case 6:
                        //****************************************************
                        // サーバ通信
                        //****************************************************
                        if(game.frame % game.fps == 0)
                        {
                            server.count++;
                            if(server.count >= 3)
                            {
                                //alert("サーバとの通信に失敗しました。");
                                ranking_data = ["つうしんに　しっは゜い　しました"];
                                server.ranking = [];
                                server.registered = false;
                                server.received = true;
                                for(var i = 0; i < input.length; i++)
                                {
                                    input[i].isTouch();
                                }
                            }
                            if(server.registered)
                            {
                                // ランキング登録完了
                                server.page = 0;
                                server.socket.emit("get", server.page);
                                server.registered = false;
                                server.count = 0;
                            }
                            else if(server.received)
                            {
                                // ランキング取得完了
                                var no = server.page * 15 + 1;
                                var data = [];
                                for(var i = 0; i < server.ranking.length; i++)
                                {
                                    data[i] = lpad(zenkaku(no), 3, "０") + "　" + rpad(zenkaku(server.ranking[i].name), 10, "　") + "　" + lpad(zenkaku(server.ranking[i].score), 4, "　");
                                    no++;
                                }
                                if(data.length > 0)
                                {
                                    ranking.set(data);
                                    ranking_data = data;
                                    page = server.page;
                                }
                                else
                                {
                                    ranking.set(ranking_data);
                                    server.page = page;
                                }
                                server.received = false;
                                server.count = 0;
                                state++;
                            }
                        }
                        break;
                    case 7:
                        //****************************************************
                        // ランキング画面
                        //****************************************************
                        var character = "";
                        for(var i = 0; i < input.length; i++)
                        {
                            character = input[i].isTouch()
                            if(character == "左")
                            {
                                if(server.page > 0) server.page--;
                                ranking.set([]);
                                server.socket.emit("get", server.page);
                                server.registered = false;
                                server.count = 0;
                                state--;
                                break;
                            }
                            else if(character == "右")
                            {
                                if(server.page < 67) server.page++;
                                ranking.set([]);
                                server.socket.emit("get", server.page);
                                server.registered = false;
                                server.count = 0;
                                state--;
                                break;
                            }
                            else if(character == "完")
                            {
                                state = 9;
                                break;
                            }
                        }
                        if(state == 9)
                        {
                            for(var i = 0; i < input.length; i++)
                            {
                                input[i].clear();
                            }
                            background.setGameClear();
                            background.blackout(0);
                            budget.clear();
                            manhour.clear();
                            ranking.clear();
                            touch = false;
                        }
                        break;
                    case 8:
                        //****************************************************
                        // ゲームオーバー
                        //****************************************************
                        if(touch)
                        {
                            background.setGameOver();
                            message.clear();
                            budget.clear();
                            manhour.clear();
                            for(var i = 0; i < worker.length; i++)
                            {
                                worker[i].clear();
                            }
                            for(var i = 0; i < button.length; i++)
                            {
                                button[i].clear();
                            }
                            state++;
                            touch = false;
                        }
                        break;
                    case 9:
                        //****************************************************
                        // スタートに戻る
                        //****************************************************
                        if(touch)
                        {
                            background.setTitle();
                            state = 0;
                            touch = false;
                        }
                        break;
                }
            });
            return scene;
        };
        game.replaceScene(createScene());
    }
    // ゲーム開始
    game.start();
}

/**
 * 乱数取得
 */
function rand(min, max)
{
    if(min > max)
    {
        max = min;
    }
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

/**
 * 文字埋め（右側）
 */
function rpad(val, len, chr)
{
    for(var i = 0; i < len; i++)
    {
        val = val + chr;
    }
    return val.substr(0, len);
}

/**
 * 文字埋め（左側）
 */
function lpad(val, len, chr)
{
    for(var i = 0; i < len; i++)
    {
        val = chr + val;
    }
    return val.substr(val.length - len, len);
}

/**
 * 全角変換
 */
function zenkaku(val)
{
    return String(val).replace(/[!-~]/g, function(all)
    {
        return String.fromCharCode(all.charCodeAt(0) + 0xFEE0);
    });
}

/**
 * 画面サイズ更新
 */
function orientationChange(game)
{
    var scaleWidth = window.innerWidth / game.width;
    var scaleHeight = window.innerHeight / game.height;
    var orientation = "";
    var scale = 0;
    if(scaleWidth < scaleHeight)
    {
        orientation = "portrait";
        scale = scaleWidth;
    }
    else
    {
        orientation = "landscape";
        scale = scaleHeight;
    }
    var width = game.width * scale;
    var height = game.height * scale;
    var transformKey = "-" + enchant.ENV.VENDOR_PREFIX + "-transform";
    var stage = document.getElementById("enchant-stage");
    for(var i = 0; i < stage.children.length; i++)
    {
        if(stage.children[i].nodeName == "DIV")
        {
            stage.children[i].style.cssText += transformKey + ": scale(" + scale + ")";
            break;
        }
    }
    var top = 0;
    var left = 0;
    if(orientation == "portrait")
    {
        top = (window.innerHeight - height) * 0.5;
    }
    else
    {
        left = (window.innerWidth - width) * 0.5;
    }
    stage.style.width = width;
    stage.style.height = height;
    stage.style.position = 'absolute';
    stage.style.left = left + "px";
    stage.style.top = top + "px";
    game.scale = scale;
    game._pageX = left;
    game._pageY = top;
    window.scrollTo(0, 0);
}
