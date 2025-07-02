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
  // 表單送出顯示訊息
  form.addEventListener('submit', function(e) {
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
    // 模擬AI回覆
    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'ai-chatbot-message ai-chatbot-message-bot';
      botMsg.textContent = '感謝您的提問，我們會盡快回覆您！';
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
    }, 800);
  });
})(); 