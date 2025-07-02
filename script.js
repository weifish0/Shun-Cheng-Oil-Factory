// 等待 DOM 載入完成
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 檢查 Chart.js 是否已載入
        if (typeof Chart === 'undefined') {
            console.error('Chart.js 未載入');
            return;
        }
        
        // 初始化氣溫折線圖
        initTemperatureChart();
        
        // 初始化動態數據更新
        initDynamicData();
        
        // 添加卡片點擊效果
        addCardInteractions();
        
        // 添加平滑滾動
        addSmoothScrolling();
        
        // 添加視窗大小變化處理
        window.addEventListener('resize', handleResize);
        
        // Modal 初始化（移到最後，確保所有函數都已定義）
        setTimeout(() => {
            initSoilMoistureModal();
            initTemperatureModal();
            initLightModal();
            initCO2Modal();
        }, 0);
    } catch (error) {
        console.error('初始化錯誤:', error);
        showErrorMessage('系統初始化失敗，請重新整理頁面');
    }
});

// 顯示錯誤訊息
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 100000;
        font-size: 14px;
        max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// 全域變數保存最新資料
let sensorData = null;

// 讀取 JSON 並更新畫面
async function fetchAndUpdateData() {
    try {
        const res = await fetch('public/data.json?_=' + Date.now());
        if (!res.ok) throw new Error('資料讀取失敗');
        sensorData = await res.json();
        updateSensorData();
        updateAllCharts();
    } catch (e) {
        showErrorMessage('感測器資料載入失敗');
        console.error(e);
    }
}

// 初始化動態數據更新
function initDynamicData() {
    // 每5秒自動 fetch 更新
    setInterval(fetchAndUpdateData, 5000);
    // 首次載入
    fetchAndUpdateData();
}

// 更新感測器數據顯示
function updateSensorData() {
    if (!sensorData) return;
    document.getElementById('soil-moisture').textContent = sensorData.soilMoisture + '%';
    document.getElementById('temperature').textContent = sensorData.temperature + '°C';
    document.getElementById('light').textContent = sensorData.light.toLocaleString() + ' lux';
    document.getElementById('co2').textContent = sensorData.co2 + ' ppm';
    updateStatusIndicators(sensorData.soilMoisture, sensorData.temperature, sensorData.light, sensorData.co2);
}

// 更新所有圖表
function updateAllCharts() {
    // 只在圖表已初始化時才更新
    if (window.temperatureChartInstance) {
        window.temperatureChartInstance.destroy();
        window.temperatureChartInstance = null;
        initTemperatureChart();
    }
    if (soilMoistureChartInstance) {
        renderSoilMoistureChart();
        updateModalMoistureStatus();
    }
    if (temperatureDetailChartInstance) {
        renderTemperatureDetailChart();
    }
    if (lightDistributionChartInstance) {
        renderLightDistributionChart();
        updateLightEfficiencyStatus();
    }
    if (co2TrendChartInstance) {
        renderCO2TrendChart();
        updateCO2ConcentrationStatus();
    }
}

// 修改氣溫折線圖初始化，使用 sensorData
function initTemperatureChart() {
    try {
        const canvas = document.getElementById('temperatureChart');
        if (!canvas) {
            console.error('找不到 temperatureChart canvas 元素');
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('無法取得 canvas context');
            return;
        }
        // 生成最近7天的日期
        const dates = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }));
        }
        // 用 sensorData 或預設
        const temperatureData = sensorData && sensorData.history ? sensorData.history.temperature : [22, 24, 26, 25, 23, 24, 24];
        window.temperatureChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '氣溫 (°C)',
                    data: temperatureData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4CAF50',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `氣溫: ${context.parsed.y}°C`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(0, 0, 0, 0.1)', drawBorder: false },
                        ticks: { color: '#666', font: { size: 12 } }
                    },
                    y: {
                        beginAtZero: false,
                        min: 15,
                        max: 35,
                        grid: { color: 'rgba(0, 0, 0, 0.1)', drawBorder: false },
                        ticks: {
                            color: '#666', font: { size: 12 },
                            callback: function(value) { return value + '°C'; }
                        }
                    }
                },
                interaction: { intersect: false, mode: 'index' },
                elements: { point: { hoverBackgroundColor: '#45a049' } }
            }
        });
    } catch (error) {
        console.error('氣溫圖表初始化錯誤:', error);
        showErrorMessage('氣溫圖表載入失敗');
    }
}

