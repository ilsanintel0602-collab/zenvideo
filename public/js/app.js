document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topic');
    const passcodeInput = document.getElementById('passcode');
    const durationInput = document.getElementById('duration');
    const generateBtn = document.getElementById('generate-btn');

    // 상영시간 버튼 선택
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            durationInput.value = btn.dataset.value;
        });
    });
    const setupForm = document.getElementById('setup-form');
    const statusPanel = document.getElementById('status-panel');
    const resultPanel = document.getElementById('result-panel');
    const statusText = document.getElementById('status-text');
    const progressBar = document.getElementById('progress-bar');
    const detailText = document.getElementById('detail-text');
    const resetBtn = document.getElementById('reset-btn');

    let pollInterval = null;

    generateBtn.addEventListener('click', async () => {
        const topic = topicInput.value.trim();
        const passcode = passcodeInput.value.trim();
        const duration = parseInt(durationInput.value) || 3;

        if (!topic || !passcode) {
            alert('주제와 패스코드를 모두 입력해주세요!');
            return;
        }

        // 1. UI 전환: 입력 폼 숨기고 상태 패널 표시
        setupForm.classList.add('hidden');
        statusPanel.classList.remove('hidden');
        updateStatus('AI 에이전트를 소집하고 있습니다...', 10);

        try {
            // 2. 백엔드에 생성 요청
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-gateway-passcode': passcode
                },
                body: JSON.stringify({ topic, passcode, duration })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || '생성 요청에 실패했습니다.');
            }

            // 3. 상태 추적 시작 (ID 확보)
            const renderId = data.renderId;
            startPolling(renderId, passcode);

        } catch (error) {
            showError(error.message);
        }
    });

    function startPolling(renderId, passcode) {
        updateStatus('영상을 조립하고 렌더링 중입니다...', 30);
        
        pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/status/${renderId}`, {
                    headers: { 'x-gateway-passcode': passcode }
                });
                const data = await response.json();

                if (data.status === 'done') {
                    stopPolling();
                    showResult(data.url);
                } else if (data.status === 'failed') {
                    stopPolling();
                    showError('서버 렌더링 중 오류가 발생했습니다.');
                } else {
                    // 진행률 업데이트
                    const pct = data.percentage || 30;
                    updateStatus(`걸작을 빚는 중... (${pct}%)`, pct);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 3000); // 3초마다 확인
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    function updateStatus(text, percentage) {
        statusText.innerText = text;
        progressBar.style.width = `${percentage}%`;
    }

    function showResult(url) {
        statusPanel.classList.add('hidden');
        resultPanel.classList.remove('hidden');
        
        const videoPreview = document.querySelector('.video-preview');
        videoPreview.innerHTML = `
            <video controls width="100%" style="border-radius: 8px;">
                <source src="${url}" type="video/mp4">
                브라우저가 비디오 재생을 지원하지 않습니다.
            </video>
        `;
        
        const downloadLink = document.getElementById('download-link');
        downloadLink.href = url;
    }

    function showError(message) {
        alert(`❌ 에러 발생: ${message}`);
        resetUI();
    }

    function resetUI() {
        stopPolling();
        statusPanel.classList.add('hidden');
        resultPanel.classList.add('hidden');
        setupForm.classList.remove('hidden');
        topicInput.value = '';
    }

    resetBtn.addEventListener('click', resetUI);
});
