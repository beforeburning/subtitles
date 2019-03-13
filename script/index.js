/**
 User: burning <923398776@qq.com>
 Date: 2019年02月27日
 */
// ajax封装
const ajax = (id, url, callback) => {
  const data = `id=${id}`;
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200)
      callback(xhr.response);
  };
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send(data);
};

// dom操作封装
const DomClass = e => document.getElementsByClassName(e)[0];
const DomId = e => document.getElementById(e);

// 时长转秒
const conversion = e => {
  let sp1 = e.split(',');
  let sp2 = sp1[0].split(':');
  return parseFloat(`${parseInt(sp2[1]) * 60 + parseInt(sp2[2])}.${sp1[1]}`);
};

// 点击时长video跳转到对应位置
const audioTime = e => {
  DomId('video').currentTime = conversion(e);
  DomId('video').play();
};

// 三位小数补全
const completion = (e = '0') => {
  return e.substring(0, 3).length === 3 ? e.substring(0, 3) :
    (e.substring(0, 3).length === 2 ? `${e.substring(0, 3)}0` :
      (e.substring(0, 3).length === 1 ? `${e.substring(0, 3)}00` : e));
};

// 时间换算
const MillisecondToDate = msd => {
  let time = parseFloat(msd) / 1000;
  if (time <= 60) {
    let sp = time.toString().split('.');
    return `00:00:${sp[0] <= 9 ? `0${sp[0]}` : sp[0]},${completion(sp[1])}`;
  } else {
    let minutes = parseInt((time / 60).toString().split('.')[0]);
    let sp = (time - minutes * 60).toString().split('.');
    return `00:${minutes <= 59 ? `0${minutes}` : minutes}:${sp[0] <= 9 ? `0${sp[0]}` : sp[0]},${completion(sp[1])}`;
  }
};

// 时间分割 返回分割后第一条数据的结束时间 第二条数据的开始时间是第一条数据的结束时间
const newTime = (timeStart, intervalPrev) => MillisecondToDate(timeStart + intervalPrev);

// 总数据
let set = [];

// 方法开始
window.onload = () => {
  (() => {
    localStorage.setItem('video', false);
    // 获取数据的id 请求数据
    let dataId = DomClass('table').dataset.id;
    if (!dataId) {
      alert('ID错误,请联系管理员查看');
      return false;
    }
    // video dom
    let video = DomId('video');
    // 拿到数据
    ajax(dataId, dataAjaxUrl, res => {
      // 数据处理
      let data = JSON.parse(res);
      data.data.forEach(item => {
        let text = item.time.split('-->');
        let arr = {
          start: text[0].replace(/\s+/g, ''),
          end: text[1].replace(/\s+/g, ''),
          text: item.text
        };
        set.push(arr);
      });
      // 数据处理完成
      drawing();
      // 监听视频播放
      video.addEventListener('play', () => {
        localStorage.setItem('video', true);
        highlighted();
      });
      // 监听视频暂停 停止计时器
      video.addEventListener('pause', () => {
        localStorage.setItem('video', false);
        clearTimeout(window.timing);
      });
    });
  })();
};

// 数据渲染
const drawing = () => {
  let Dom = ``;
  set.forEach((item, idx) => {
    let str = `
      <div class='line'>
        <div class='serial'>${++idx}</div>
        <div class='start'>${item.start}</div>
        <div class='end'>${item.end}</div>
        <input class='text' data-id='${idx}' type='text' value='${item.text}' />
      </div>
    `;
    Dom += str;
  });
  DomClass('table').innerHTML = Dom;
  // 初始数据渲染完成 开始监听dom
  Listening();
  // 触发字幕更新
  if (localStorage.getItem('video') === 'true') {
    clearTimeout(window.timing);
    highlighted();
  }
};