// 更新狀態指示器
function updateStatusIndicators(soilMoisture, temperature, light, co2) {
    // 土壤濕度狀態
    const soilStatus = document.querySelector('#soil-moisture').parentNode.querySelector('.card-status');
    if (soilMoisture >= 60 && soilMoisture <= 80) {
        soilStatus.textContent = '良好';
        soilStatus.className = 'card-status good';
    } else if (soilMoisture < 60) {
        soilStatus.textContent = '偏低';
        soilStatus.className = 'card-status normal';
    } else {
        soilStatus.textContent = '偏高';
        soilStatus.className = 'card-status normal';
    }
    
    // 氣溫狀態
    const tempStatus = document.querySelector('#temperature').parentNode.querySelector('.card-status');
    if (temperature >= 20 && temperature <= 28) {
        tempStatus.textContent = '適中';
        tempStatus.className = 'card-status good';
    } else if (temperature < 20) {
        tempStatus.textContent = '偏低';
        tempStatus.className = 'card-status normal';
    } else {
        tempStatus.textContent = '偏高';
        tempStatus.className = 'card-status normal';
    }
    
    // 光照狀態
    const lightStatus = document.querySelector('#light').parentNode.querySelector('.card-status');
    if (light >= 40000 && light <= 60000) {
        lightStatus.textContent = '充足';
        lightStatus.className = 'card-status good';
    } else if (light < 40000) {
        lightStatus.textContent = '不足';
        lightStatus.className = 'card-status normal';
    } else {
        lightStatus.textContent = '過強';
        lightStatus.className = 'card-status normal';
    }
    
    // 二氧化碳狀態
    const co2Status = document.querySelector('#co2').parentNode.querySelector('.card-status');
    if (co2 >= 400 && co2 <= 450) {
        co2Status.textContent = '正常';
        co2Status.className = 'card-status good';
    } else if (co2 > 450) {
        co2Status.textContent = '偏高';
        co2Status.className = 'card-status normal';
    } else {
        co2Status.textContent = '偏低';
        co2Status.className = 'card-status normal';
    }
}

// 添加卡片點擊效果
function addCardInteractions() {
    const cards = document.querySelectorAll('.card, .transformation-card');
    
    cards.forEach(card => {
        // 移除點擊事件，只保留鍵盤導航支援
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // 不執行任何點擊動作
            }
        });
        
        // 添加點擊位置記錄
        card.addEventListener('click', function(e) {
            // 記錄點擊位置，用於 modal 定位
            window.lastClickPosition = {
                x: e.clientX,
                y: e.clientY
            };
        });
    });
}

// 輔助函數：禁止背景滾動
function disableBodyScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
}

// 輔助函數：恢復背景滾動
function enableBodyScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    document.body.style.overflow = '';
    
    // 恢復滾動位置
    if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
}

// 動態調整 modal 位置
function adjustModalPosition(modalContent) {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    
    // 檢查是否為手機設備
    const isMobile = window.innerWidth <= 480;
    
    if (isMobile) {
        // 手機上使用全屏顯示，顯示在螢幕上方 20% 的位置
        modalContent.style.top = '0';
        modalContent.style.left = '0';
        modalContent.style.transform = 'translateY(1vh) scale(0.95)';
        return;
    }
    
    // 桌面版的位置調整邏輯
    // 重置 modal 位置到預設狀態
    modalContent.style.top = '50%';
    modalContent.style.left = '50%';
    modalContent.style.transform = 'translate(-50%, -50%) scale(0.8)';
    
    // 強制重繪以獲取實際尺寸
    modalContent.offsetHeight;
    
    const modalHeight = modalContent.offsetHeight;
    const modalWidth = modalContent.offsetWidth;
    
    // 計算 modal 在視窗中的實際位置
    const modalTop = (viewportHeight - modalHeight) / 2;
    const modalLeft = (viewportWidth - modalWidth) / 2;
    
    // 確保 modal 不會超出視窗邊界
    let finalTop = Math.max(20, Math.min(modalTop, viewportHeight - modalHeight - 20));
    let finalLeft = Math.max(20, Math.min(modalLeft, viewportWidth - modalWidth - 20));
    
    // 如果有記錄點擊位置，嘗試讓 modal 出現在點擊位置附近
    if (window.lastClickPosition) {
        const clickY = window.lastClickPosition.y;
        const clickX = window.lastClickPosition.x;
        
        // 計算相對於視窗的位置（考慮滾動）
        const relativeClickY = clickY - scrollY;
        const relativeClickX = clickX - scrollX;
        
        // 嘗試將 modal 定位在點擊位置附近
        let targetTop = relativeClickY - (modalHeight / 2);
        let targetLeft = relativeClickX - (modalWidth / 2);
        
        // 確保不超出視窗邊界
        targetTop = Math.max(20, Math.min(targetTop, viewportHeight - modalHeight - 20));
        targetLeft = Math.max(20, Math.min(targetLeft, viewportWidth - modalWidth - 20));
        
        // 如果點擊位置合理，使用它；否則使用居中位置
        if (relativeClickY >= 0 && relativeClickY <= viewportHeight) {
            finalTop = targetTop;
        }
        if (relativeClickX >= 0 && relativeClickX <= viewportWidth) {
            finalLeft = targetLeft;
        }
    }
    
    // 應用位置調整（使用像素值而不是百分比）
    modalContent.style.top = finalTop + 'px';
    modalContent.style.left = finalLeft + 'px';
    modalContent.style.transform = 'scale(0.8)';
}

