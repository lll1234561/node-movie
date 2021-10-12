const { request, response } = require('express');
const fs = require('fs')
const session = require('express-session');
const express =require('express');
//获取电影的所有信息
const data = require('./data.json')
const {getMovieInfo,getAllTypes} = require('./helpers/util');
//引入body-parser
//引入随机生成颜色的包
const uniqolor = require('uniqolor')
var bodyParser = require('body-parser')

const app = express();
//静态资源服务
app.use(express.static( __dirname + '/public'))
app.use(express.urlencoded({ extended: false }))
//设置session中间件
app.use(session({
    //响应cookie的唯一的id键名
    name:'sid',
    secret:'21231321',
    resave:false,
    saveUninitialized: false
}));
//声明一个函数中间件
let checkLogin =function(request,response,next){
      //判断用户是否登陆
      if(request.session.email && request.session.id){
      
        next();
        }else{
            //如果没登陆 跳转登陆页面
            response.redirect('/login');
        }

}
//设置ejs
app.set('view engine','ejs');
app.set('views','./views');


app.get('/movie/:id.html',checkLogin,(request,response)=>{
    //电影的详细信息
    let id = request.params.id;
    let movieInfo =  getMovieInfo(id);
    const types = getAllTypes();
    response.render('detail',{movieInfo,types,request});
});

//显示所有的电影
app.get('/movies',(request,response)=>{
    let movies = data.movies.filter(item => {
        return item.name != ''
    });
    //根据类型筛选电影
    if(request.query.type){
        movies = movies.filter(item =>{
            return item.type === request.query.type
        })
    }
    //根据关键字筛选电影
    if(request.query.keywords){
        movies = movies.filter(item =>{
            return item.name.indexOf(request.query.keywords)!= -1;
        });
    }
    //获取所有的类型
    const types = getAllTypes();
    
    
    response.render('movie/list',{movies,uniqolor,types,request});
})
//用户注册
app.get('/register',(request,response)=>{
    //显示一个页面
    let types = getAllTypes();
    response.render('user/register',{types,request});
});
//新增规则 添加电影信息
app.get('/movie/create',checkLogin,(request,response)=>{
    let types = getAllTypes();
    //响应表单的内容 ejs
    response.render('movie/create',{types,request});
});
app.post('/movie',(request,response)=>{
    //对标签的属性进行拆分
    request.body.tags = request.body.tags.splist(',');
    //获取id对应的值
    request.body.id =  ++data.mid ;
    //将数据添加到data 的movies中
    data.movies.push(request.body)
    //将对象内容写入文件中
    fs.writeFile('./data.json',JSON.stringify(data),err => {
        if(err){
            response.status(500);
            response.send('创建失败')
            return;
        }
        response.send('ok')
    })
    //fs.writeFileSync('./data.json',JSON.stringify(data));
    console.log(request.body);
    response.send('f')
});
//添加用户
app.post('/register',(request,response)=>{
   console.log(request.body);
   //let userInfo = JSON.stringify(request.body);
   request.body.id = ++data.uid;
   //将用户的信息，压入到用户数组中
   data.users.push(request.body);
   //将data转化为JSON字符串
   let str = JSON.stringify(data);
   //写入文件
   fs.writeFile('./data.json',str,err=>{
       if(err){
           response.send('服务器内部错误');
           return;
       } 
        response.send('注册成功'); 
   })
 
});
//登录的表单
app.get('/login',(request,response)=>{
    let types = getAllTypes();
    response.render('user/login',{types,request});
});
//登录操作
app.post('/login',(request,response)=>{
    //获取表单中的数据
    let userInfo = request.body;
    let uid;
    let is_success = false;//标识变量，是否登录成功
    //将用户传递的信息,与所有的用户进行比对
    console.log(userInfo);
    for (let i = 0;i<data.users.length;i++){
        if(data.user[i].email === userInfo.email && data.user[i].password === userInfo.password){
            //设置uid
            uid = data.users[i].id;
            //用户输入的内容是正确的
            is_success = true;
            break;
        }
    }
    //根据是否登录成功 写入状态
    if(is_success){
        //成功
        request.session.email = userInfo.email;
        request.session.uid = uid;

       response.render('info/success',{types:getAllTypes(),request,msg:'登录'});
    }else{
        response.send('登录失败');
    }
    
})
app.listen(80,()=>{
    console.log('服务已启动...');
})