const data = require('../data.json');
//封装函数 根据id 返回id 电影的信息
function getMovieInfo(id){

    for(let i = 0;i<data.movies.length;i++){
        if(Number(id) === data.movies[i].id){
            return data.movies[i];
        }
    }
    return false;
}
function getAllTypes(){
    //获取所有的电影的类型
    const types = new Set();
    data.movies.forEach(item =>{
        types.add(item.type);
    });
    return types;
}

module.exports = {
    getMovieInfo,
    getAllTypes
};