// 添加手機專用的滑動關閉功能
function addMobileSwipeToClose(modal, closeFunction) {
    const modalContent = modal.querySelector('.modal-content');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    // 防止背景滾動
    const preventScroll = (e) => {
        e.preventDefault();
    };
    
    // 觸控開始
    const handleTouchStart = (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
        modalContent.style.transition = 'none';
        
        // 防止背景滾動
        document.body.addEventListener('touchmove', preventScroll, { passive: false });
    };
    
    // 觸控移動
    const handleTouchMove = (e) => {
        if (!isDragging) return;
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // 只允許向下滑動
        if (deltaY > 0) {
            const translateY = Math.min(deltaY, 300); // 增加最大滑動距離
            const scale = 1 - (translateY / 1500); // 調整縮放效果
            modalContent.style.transform = `translateY(${translateY}px) scale(${scale})`;
        }
    };
    
    // 觸控結束
    const handleTouchEnd = (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        modalContent.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // 移除防止滾動
        document.body.removeEventListener('touchmove', preventScroll);
        
        const deltaY = currentY - startY;
        
        // 如果滑動距離超過閾值，關閉 modal
        if (deltaY > 150) {
            closeFunction();
        } else {
            // 恢復原位置
            modalContent.style.transform = 'translateY(0) scale(1)';
        }
    };
    
    // 添加事件監聽器
    modalContent.addEventListener('touchstart', handleTouchStart, { passive: false });
    modalContent.addEventListener('touchmove', handleTouchMove, { passive: false });
    modalContent.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // 返回清理函數
    return () => {
        modalContent.removeEventListener('touchstart', handleTouchStart);
        modalContent.removeEventListener('touchmove', handleTouchMove);
        modalContent.removeEventListener('touchend', handleTouchEnd);
        document.body.removeEventListener('touchmove', preventScroll);
    };
}

// Modal 控制與土壤濕度圖表
let soilMoistureChartInstance = null;
let temperatureDetailChartInstance = null;
let lightDistributionChartInstance = null;
let co2TrendChartInstance = null;

function initSoilMoistureModal() {
    const soilCard = document.querySelector('.overview-cards .card');
    const modal = document.getElementById('soil-modal');
    
    // 檢查必要元素是否存在
    if (!soilCard) {
        console.error('找不到土壤濕度卡片元素');
        return;
    }
    
    if (!modal) {
        console.error('找不到土壤濕度 modal 元素');
        return;
    }
    
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = document.getElementById('soil-modal-close');
    
    if (!overlay) {
        console.error('找不到土壤濕度 modal overlay 元素');
        return;
    }
    
    if (!closeBtn) {
        console.error('找不到土壤濕度 modal 關閉按鈕');
        return;
    }

    // 點擊卡片開啟 modal
    soilCard.addEventListener('click', function(e) {
        // 避免與卡片動畫衝突
        setTimeout(() => {
            showSoilModal();
        }, 120);
    });
    // 點擊遮罩或關閉按鈕關閉 modal
    overlay.addEventListener('click', hideSoilModal);
    closeBtn.addEventListener('click', hideSoilModal);
    // ESC 鍵關閉
    document.addEventListener('keydown', function(e) {
        if (modal.classList.contains('show') && (e.key === 'Escape' || e.key === 'Esc')) {
            hideSoilModal();
        }
    });
}

