# 模仿讯飞语音后台的功能

对字幕文件进行操作 合并行 分割行 对应视频播放等功能
使用gulp对代码进行了简单的压缩

input输入框的开始位置按删除键 会将当前数据和上一条数据合并  并生成新的时间节点  

input输入框中间部分 按回车键  会讲当前数据分割为两条 并按照文字长度进行时间点分割  

点击时间点 video跳转到指定的位置  

代码全部以ES6标准实现  通过gulp打包为ES5  

![demo图](https://github.com/loveburning/subtitles/blob/master/images/demo.png)

****

本代码由JS小菜狗制作 
欢迎大佬指点
菜狗QQ:923398776
