function initMoviePlayer(source) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    var button = document.querySelector(".play-now");
    var hlsInstance = null;
    var started = false;

    function attach() {
        if (!video || !source || started) {
            return;
        }
        started = true;
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = source;
        video.play().catch(function () {});
    }

    if (overlay) {
        overlay.addEventListener("click", attach);
    }
    if (button) {
        button.addEventListener("click", attach);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (!started) {
                attach();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
}