function showSoilModal() {
    const modal = document.getElementById('soil-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // 確保 modal 在 body 中
    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }
    
    modal.classList.add('show');
    
    // 完全禁止背景滾動
    disableBodyScroll();
    
    // 調整 modal 位置
    adjustModalPosition(modalContent);
    
    // 隱藏折線圖區塊和轉型預估區塊
    const chartSection = document.querySelector('.chart-section');
    const transformationSection = document.querySelector('.transformation-section');
    if (chartSection) chartSection.style.display = 'none';
    if (transformationSection) transformationSection.style.display = 'none';
    
    // 手機上添加滑動關閉功能
    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
        // 清除之前的滑動關閉功能
        if (modal.swipeCleanup) {
            modal.swipeCleanup();
        }
        // 添加新的滑動關閉功能
        modal.swipeCleanup = addMobileSwipeToClose(modal, hideSoilModal);
    }
    
    // 延遲初始化圖表，等待動畫完成
    setTimeout(() => {
        renderSoilMoistureChart();
        updateModalMoistureStatus();
    }, 150);
}

function hideSoilModal() {
    const modal = document.getElementById('soil-modal');
    modal.classList.remove('show');
    
    // 清理滑動關閉功能
    if (modal.swipeCleanup) {
        modal.swipeCleanup();
        modal.swipeCleanup = null;
    }
    
    // 延遲恢復滾動和顯示其他區塊
    setTimeout(() => {
        // 恢復背景滾動
        enableBodyScroll();
        
        // 恢復顯示折線圖區塊和轉型預估區塊
        const chartSection = document.querySelector('.chart-section');
        const transformationSection = document.querySelector('.transformation-section');
        if (chartSection) chartSection.style.display = '';
        if (transformationSection) transformationSection.style.display = '';
        
        // 銷毀圖表
        if (soilMoistureChartInstance) {
            soilMoistureChartInstance.destroy();
            soilMoistureChartInstance = null;
        }
    }, 300);
}

function renderSoilMoistureChart() {
    try {
        const canvas = document.getElementById('soilMoistureChart');
        if (!canvas) {
            console.error('找不到 soilMoistureChart canvas 元素');
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('無法取得 soilMoistureChart canvas context');
            return;
        }
        // 生成最近7天的日期
        const today = new Date();
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }));
        }
        // 用 sensorData 或預設
        const moistures = sensorData && sensorData.history ? sensorData.history.soilMoisture : [42, 45, 47, 44, 41, 39, 40];
        if (soilMoistureChartInstance) soilMoistureChartInstance.destroy();
        soilMoistureChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '土壤濕度 (%)',
                    data: moistures,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76,175,80,0.08)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4CAF50',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: ctx => `濕度: ${ctx.parsed.y}%`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(0,0,0,0.08)' },
                        ticks: { color: '#666', font: { size: 14 } }
                    },
                    y: {
                        min: 20, max: 80,
                        grid: { color: 'rgba(0,0,0,0.08)' },
                        ticks: {
                            color: '#666', font: { size: 14 },
                            callback: v => v + '%'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('土壤濕度圖表初始化錯誤:', error);
        showErrorMessage('土壤濕度圖表載入失敗');
    }
}

function updateModalMoistureStatus() {
    // 目前濕度（取模擬數據最後一筆）
    const current = 40; // 可改為 moistures[moistures.length-1] 若要同步
    const min = 50, max = 70;
    const valueSpan = document.getElementById('modal-current-moisture');
    const statusSpan = document.getElementById('modal-moisture-status');
    valueSpan.textContent = current + '%';
    if (current < min) {
        statusSpan.textContent = '過乾';
        statusSpan.className = 'moisture-status dry';
    } else if (current > max) {
        statusSpan.textContent = '過濕';
        statusSpan.className = 'moisture-status wet';
    } else {
        statusSpan.textContent = '正常';
        statusSpan.className = 'moisture-status normal';
    }
}

