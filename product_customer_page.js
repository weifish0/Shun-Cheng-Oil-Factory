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