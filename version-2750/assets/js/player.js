import { H as Hls } from "./hls.js";

function bindPlayer(wrapper) {
  var video = wrapper.querySelector("video");
  var button = wrapper.querySelector(".play-button");
  var overlay = wrapper.querySelector(".player-overlay");
  var status = wrapper.querySelector(".player-status");
  var source = video ? video.getAttribute("data-src") : "";
  var initialized = false;
  var hls = null;

  if (!video || !button || !source) {
    return;
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function initialize() {
    if (initialized) {
      return;
    }

    initialized = true;
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      setStatus("已加载高清播放源");
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setStatus("播放源加载异常，请稍后重试");
        }
      });
      setStatus("已启用 HLS 高清播放");
      return;
    }

    video.src = source;
    setStatus("当前浏览器将尝试直接播放该片源");
  }

  function play() {
    initialize();
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        setStatus("点击视频区域即可继续播放");
      });
    }
  }

  button.addEventListener("click", function (event) {
    event.preventDefault();
    play();
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.style.display = "none";
    }
    setStatus("正在播放");
  });

  video.addEventListener("pause", function () {
    if (overlay && !video.ended) {
      overlay.style.display = "grid";
    }
    setStatus("已暂停，点击播放按钮继续观看");
  });

  video.addEventListener("ended", function () {
    if (overlay) {
      overlay.style.display = "grid";
    }
    setStatus("播放结束");
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-video-player]").forEach(bindPlayer);
});
