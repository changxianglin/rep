// node.js 使用 es6 特性套路
"use strict"

// 引入 request 和 cheerio
// request 用于下载网页
// cheerio 用于解析网页数据
const request = require('request')
const cheerio = require('cheerio')

// 电影类, 用于保存电影信息
const Movie = function() {
    this.name = ''
    this.score = 0
    this.quote = ''
    this.ranking = 0
    this.coverUrl = ''
}

const log = function() {
    console.log.apply(console, arguments)
}


const saveMovies = function(movies) {
    // 将一个保存了所有电影对象的数组转成 JSON 字符串并将其存入文件中
    const fs = require('fs')
    const path = 'douban.txt'
    // 第三个参数是 缩进层次
    const s = JSON.stringify(movies, null, 2)

    fs.writeFile(path, s, function(error){
        if (error !== null) {
            log('*** 写入文件错误 ', error)
        } else {
            log('--- 保存成功')
        }
    })
}

const moviesFromDiv = function(div) {
    // 从一个电影的 Div 中取出所需的信息
    const movie = new Movie()
    // 使用 cheerio.load 获取一个可以查询的对象
    const e = cheerio.load(div)

    movie.name = e('.title').text()
    movie.score = e('.rating_num').text()
    movie.quote = e('.inq').text()

    const pic = e('.pic')
    movie.ranking = pic.find('em').text()
    // 元素的属性用 .attr('属性名') 确定
    movie.coverUrl = pic.find('img').attr('src')

    return movie
}

const moviesFromUrl = function(url, movies) {
    // 从一个 url 中获取所需的 div 并调用回调函数
    request(url, function(error, response, body){
        // 回调函数的三个参数分别是 错误, 响应, 响应数据
        // 检查请求是否成功, statusCode === 200 是成功代码
        if (error === null && response.statusCode === 200) {
            // cheerio.load 用字符串作为参数返回一个可以查询的特殊对象
            const e = cheerio.load(body)

            const movieDivs = e('.item')
            for (let i = 0; i < movieDivs.length; i++) {
                let element = movieDivs[i]
                const div = e(element).html()
                const m = moviesFromDiv(div)
                movies.push(m)
            }
            // 保存 movies 数组到文件中
            saveMovies(movies)
        } else {
            log('*** ERROR 请求失败 ', error)
        }
    })
}

const __main = function() {
    const movies = []
    const path = 'http://movie.douban.com/top250'
    for (let i = 0; i <= 225; i+=25) {
        let url = path + `?start=${i}&filter=`
        log('url :', url)
        moviesFromUrl(url, movies)
    }
}

__main()
