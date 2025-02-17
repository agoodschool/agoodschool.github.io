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

    // 录屏相关变量
    const recordBtn = document.querySelector('.record-btn');
    let mediaRecorder;
    let recordedChunks = [];
    let isRecording = false;
    let recordedVideos = []; // 存储录制的视频
    
    // 添加回放容器
    const playbackContainer = document.createElement('div');
    playbackContainer.className = 'playback-container';
    playbackContainer.innerHTML = `
        <div class="playback-header">
            <span>录制回放</span>
            <button class="close-playback">×</button>
        </div>
        <div class="playback-content">
            <video id="playback-video" controls></video>
        </div>
    `;
    document.body.appendChild(playbackContainer);

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

    // 录屏功能
    recordBtn.addEventListener('click', async () => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        if (!isRecording) {
            try {
                if (isMobile) {
                    // 显示录屏指导弹窗
                    const guideModal = document.createElement('div');
                    guideModal.className = 'guide-modal';
                    guideModal.innerHTML = `
                        <div class="guide-content">
                            <h3>录屏指南</h3>
                            ${isIOS ? `
                                <p>1. 从屏幕顶部下滑打开控制中心</p>
                                <p>2. 点击录屏按钮开始录制</p>
                                <p>3. 等待3秒倒计时后开始录制</p>
                                <p>4. 完成后点击状态栏红色按钮停止录制</p>
                            ` : `
                                <p>1. 从屏幕顶部下滑打开快捷设置</p>
                                <p>2. 找到"录屏"或"屏幕录制"按钮</p>
                                <p>3. 点击开始录制</p>
                                <p>4. 录制完成后从顶部下滑点击停止</p>
                            `}
                            <div class="guide-buttons">
                                <button class="start-record">开始录制</button>
                                <button class="cancel-record">取消</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(guideModal);

                    // 添加按钮事件
                    const startBtn = guideModal.querySelector('.start-record');
                    const cancelBtn = guideModal.querySelector('.cancel-record');
                    
                    startBtn.addEventListener('click', () => {
                        guideModal.remove();
                        // 尝试调用系统录屏
                        if (isIOS) {
                            alert('请从屏幕顶部下滑打开控制中心，点击录屏按钮开始录制');
                        } else {
                            alert('请从屏幕顶部下滑打开快捷设置，找到"录屏"按钮开始录制');
                        }
                    });
                    
                    cancelBtn.addEventListener('click', () => {
                        guideModal.remove();
                    });
                } else {
                    // 桌面设备录屏设置
                    screenStream = await navigator.mediaDevices.getDisplayMedia({
                        video: {
                            cursor: 'never',
                            displaySurface: 'monitor'
                        },
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            sampleRate: 44100,
                            suppressLocalAudioPlayback: false
                        }
                    });

                    // 尝试获取麦克风权限
                    let micStream;
                    try {
                        micStream = await navigator.mediaDevices.getUserMedia({
                            audio: {
                                echoCancellation: true,
                                noiseSuppression: true,
                                sampleRate: 44100
                            }
                        });
                    } catch (micErr) {
                        console.warn("无法获取麦克风权限:", micErr);
                        // 继续录制，但只有系统声音
                    }

                    // 合并音频轨道
                    const audioContext = new AudioContext();
                    const destination = audioContext.createMediaStreamDestination();
                    
                    // 添加系统音频
                    if (screenStream.getAudioTracks().length > 0) {
                        const systemSource = audioContext.createMediaStreamSource(screenStream);
                        systemSource.connect(destination);
                    }
                    
                    // 添加麦克风音频（如果有）
                    if (micStream) {
                        const micSource = audioContext.createMediaStreamSource(micStream);
                        micSource.connect(destination);
                    }

                    const tracks = [
                        ...screenStream.getVideoTracks(),
                        ...destination.stream.getAudioTracks()
                    ];
                    const combinedStream = new MediaStream(tracks);

                    // 使用兼容的编码格式
                    const mimeType = 'video/webm;codecs=h264,opus';
                    
                    mediaRecorder = new MediaRecorder(combinedStream, {
                        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm'
                    });
                    
                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            recordedChunks.push(event.data);
                        }
                    };
                    
                    mediaRecorder.onstop = () => {
                        const blob = new Blob(recordedChunks, {
                            type: 'video/webm'
                        });
                        recordedChunks = [];
                        
                        // 保存到本地存储
                        const videoUrl = URL.createObjectURL(blob);
                        recordedVideos.push({
                            url: videoUrl,
                            timestamp: new Date().toLocaleString()
                        });
                        
                        // 显示回放界面
                        const video = document.getElementById('playback-video');
                        video.src = videoUrl;
                        playbackContainer.style.display = 'block';
                        
                        // 清理
                        tracks.forEach(track => track.stop());
                        audioContext.close();
                    };
                    
                    mediaRecorder.start();
                    isRecording = true;
                    recordBtn.textContent = '';
                    recordBtn.classList.add('recording');
                    
                    screenStream.getVideoTracks()[0].onended = () => {
                        if (isRecording) {
                            mediaRecorder.stop();
                            isRecording = false;
                            recordBtn.textContent = '录';
                            recordBtn.classList.remove('recording');
                        }
                    };
                    
                    // 添加错误处理
                    screenStream.oninactive = () => {
                        if (isRecording) {
                            mediaRecorder.stop();
                            isRecording = false;
                            recordBtn.textContent = '录';
                            recordBtn.classList.remove('recording');
                        }
                    };
                }
            } catch (err) {
                console.error("录屏错误:", err);
                alert('无法启动录屏，请尝试使用系统自带的录屏功能');
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            recordBtn.textContent = '录';
            recordBtn.classList.remove('recording');
        }
        
        dropdownMenu.classList.remove('show');
    });

    // 关闭回放界面
    document.querySelector('.close-playback').addEventListener('click', () => {
        playbackContainer.style.display = 'none';
    });
}); 