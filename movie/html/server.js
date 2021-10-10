const { request, response } = require('express');
const fs = require('fs')
const express =require('express');
//获取电影的所有信息
const data = require('./data.json')
//引入body-parser
//引入随机生成颜色的包
const uniqolor = require('uniqolor')
var bodyParser = require('body-parser')
//封装函数 根据id 返回id 电影的信息
function getMovieInfo(id){

    for(let i = 0;i<data.movies.length;i++){
        if(Number(id) === data.movies[i].id){
            return data.movies[i];
        }
    }
    return false;
}
const app = express();
//静态资源服务
app.use(express.static( __dirname + '/public'))
app.use(express.urlencoded({ extended: false }))
//设置ejs
app.set('view engine','ejs');
app.set('views','./views');


app.get('/movie/:id.html',(request,response)=>{
    //电影的详细信息
    let id = request.params.id;
    let movieInfo =  getMovieInfo(id);
    response.render('detail',{movieInfo});
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
    //获取所有的电影的类型
    const types = new Set();
    data.movies.forEach(item =>{
        types.add(item.type);
    });
    response.render('movie/list',{movies,uniqolor,types,request});
})

//新增规则 添加电影信息
app.get('/movie/create',(request,response)=>{
    //响应表单的内容 ejs
    response.render('movie/create');
})
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
app.listen(80,()=>{
    console.log('服务已启动...');
})