function initTemperatureModal() {
    // 使用更精確的選擇器，選擇第二個卡片（氣溫卡片）
    const cards = document.querySelectorAll('.overview-cards .card');
    const temperatureCard = cards[1]; // 第二個卡片是氣溫卡片
    const modal = document.getElementById('temperature-modal');
    
    // 檢查必要元素是否存在
    if (!temperatureCard) {
        console.error('找不到氣溫卡片元素');
        return;
    }
    
    if (!modal) {
        console.error('找不到氣溫 modal 元素');
        return;
    }
    
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = document.getElementById('temperature-modal-close');
    
    if (!overlay) {
        console.error('找不到 modal overlay 元素');
        return;
    }
    
    if (!closeBtn) {
        console.error('找不到 modal 關閉按鈕');
        return;
    }

    // 點擊卡片開啟 modal
    temperatureCard.addEventListener('click', function(e) {
        // 避免與卡片動畫衝突
        setTimeout(() => {
            showTemperatureModal();
        }, 120);
    });
    // 點擊遮罩或關閉按鈕關閉 modal
    overlay.addEventListener('click', hideTemperatureModal);
    closeBtn.addEventListener('click', hideTemperatureModal);
    // ESC 鍵關閉
    document.addEventListener('keydown', function(e) {
        if (modal.classList.contains('show') && (e.key === 'Escape' || e.key === 'Esc')) {
            hideTemperatureModal();
        }
    });
}

function showTemperatureModal() {
    const modal = document.getElementById('temperature-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // 確保 modal 在 body 中
    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }
    
    modal.classList.add('show');
    
    // 完全禁止背景滾動
    disableBodyScroll();
    
    // 調整 modal 位置
    adjustModalPosition(modalContent);
    
    // 隱藏折線圖區塊和轉型預估區塊
    const chartSection = document.querySelector('.chart-section');
    const transformationSection = document.querySelector('.transformation-section');
    if (chartSection) chartSection.style.display = 'none';
    if (transformationSection) transformationSection.style.display = 'none';
    
    // 手機上添加滑動關閉功能
    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
        // 清除之前的滑動關閉功能
        if (modal.swipeCleanup) {
            modal.swipeCleanup();
        }
        // 添加新的滑動關閉功能
        modal.swipeCleanup = addMobileSwipeToClose(modal, hideTemperatureModal);
    }
    
    // 延遲初始化圖表，等待動畫完成
    setTimeout(() => {
        renderTemperatureDetailChart();
    }, 150);
}

function hideTemperatureModal() {
    const modal = document.getElementById('temperature-modal');
    modal.classList.remove('show');
    
    // 清理滑動關閉功能
    if (modal.swipeCleanup) {
        modal.swipeCleanup();
        modal.swipeCleanup = null;
    }
    
    // 延遲恢復滾動和顯示其他區塊
    setTimeout(() => {
        // 恢復背景滾動
        enableBodyScroll();
        
        // 恢復顯示折線圖區塊和轉型預估區塊
        const chartSection = document.querySelector('.chart-section');
        const transformationSection = document.querySelector('.transformation-section');
        if (chartSection) chartSection.style.display = '';
        if (transformationSection) transformationSection.style.display = '';
        
        // 銷毀圖表
        if (temperatureDetailChartInstance) {
            temperatureDetailChartInstance.destroy();
            temperatureDetailChartInstance = null;
        }
    }, 300);
}

function renderTemperatureDetailChart() {
    try {
        const canvas = document.getElementById('temperatureDetailChart');
        if (!canvas) {
            console.error('找不到 temperatureDetailChart canvas 元素');
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('無法取得 temperatureDetailChart canvas context');
            return;
        }
        // 生成最近7天的日期
        const today = new Date();
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }));
        }
        // 用 sensorData 或預設
        const temperatures = sensorData && sensorData.history ? sensorData.history.temperature : [22, 26, 28, 25, 24, 27, 24];
        if (temperatureDetailChartInstance) temperatureDetailChartInstance.destroy();
        temperatureDetailChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '氣溫 (°C)',
                    data: temperatures,
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255,152,0,0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FF9800',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#FF9800',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: ctx => `氣溫: ${ctx.parsed.y}°C`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(0,0,0,0.08)' },
                        ticks: { color: '#666', font: { size: 14 } }
                    },
                    y: {
                        min: 15, max: 35,
                        grid: { color: 'rgba(0,0,0,0.08)' },
                        ticks: {
                            color: '#666', font: { size: 14 },
                            callback: v => v + '°C'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('氣溫詳情圖表初始化錯誤:', error);
        showErrorMessage('氣溫詳情圖表載入失敗');
    }
}