// 事件添加和监听
const Listening = () => {
  // 给所有的时间添加方法 点击跳转录音到对应时间
  for (let item of DomClass('table').children) {
    item.children[1].onclick = e => audioTime(e.target.innerHTML);
    item.children[2].onclick = e => audioTime(e.target.innerHTML);
    item.children[3].onfocus = e => {
      // 获取光标位置
      document.onkeydown = event => {
        let keyboard = event || window.event;
        // 文本长度
        let textlength = e.target.value.length;
        // 输入框光标开始位置
        let keyStart = keyboard.target.selectionStart;
        // 输入框光标结束位置
        let keyEnd = keyboard.target.selectionEnd;
        // 数据的ID 对应数组下标
        let dataId = parseInt(e.target.dataset.id);
        // 当前数据的值
        let currentData = e.target.value;

        // 合并
        if (keyboard && keyboard.keyCode === 8 && keyStart === 0 && dataId - 1 !== 0 &&
          // 如果input值为空 或者 删除内容的开始到结尾的长度不等于内容长度
          (textlength === 0 || keyEnd - keyStart !== textlength)) {
          // 上一条数据的input value值
          let prevData = e.path[1].previousElementSibling.children[3].value;
          // 获取当前和上一条的数据
          let current = set[dataId - 1];
          let prev = set[dataId - 2];
          // 修改下一条数据的值为新数据
          set[dataId - 2] = {
            start: prev.start,
            end: current.end,
            text: `${prevData}${currentData}`
          };
          // 删除当前数据
          set.splice(dataId - 1, 1);
          drawing(set);
        }

        // 换行
        if (keyboard && keyboard.keyCode === 13 && textlength !== 0 && keyStart !== 0 && keyStart !== textlength) {
          // 光标距离最后一个字的距离
          let distance = textlength - keyStart;
          // 开始时间
          let timeStart = conversion(set[dataId - 1].start) * 1000;
          // 结束时间
          let timeEnd = conversion(set[dataId - 1].end) * 1000;
          // 当前数据 用时
          let time = timeEnd - timeStart;
          // 第一行文字 用时占比
          let stertProportion = parseInt(keyStart / textlength * time);
          // 第二行文字 用时占比
          let endProportion = parseInt(distance / textlength * time);
          // 时间分割
          let timeRes = newTime(timeStart, stertProportion);
          // 光标之前的文字
          let cursorTextNext = e.target.value.substring(0, keyboard.target.selectionStart);
          // 光标之后的文字
          let cursorTextPrev = e.target.value.substring(keyboard.target.selectionStart);
          // 添加一条新数据
          let newArrData = {
            start: timeRes,
            end: set[dataId - 1].end,
            text: cursorTextPrev
          };
          // 修改当前数据为新数据
          set[dataId - 1] = {
            start: set[dataId - 1].start,
            end: timeRes,
            text: cursorTextNext
          };
          set.splice(dataId, 0, newArrData);
          drawing();
        }
      };
    };
    // input失去焦点 清空键盘事件 发新的数据传给数据提交方法
    item.children[3].onblur = () => {
      document.onkeydown = event => {
        let keyboard = event || window.event;
        if (keyboard && keyboard.keyCode === 8) {
        }
        if (keyboard && keyboard.keyCode === 13) {
        }
      };
      dataSubmit();
    }
  }

  // 数据初始化结束
  DomClass('loading').style.display = 'none';
};

// ajax 数据提交
const dataSubmit = () => {
  if (set) {
    // 获取数据的id 请求数据
    let str = {
      id: DomClass('table').dataset.id,
      data: set
    };
    DomId('btn').onclick = () => {
      ajax(JSON.stringify(str), dataSubmitUrl, res => {
        let data = JSON.parse(res);
        if (data.state) {
          console.log(data.msg);
        }
      });
    }
  }
};

// 视频监听 字幕高亮
const highlighted = () => {
  let video = DomId('video');
  let arr = set.map(item => conversion(item.start) * 1000);
  let table = DomClass('table').children;
  // 监听视频开始播放了
  window.timing = window.setInterval(() => {
    let times = video.currentTime * 1000;
    let list = 0;
    arr.map((item, idx) => {
      if (item < times) {
        list = idx;
      }
    });
    for (let i = 0; i < table.length; i++) {
      if (i === list) {
        table[i].classList.add('highlighted');
      } else {
        table[i].classList.remove('highlighted');
      }
    }
  }, 500)
};
