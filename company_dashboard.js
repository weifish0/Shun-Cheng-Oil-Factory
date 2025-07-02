// 企業 ESG 數據儀表板 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // 檢測設備類型
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    // 數字計數動畫函數
    function animateNumber(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // 格式化數字顯示
            if (element.id === 'farm-area') {
                element.textContent = current.toFixed(1);
            } else if (element.id === 'carbon-reduction') {
                element.textContent = current.toFixed(1);
            } else if (element.id === 'farmers-supported') {
                element.textContent = Math.floor(current);
            } else if (element.id === 'brand-visibility') {
                element.textContent = `${Math.floor(current)}`;
            }
        }, 16);
    }
    
    // 滾動觸發動畫
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // 觸發數字計數動畫
                if (element.classList.contains('card-value')) {
                    const targetValue = parseFloat(element.getAttribute('data-target') || element.textContent.replace(/[^\d.]/g, ''));
                    animateNumber(element, targetValue);
                }
                
                // 添加動畫類別
                element.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 觀察所有需要動畫的元素
    document.querySelectorAll('.card-value, .benefit-item').forEach(el => {
        observer.observe(el);
    });
    
    // 碳排減量趨勢圖
    const carbonCtx = document.getElementById('carbonTrendChart').getContext('2d');
    const carbonChart = new Chart(carbonCtx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            datasets: [{
                label: '碳排減量 (公斤)',
                data: [1200, 1800, 2200, 2800, 3200, 3800, 4200, 4800, 5200, 5800, 6200, 6800],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4CAF50',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: isMobile ? 4 : 6,
                pointHoverRadius: isMobile ? 6 : 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: !isMobile,
                    position: 'top',
                    labels: {
                        font: {
                            size: isMobile ? 12 : 14
                        },
                        color: '#2c3e50'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#4CAF50',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    titleFont: {
                        size: isMobile ? 12 : 14
                    },
                    bodyFont: {
                        size: isMobile ? 11 : 13
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: isMobile ? 10 : 12
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: isMobile ? 10 : 12
                        },
                        callback: function(value) {
                            return value + ' kg';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                point: {
                    hoverRadius: isMobile ? 6 : 8
                }
            }
        }
    });
    
    // 品牌指標提升圖
    const brandCtx = document.getElementById('brandMetricsChart').getContext('2d');
    const brandChart = new Chart(brandCtx, {
        type: 'bar',
        data: {
            labels: ['品牌曝光度', '媒體提及數', '社群互動數', '消費者信任度', 'ESG評分'],
            datasets: [{
                label: '提升百分比',
                data: [23, 18, 31, 18, 25],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(141, 110, 99, 0.8)',
                    'rgba(76, 175, 80, 0.6)',
                    'rgba(141, 110, 99, 0.6)',
                    'rgba(76, 175, 80, 0.4)'
                ],
                borderColor: [
                    '#4CAF50',
                    '#8D6E63',
                    '#4CAF50',
                    '#8D6E63',
                    '#4CAF50'
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
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#4CAF50',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    titleFont: {
                        size: isMobile ? 12 : 14
                    },
                    bodyFont: {
                        size: isMobile ? 11 : 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `提升: +${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: isMobile ? 9 : 11
                        },
                        maxRotation: isMobile ? 45 : 0,
                        minRotation: isMobile ? 45 : 0
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 35,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: isMobile ? 10 : 12
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    // 視窗大小改變時重新調整圖表
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth <= 768;
        
        if (carbonChart && brandChart) {
            carbonChart.data.datasets[0].pointRadius = newIsMobile ? 4 : 6;
            carbonChart.data.datasets[0].pointHoverRadius = newIsMobile ? 6 : 8;
            
            carbonChart.options.plugins.legend.labels.font.size = newIsMobile ? 12 : 14;
            carbonChart.options.scales.x.ticks.font.size = newIsMobile ? 10 : 12;
            carbonChart.options.scales.y.ticks.font.size = newIsMobile ? 10 : 12;
            
            brandChart.options.scales.x.ticks.font.size = newIsMobile ? 9 : 11;
            brandChart.options.scales.y.ticks.font.size = newIsMobile ? 10 : 12;
            brandChart.options.scales.x.ticks.maxRotation = newIsMobile ? 45 : 0;
            brandChart.options.scales.x.ticks.minRotation = newIsMobile ? 45 : 0;
            
            carbonChart.update();
            brandChart.update();
        }
    });
    
    // 載入動畫
    function initLoadAnimation() {
        const cards = document.querySelectorAll('.card');
        const benefits = document.querySelectorAll('.benefit-item');
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        benefits.forEach((benefit, index) => {
            benefit.style.opacity = '0';
            benefit.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                benefit.style.transition = 'all 0.6s ease';
                benefit.style.opacity = '1';
                benefit.style.transform = 'translateY(0)';
            }, (cards.length * 100) + (index * 50));
        });
    }
    
    setTimeout(initLoadAnimation, 100);
    
    console.log('🌱 企業 ESG 數據儀表板已載入');
    console.log('📊 圖表功能已初始化');
    console.log('📱 響應式設計已啟用');
}); 