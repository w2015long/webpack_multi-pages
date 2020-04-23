const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const glob = require('glob')

//css单独打包处理
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV !== 'production';


//动态添加入口
function getEntry(){
    //读取src目录所有pages入口
    return  glob.sync('./src/pages/**/*.js').reduce((pre,cur)=>{
        const start = cur.indexOf('src/') + 4;
        const end = cur.length - 3;
        const eArr = [];
        let n = cur.slice(start,end);
        n = n.split('/')[1];
        eArr.push(cur);
        //eArr.push('babel-polyfill');//引入这个，是为了用async await，一些IE不支持的属性能够受支持，兼容IE浏览器用的
        pre[n] = eArr;
        return pre;
    },{});

}


module.exports = {
    //指定打包环境
    mode:'development',
    entry:getEntry(),//入口文件
    output:{//出口文件相关配置
        //[name] chunk名称
        publicPath:'/',
        filename:"[name]-[hash:8]-bundle.js",
        path:path.resolve(__dirname,'./dist')
    },

    module:{//配置 所有第三方模块加载器
        rules:[//第三方模块匹配规则
            {test:/\.(le|c)ss$/i,use:[
                isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                'css-loader',
                'less-loader'
            ]},
            {//url-loader处理图片
                test:/\.(jpg|png|gif|jpeg|bmp)/i,
                use:[{
                    loader:'url-loader',
                    options:{
                        limit:10000,//limit值大于 引用的图片则图片被转成base64的字符串
                        name: 'static/images/[name].[hash:7].[ext]'
                    }
                }]
            },
            //处理icon字体文件
            {test:/\.(ttf|woff2|woff|eot|svg)\??.*$/i,use:'url-loader'},

            {//处理高级语法ES5/6/7
                test:/\.js$/,
                exclude:/(node_modules)/,
                use:{loader:'babel-loader'}
            },
            {test:/\.vue$/,loader:'vue-loader'},//vue loader
        ]
    },
    resolve:{//配置别名
        alias:{
            'vue$':path.resolve(__dirname,'node_modules/vue/dist/vue.min.js')
        }
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.HotModuleReplacementPlugin(),//热更新
        //时时清理更新后上一次文件
        new CleanWebpackPlugin(),
        //css单独打包处理
        new MiniCssExtractPlugin({
            filename:'css/[name].css',
        }),
    ],

    //启动一个服务器(webpack-dev-server)实时动态刷新页面
    devServer: {
        contentBase: './dist',
        publicPath:'/',
        port:3032,//服务运行的端口
        //跨域请求
        proxy: [{
            context: ['/user','/product','/cart','/order','/shopping','/payment'],
            target: 'http://localhost:3000/',
        }]    	
    }	
}



//配置页面
const entryObj = getEntry();
/*{
    index:['index.js'],
    demo:['demo.js'],
}*/

//动态生成html
//获取html-webpack-plugin参数的方法

const htmlArray = 
Object.keys(entryObj).reduce((pre,cur)=>{
    let templateStr = entryObj[cur][0];
    templateStr = templateStr.replace('.js','.html');
    
    pre.push({
        template:templateStr,
        filename:`pages/${cur}.html`,
        hash:false,
        chunks:[cur],
        inject:true,//脚本写在那个标签里,默认是true(在body结束后
    });

    return pre;

},[]);


//自动生成html模板
htmlArray.forEach(function(element){
    module.exports.plugins.push(new htmlWebpackPlugin(element));
})