function initLightModal() {
    // 使用更精確的選擇器，選擇第三個卡片（光照卡片）
    const cards = document.querySelectorAll('.overview-cards .card');
    const lightCard = cards[2]; // 第三個卡片是光照卡片
    const modal = document.getElementById('light-modal');
    
    // 檢查必要元素是否存在
    if (!lightCard) {
        console.error('找不到光照卡片元素');
        return;
    }
    
    if (!modal) {
        console.error('找不到光照 modal 元素');
        return;
    }
    
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = document.getElementById('light-modal-close');
    
    if (!overlay) {
        console.error('找不到光照 modal overlay 元素');
        return;
    }
    
    if (!closeBtn) {
        console.error('找不到光照 modal 關閉按鈕');
        return;
    }

    // 點擊卡片開啟 modal
    lightCard.addEventListener('click', function(e) {
        // 避免與卡片動畫衝突
        setTimeout(() => {
            showLightModal();
        }, 120);
    });
    // 點擊遮罩或關閉按鈕關閉 modal
    overlay.addEventListener('click', hideLightModal);
    closeBtn.addEventListener('click', hideLightModal);
    // ESC 鍵關閉
    document.addEventListener('keydown', function(e) {
        if (modal.classList.contains('show') && (e.key === 'Escape' || e.key === 'Esc')) {
            hideLightModal();
        }
    });
}

function showLightModal() {
    const modal = document.getElementById('light-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // 確保 modal 在 body 中
    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }
    
    modal.classList.add('show');
    
    // 完全禁止背景滾動
    disableBodyScroll();
    
    // 調整 modal 位置
    adjustModalPosition(modalContent);
    
    // 隱藏折線圖區塊和轉型預估區塊
    const chartSection = document.querySelector('.chart-section');
    const transformationSection = document.querySelector('.transformation-section');
    if (chartSection) chartSection.style.display = 'none';
    if (transformationSection) transformationSection.style.display = 'none';
    
    // 手機上添加滑動關閉功能
    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
        // 清除之前的滑動關閉功能
        if (modal.swipeCleanup) {
            modal.swipeCleanup();
        }
        // 添加新的滑動關閉功能
        modal.swipeCleanup = addMobileSwipeToClose(modal, hideLightModal);
    }
    
    // 延遲初始化圖表，等待動畫完成
    setTimeout(() => {
        renderLightDistributionChart();
        updateLightEfficiencyStatus();
    }, 150);
}

function hideLightModal() {
    const modal = document.getElementById('light-modal');
    modal.classList.remove('show');
    
    // 清理滑動關閉功能
    if (modal.swipeCleanup) {
        modal.swipeCleanup();
        modal.swipeCleanup = null;
    }
    
    // 延遲恢復滾動和顯示其他區塊
    setTimeout(() => {
        // 恢復背景滾動
        enableBodyScroll();
        
        // 恢復顯示折線圖區塊和轉型預估區塊
        const chartSection = document.querySelector('.chart-section');
        const transformationSection = document.querySelector('.transformation-section');
        if (chartSection) chartSection.style.display = '';
        if (transformationSection) transformationSection.style.display = '';
        
        // 銷毀圖表
        if (lightDistributionChartInstance) {
            lightDistributionChartInstance.destroy();
            lightDistributionChartInstance = null;
        }
    }, 300);
}

