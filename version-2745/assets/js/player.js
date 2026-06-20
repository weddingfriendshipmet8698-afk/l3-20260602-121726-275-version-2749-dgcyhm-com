(function () {
  const video = document.querySelector('.stream-video');
  const player = document.querySelector('.player-card');
  const overlay = document.querySelector('.player-overlay');

  if (!video || !player || !overlay || typeof currentStream !== 'string' || !currentStream) {
    return;
  }

  let attached = false;
  let instance = null;
  let ready = null;

  function attach() {
    if (attached) {
      return ready || Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = currentStream;
      attached = true;
      ready = Promise.resolve();
      return ready;
    }

    if (window.Hls && Hls.isSupported()) {
      instance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      ready = new Promise(function (resolve) {
        let done = false;
        function finish() {
          if (!done) {
            done = true;
            resolve();
          }
        }
        instance.on(Hls.Events.MANIFEST_PARSED, finish);
        instance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            finish();
          }
        });
        window.setTimeout(finish, 1200);
      });
      instance.loadSource(currentStream);
      instance.attachMedia(video);
      attached = true;
      return ready;
    }

    video.src = currentStream;
    attached = true;
    ready = Promise.resolve();
    return ready;
  }

  function play() {
    player.classList.add('is-playing');
    attach().then(function () {
      const action = video.play();

      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    });
  }

  overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (instance) {
      instance.destroy();
    }
  });
})();
