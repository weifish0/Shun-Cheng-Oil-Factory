// 產品故事頁面 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // 載入動畫
    function initLoadAnimation() {
        const journeySteps = document.querySelectorAll('.journey-step');
        const organicCards = document.querySelectorAll('.organic-info-card');
        
        // 觀察器設定
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // 觀察所有需要動畫的元素
        journeySteps.forEach(step => {
            const card = step.querySelector('.step-card');
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(card);
            }
        });
        
        organicCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
    
    // 初始化動畫
    setTimeout(initLoadAnimation, 100);
    
    // 觸控優化
    function initTouchOptimization() {
        const cards = document.querySelectorAll('.step-card, .organic-info-card');
        
        cards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            card.addEventListener('touchend', function() {
                this.style.transform = '';
            }, { passive: true });
        });
    }
    
    // 初始化觸控優化
    initTouchOptimization();
    
    console.log('🌾 產品故事頁面已載入');
    console.log('📱 響應式設計已啟用');
    console.log('�� 時間線動畫已初始化');
});

// AI客服懸浮按鈕與對話視窗互動
(function() {
  const fab = document.getElementById('aiChatbotFab');
  const windowEl = document.getElementById('aiChatbotWindow');
  const closeBtn = document.getElementById('aiChatbotClose');
  const form = document.getElementById('aiChatbotForm');
  const input = document.getElementById('aiChatbotInput');
  const messages = document.getElementById('aiChatbotMessages');

  // 對話歷史
  let chatHistory = [
    { role: 'system', content: 'You are a helpful assistant. 你是一個樂於助人的助手。' }
  ];

  // 客製化 system_prompt
  const systemPrompt = `你是順成油廠AI客服助手「小成」。請以友善、專業的專家身份，用繁體中文回答顧客關於產品、品牌故事、製程與購買方式的提問。你的目標是提升顧客滿-意度。絕不提供醫療建議或臆測答案。遇到無法處理的複雜問題或客訴時，請禮貌地引導顧客聯繫真人客服。`;

  // 開啟對話視窗
  fab.addEventListener('click', function() {
    windowEl.classList.add('open');
    setTimeout(() => {
      input.focus();
    }, 200);
  });
  // 關閉對話視窗
  closeBtn.addEventListener('click', function() {
    windowEl.classList.remove('open');
  });
  // 點 FAB 以外區域自動關閉（手機友善）
  document.addEventListener('click', function(e) {
    if (windowEl.classList.contains('open') && !windowEl.contains(e.target) && !fab.contains(e.target)) {
      windowEl.classList.remove('open');
    }
  });
  // 表單送出顯示訊息並串接API
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    // 顯示使用者訊息
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-chatbot-message ai-chatbot-message-user';
    userMsg.textContent = text;
    messages.appendChild(userMsg);
    messages.scrollTop = messages.scrollHeight;
    input.value = '';
    // 更新對話歷史
    chatHistory.push({ role: 'user', content: text });
    // 顯示載入中
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-chatbot-message ai-chatbot-message-bot';
    botMsg.textContent = '思考中...';
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
    // 串接自己的後端 API
    try {
      const response = await fetch('https://nchc-llm-wraper.onrender.com/chat/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          system_prompt: systemPrompt
        })
      });
      const data = await response.json();
      if (data && data.response) {
        botMsg.textContent = data.response;
        chatHistory.push({ role: 'assistant', content: data.response });
      } else {
        botMsg.textContent = '很抱歉，AI暫時無法回應，請稍後再試。';
      }
    } catch (err) {
      botMsg.textContent = '連線失敗，請檢查網路或稍後再試。';
    }
    messages.scrollTop = messages.scrollHeight;
  });
})(); 