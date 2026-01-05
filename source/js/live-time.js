(function () {
  // 1. 补零
  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  // 2. 获取时间字符串
  function getTimeString() {
    var now = new Date();
    var y = now.getFullYear();
    var m = pad(now.getMonth() + 1);
    var d = pad(now.getDate());
    var hh = pad(now.getHours());
    var mm = pad(now.getMinutes());
    var ss = pad(now.getSeconds());

    return y + '年' + m + '月' + d + '日 ' + hh + ':' + mm + ':' + ss;
  }

  // 3. 打字机效果函数（核心）
  function typeOnce(el, str, speed, callback) {
    var i = 0;
    el.innerText = ''; // 清空内容准备打字
    var timer = setInterval(function () {
      // 每次多显示一个字符
      el.innerText = str.slice(0, i + 1);
      i++;
      
      // 如果打完了
      if (i >= str.length) {
        clearInterval(timer);
        // 执行回调（打字打完了，该干嘛干嘛）
        if (typeof callback === 'function') {
          callback();
        }
      }
    }, speed);
  }

  // 4. 启动逻辑
  function start() {
    // 轮询检测元素是否存在
    var checkTimer = setInterval(function() {
      var el = document.getElementById('live-time');

      if (el) {
        clearInterval(checkTimer); // 找到了，停止寻找

        // === 这里开始表演 ===
        // 1. 获取当前时间
        var firstStr = getTimeString();
        
        // 2. 执行打字机动画 (70ms 打一个字，比较流畅)
        typeOnce(el, firstStr, 70, function() {
          
          // 3. 动画结束后，开启每秒更新
          setInterval(function () {
            el.innerText = getTimeString();
          }, 1000);
          
        });
      }
    }, 200);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start);
  }
})();