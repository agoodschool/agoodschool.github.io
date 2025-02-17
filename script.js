document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.querySelector('.add-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const bgImageBtn = document.querySelector('.bg-image-btn');
    const backgroundLayer = document.querySelector('.background-layer');
    const lyricsDisplay = document.querySelector('.lyrics-display');
    const lyricsModal = document.querySelector('.lyrics-modal');
    const lyricsInput = document.getElementById('lyrics-input');
    const submitLyricsBtn = document.getElementById('submit-lyrics');
    const cancelLyricsBtn = document.getElementById('cancel-lyrics');
    const cardTitle = document.querySelector('.card-title');
    const wordWo = cardTitle.querySelector('.word-wo');
    const wordWang = cardTitle.querySelector('.word-wang');
    const wordWangEnd = cardTitle.querySelector('.word-wang-end');

    // 音频相关元素
    const audioElement = document.getElementById('song-audio');
    const audioControls = document.querySelector('.audio-controls');
    const playPauseBtn = document.querySelector('.play-pause-btn');
    const audioProgress = document.querySelector('.audio-progress');
    const currentTimeSpan = document.querySelector('.current-time');
    const totalTimeSpan = document.querySelector('.total-time');

    // 切换下拉菜单
    addBtn.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
    });

    // 点击其他区域关闭下拉菜单
    document.addEventListener('click', (event) => {
        if (!addBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // 添加背景图
    bgImageBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                backgroundLayer.style.backgroundImage = `url(${event.target.result})`;
                dropdownMenu.classList.remove('show');
            };
            
            reader.readAsDataURL(file);
        };
        fileInput.click();
    });

    // 点击添加音频按钮
    document.querySelector('.audio-btn').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'audio/*';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            const audioURL = URL.createObjectURL(file);
            audioElement.src = audioURL;
            
            // 更新卡片标题为音频文件名
            wordWangEnd.textContent = `我 - ${file.name}`;
            
            // 显示音频控制器
            audioControls.style.display = 'flex';
            dropdownMenu.classList.remove('show');

            // 加载音频元数据后设置总时长
            audioElement.addEventListener('loadedmetadata', () => {
                const totalMinutes = Math.floor(audioElement.duration / 60);
                const totalSeconds = Math.floor(audioElement.duration % 60);
                totalTimeSpan.textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
            });
        };
        fileInput.click();
    });

    // 播放/暂停按钮
    playPauseBtn.addEventListener('click', () => {
        if (audioElement.paused) {
            audioElement.play();
            playPauseBtn.textContent = '⏸️';
        } else {
            audioElement.pause();
            playPauseBtn.textContent = '▶️';
        }
    });

    // 更新进度条和当前时间
    audioElement.addEventListener('timeupdate', () => {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        audioProgress.value = progress;

        const currentMinutes = Math.floor(audioElement.currentTime / 60);
        const currentSeconds = Math.floor(audioElement.currentTime % 60);
        currentTimeSpan.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
    });

    // 进度条拖动
    audioProgress.addEventListener('input', () => {
        const time = (audioProgress.value / 100) * audioElement.duration;
        audioElement.currentTime = time;
    });

    // 歌词模态框
    document.querySelector('.lyrics-btn').addEventListener('click', () => {
        lyricsModal.style.display = 'flex';
        dropdownMenu.classList.remove('show');
    });

    // 提交歌词
    submitLyricsBtn.addEventListener('click', () => {
        const lyrics = lyricsInput.value.trim().split('\n');
        lyricsDisplay.innerHTML = lyrics.map((line, index) => 
            `<div class="lyric-line" data-index="${index}">${line}</div>`
        ).join('');
        
        // 添加点击放大功能
        const lyricLines = document.querySelectorAll('.lyric-line');
        lyricLines.forEach(line => {
            line.addEventListener('click', () => {
                // 移除所有行的active状态
                lyricLines.forEach(l => l.classList.remove('active'));
                // 给当前点击行添加active状态
                line.classList.add('active');
            });
        });

        // 如果歌词行数超过10行，启用滚动
        if (lyrics.length > 10) {
            lyricsDisplay.classList.add('scrollable');
        } else {
            lyricsDisplay.classList.remove('scrollable');
        }
        
        lyricsModal.style.display = 'none';
        lyricsInput.value = '';
    });

    // 取消歌词
    cancelLyricsBtn.addEventListener('click', () => {
        lyricsModal.style.display = 'none';
        lyricsInput.value = '';
    });
}); 