function renderLightDistributionChart() {
    try {
        const canvas = document.getElementById('lightDistributionChart');
        if (!canvas) {
            console.error('找不到 lightDistributionChart canvas 元素');
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('無法取得 lightDistributionChart canvas context');
            return;
        }
        // 時間標籤
        const timeLabels = ['早上 6:00', '早上 9:00', '中午 12:00', '下午 3:00', '下午 6:00'];
        // 用 sensorData 或預設
        const lightIntensities = sensorData && sensorData.history ? sensorData.history.light : [15000, 35000, 65000, 45000, 20000];
        if (lightDistributionChartInstance) lightDistributionChartInstance.destroy();
        lightDistributionChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: '光照強度 (lux)',
                    data: lightIntensities,
                    backgroundColor: [
                        'rgba(255, 193, 7, 0.8)',   // 早上 - 黃色
                        'rgba(255, 152, 0, 0.8)',   // 上午 - 橙色
                        'rgba(244, 67, 54, 0.8)',   // 中午 - 紅色（過強）
                        'rgba(255, 152, 0, 0.8)',   // 下午 - 橙色
                        'rgba(255, 193, 7, 0.8)'    // 傍晚 - 黃色
                    ],
                    borderColor: [
                        '#FFC107',
                        '#FF9800',
                        '#F44336',
                        '#FF9800',
                        '#FFC107'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#FF9800',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: ctx => `光照強度: ${ctx.parsed.y.toLocaleString()} lux`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(0,0,0,0.08)' },
                        ticks: { color: '#666', font: { size: 14 } }
                    },
                    y: {
                        beginAtZero: true,
                        max: 80000,
                        grid: { color: 'rgba(0,0,0,0.08)' },
                        ticks: {
                            color: '#666', font: { size: 14 },
                            callback: v => (v / 1000).toFixed(0) + 'k'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('光照分佈圖表初始化錯誤:', error);
        showErrorMessage('光照分佈圖表載入失敗');
    }
}

function updateLightEfficiencyStatus() {
    // 目前光照強度（取中午的數據）
    const current = 65000; // 中午光照強度
    const valueSpan = document.getElementById('modal-current-light');
    const efficiencySpan = document.getElementById('modal-light-efficiency');
    
    valueSpan.textContent = current.toLocaleString() + ' lux';
    
    // 判斷光照效率
    if (current < 20000) {
        efficiencySpan.textContent = '不足';
        efficiencySpan.className = 'light-efficiency insufficient';
    } else if (current > 50000) {
        efficiencySpan.textContent = '過強';
        efficiencySpan.className = 'light-efficiency excessive';
    } else {
        efficiencySpan.textContent = '適中';
        efficiencySpan.className = 'light-efficiency optimal';
    }
}

function initCO2Modal() {
    // 使用更精確的選擇器，選擇第四個卡片（CO₂ 濃度卡片）
    const cards = document.querySelectorAll('.overview-cards .card');
    const co2Card = cards[3]; // 第四個卡片是 CO₂ 濃度卡片
    const modal = document.getElementById('co2-modal');
    
    // 檢查必要元素是否存在
    if (!co2Card) {
        console.error('找不到 CO₂ 濃度卡片元素');
        return;
    }
    
    if (!modal) {
        console.error('找不到 CO₂ modal 元素');
        return;
    }
    
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = document.getElementById('co2-modal-close');
    
    if (!overlay) {
        console.error('找不到 CO₂ modal overlay 元素');
        return;
    }
    
    if (!closeBtn) {
        console.error('找不到 CO₂ modal 關閉按鈕');
        return;
    }

    // 點擊卡片開啟 modal
    co2Card.addEventListener('click', function(e) {
        // 避免與卡片動畫衝突
        setTimeout(() => {
            showCO2Modal();
        }, 120);
    });
    // 點擊遮罩或關閉按鈕關閉 modal
    overlay.addEventListener('click', hideCO2Modal);
    closeBtn.addEventListener('click', hideCO2Modal);
    // ESC 鍵關閉
    document.addEventListener('keydown', function(e) {
        if (modal.classList.contains('show') && (e.key === 'Escape' || e.key === 'Esc')) {
            hideCO2Modal();
        }
    });
}

function showCO2Modal() {
    const modal = document.getElementById('co2-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // 確保 modal 在 body 中
    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }
    
    modal.classList.add('show');
    
    // 完全禁止背景滾動
    disableBodyScroll();
    
    // 調整 modal 位置
    adjustModalPosition(modalContent);
    
    // 隱藏折線圖區塊和轉型預估區塊
    const chartSection = document.querySelector('.chart-section');
    const transformationSection = document.querySelector('.transformation-section');
    if (chartSection) chartSection.style.display = 'none';
    if (transformationSection) transformationSection.style.display = 'none';
    
    // 手機上添加滑動關閉功能
    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
        // 清除之前的滑動關閉功能
        if (modal.swipeCleanup) {
            modal.swipeCleanup();
        }
        // 添加新的滑動關閉功能
        modal.swipeCleanup = addMobileSwipeToClose(modal, hideCO2Modal);
    }
    
    // 延遲初始化圖表，等待動畫完成
    setTimeout(() => {
        renderCO2TrendChart();
        updateCO2ConcentrationStatus();
    }, 150);
}

function hideCO2Modal() {
    const modal = document.getElementById('co2-modal');
    modal.classList.remove('show');
    
    // 清理滑動關閉功能
    if (modal.swipeCleanup) {
        modal.swipeCleanup();
        modal.swipeCleanup = null;
    }
    
    // 延遲恢復滾動和顯示其他區塊
    setTimeout(() => {
        // 恢復背景滾動
        enableBodyScroll();
        
        // 恢復顯示折線圖區塊和轉型預估區塊
        const chartSection = document.querySelector('.chart-section');
        const transformationSection = document.querySelector('.transformation-section');
        if (chartSection) chartSection.style.display = '';
        if (transformationSection) transformationSection.style.display = '';
        
        // 銷毀圖表
        if (co2TrendChartInstance) {
            co2TrendChartInstance.destroy();
            co2TrendChartInstance = null;
        }
    }, 300);
}

function renderCO2TrendChart() {
    try {
        const canvas = document.getElementById('co2TrendChart');
        if (!canvas) {
            console.error('找不到 co2TrendChart canvas 元素');
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('無法取得 co2TrendChart canvas context');
            return;
        }
        // 生成最近7天的日期
        const today = new Date();
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }));
        }
        // 用 sensorData 或預設
        const co2Levels = sensorData && sensorData.history ? sensorData.history.co2 : [380, 375, 370, 365, 370, 375, 370];
        if (co2TrendChartInstance) co2TrendChartInstance.destroy();
        co2TrendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'CO₂ 濃度 (ppm)',
                    data: co2Levels,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76,175,80,0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4CAF50',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: ctx => `CO₂ 濃度: ${ctx.parsed.y} ppm`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(0,0,0,0.08)' },
                        ticks: { color: '#666', font: { size: 14 } }
                    },
                    y: {
                        min: 350, max: 450,
                        grid: { color: 'rgba(0,0,0,0.08)' },
                        ticks: {
                            color: '#666', font: { size: 14 },
                            callback: v => v + ' ppm'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('CO₂ 濃度趨勢圖表初始化錯誤:', error);
        showErrorMessage('CO₂ 濃度趨勢圖表載入失敗');
    }
}

function updateCO2ConcentrationStatus() {
    // 目前 CO₂ 濃度（取模擬數據最後一筆）
    const current = 370; // ppm
    const min = 400, max = 600;
    const valueSpan = document.getElementById('modal-current-co2');
    const statusSpan = document.getElementById('modal-co2-status');
    
    valueSpan.textContent = current + ' ppm';
    
    // 判斷 CO₂ 濃度狀態
    if (current < min) {
        statusSpan.textContent = '偏低';
        statusSpan.className = 'co2-status low';
    } else if (current > max) {
        statusSpan.textContent = '偏高';
        statusSpan.className = 'co2-status high';
    } else {
        statusSpan.textContent = '適中';
        statusSpan.className = 'co2-status optimal';
    }
}

// 添加平滑滾動效果
function addSmoothScrolling() {
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// 添加響應式圖表調整
function handleResize() {
    const chartContainer = document.querySelector('.chart-container');
    const chart = document.getElementById('temperatureChart');
    
    if (window.innerWidth <= 768) {
        chartContainer.style.padding = '20px';
        if (chart && chart.chart) {
            chart.chart.resize();
        }
    } else {
        chartContainer.style.padding = '30px';
        if (chart && chart.chart) {
            chart.chart.resize();
        }
    }
    
    // 手機旋轉時重新調整 modal 位置
    const activeModal = document.querySelector('.modal.show');
    if (activeModal) {
        const modalContent = activeModal.querySelector('.modal-content');
        if (modalContent) {
            adjustModalPosition(modalContent);
        }
    }
}

// 頁面載入完成後初始化所有功能
window.addEventListener('load', function() {
    addSmoothScrolling();
    handleResize();
    
    // 添加載入動畫
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 添加錯誤處理
window.addEventListener('error', function(e) {
    console.error('Dashboard 錯誤:', e.error);
    
    // 顯示用戶友好的錯誤訊息
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        font-size: 14px;
    `;
    errorDiv.textContent = '系統暫時無法載入數據，請稍後再試';
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}); 