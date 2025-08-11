// Dashboard JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // 初始化仪表板
    initializeDashboard();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化图表
    initializeCharts();
    
    // 定期刷新数据
    setInterval(refreshDashboardData, 30000); // 30秒刷新一次
});

let modelUsageChart, apiCallsChart;

// 初始化仪表板
async function initializeDashboard() {
    try {
        await checkAuth();
        await loadDashboardStats();
        await loadRecentActivity();
        generateSideNavigation();
    } catch (error) {
        console.error('初始化仪表板失败:', error);
        showError('初始化仪表板失败: ' + error.message);
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 时间范围变更
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.addEventListener('change', refreshApiCallsChart);
    }
    
    // 退出按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// 检查认证状态
async function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    try {
        const response = await fetch('/v1/admin/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (!data.success) {
            localStorage.removeItem('adminToken');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('认证检查失败:', error);
        localStorage.removeItem('adminToken');
        window.location.href = '/login.html';
    }
}

// 加载仪表板统计数据
async function loadDashboardStats() {
    try {
        // 加载 API Keys 统计
        const apiKeysResponse = await fetch('/v1/api-keys');
        const apiKeysData = await apiKeysResponse.json();
        
        if (apiKeysData.success) {
            const totalApiKeys = apiKeysData.apiKeys.length;
            const totalCookies = apiKeysData.apiKeys.reduce((sum, key) => sum + key.cookieCount, 0);
            
            document.getElementById('totalApiKeys').textContent = totalApiKeys;
            document.getElementById('totalCookies').textContent = totalCookies;
        }
        
        // 加载无效 Cookies 统计
        const invalidResponse = await fetch('/v1/invalid-cookies');
        const invalidData = await invalidResponse.json();
        
        if (invalidData.success) {
            document.getElementById('invalidCookies').textContent = invalidData.invalidCookies.length;
        }
        
        // 加载模型数据
        await loadModelsStats();
        
        // 更新系统状态
        updateSystemStatus();
        
    } catch (error) {
        console.error('加载统计数据失败:', error);
        showError('加载统计数据失败');
    }
}

// 加载模型统计
async function loadModelsStats() {
    try {
        // 模拟模型数据，实际应该从API获取
        const modelsCount = 15; // 从配置或API获取
        document.getElementById('totalModels').textContent = modelsCount;
    } catch (error) {
        console.error('加载模型统计失败:', error);
    }
}

// 更新系统状态
function updateSystemStatus() {
    // 模拟系统指标
    const responseTime = Math.floor(Math.random() * 200) + 50;
    const successRate = 95 + Math.floor(Math.random() * 5);
    const cookieHealth = 85 + Math.floor(Math.random() * 15);
    
    document.getElementById('responseTime').textContent = responseTime + 'ms';
    document.getElementById('successRate').textContent = successRate + '%';
    document.getElementById('cookieHealth').textContent = cookieHealth + '%';
    
    // 更新进度条
    const progressBars = document.querySelectorAll('.metric-progress');
    if (progressBars.length >= 3) {
        progressBars[0].style.width = (responseTime / 300 * 100) + '%';
        progressBars[1].style.width = successRate + '%';
        progressBars[2].style.width = cookieHealth + '%';
    }
    
    // 更新系统状态指示器
    const systemStatus = document.getElementById('systemStatus');
    if (successRate > 90) {
        systemStatus.className = 'status-indicator online';
        systemStatus.innerHTML = '<i class="fas fa-circle"></i> 正常运行';
    } else {
        systemStatus.className = 'status-indicator offline';
        systemStatus.innerHTML = '<i class="fas fa-circle"></i> 异常状态';
    }
}

// 初始化图表
function initializeCharts() {
    initializeModelUsageChart();
    initializeApiCallsChart();
}

// 初始化模型使用图表
function initializeModelUsageChart() {
    const ctx = document.getElementById('modelUsageChart');
    if (!ctx) return;
    
    // 模拟数据
    const modelData = {
        labels: ['Claude-3-Sonnet', 'Claude-3-Haiku', 'Claude-3-Opus', 'GPT-4', '其他'],
        datasets: [{
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
                '#007AFF',
                '#34C759',
                '#FF3B30',
                '#FF9500',
                '#8E8E93'
            ],
            borderWidth: 0
        }]
    };
    
    modelUsageChart = new Chart(ctx, {
        type: 'doughnut',
        data: modelData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// 初始化API调用趋势图表
function initializeApiCallsChart() {
    const ctx = document.getElementById('apiCallsChart');
    if (!ctx) return;
    
    // 生成模拟数据
    const generateData = (days) => {
        const data = [];
        const labels = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
            data.push(Math.floor(Math.random() * 1000) + 100);
        }
        
        return { labels, data };
    };
    
    const chartData = generateData(7);
    
    apiCallsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'API 调用次数',
                data: chartData.data,
                borderColor: '#007AFF',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(142, 142, 147, 0.2)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 刷新API调用图表
function refreshApiCallsChart() {
    const timeRange = document.getElementById('timeRange').value;
    const days = parseInt(timeRange.replace('d', ''));
    
    // 重新生成数据
    const generateData = (days) => {
        const data = [];
        const labels = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            if (days <= 7) {
                labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
            } else if (days <= 30) {
                if (i % 2 === 0 || i < 3) {
                    labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
                } else {
                    labels.push('');
                }
            } else {
                if (i % 7 === 0 || i < 7) {
                    labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
                } else {
                    labels.push('');
                }
            }
            data.push(Math.floor(Math.random() * 1000) + 100);
        }
        
        return { labels, data };
    };
    
    const chartData = generateData(days);
    
    apiCallsChart.data.labels = chartData.labels;
    apiCallsChart.data.datasets[0].data = chartData.data;
    apiCallsChart.update();
}

// 加载最近活动
async function loadRecentActivity() {
    try {
        // 模拟活动数据，实际应该从日志API获取
        const activities = [
            {
                icon: 'fas fa-key',
                title: '添加了新的 API Key',
                time: '2分钟前'
            },
            {
                icon: 'fas fa-sync-alt',
                title: '刷新了 Cookie',
                time: '15分钟前'
            },
            {
                icon: 'fas fa-brain',
                title: '调用了 Claude-3-Sonnet 模型',
                time: '1小时前'
            },
            {
                icon: 'fas fa-exclamation-triangle',
                title: '检测到无效 Cookie',
                time: '2小时前'
            },
            {
                icon: 'fas fa-user',
                title: '管理员登录',
                time: '3小时前'
            }
        ];
        
        const activityList = document.getElementById('activityList');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('加载活动失败:', error);
    }
}

// 刷新仪表板数据
async function refreshDashboardData() {
    try {
        await loadDashboardStats();
        updateSystemStatus();
    } catch (error) {
        console.error('刷新数据失败:', error);
    }
}

// 快速操作函数
async function testAllModels() {
    showNotification('正在测试所有模型...', 'info');
    // 实际实现模型测试逻辑
    setTimeout(() => {
        showNotification('所有模型测试完成', 'success');
    }, 3000);
}

async function refreshAllCookies() {
    showNotification('正在刷新所有 Cookies...', 'info');
    try {
        const response = await fetch('/v1/refresh-cookies', {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
            showNotification('Cookies 刷新成功', 'success');
            await loadDashboardStats();
        } else {
            showNotification('Cookies 刷新失败: ' + data.message, 'error');
        }
    } catch (error) {
        showNotification('刷新失败: ' + error.message, 'error');
    }
}

async function exportData() {
    showNotification('正在导出数据...', 'info');
    // 实现数据导出逻辑
    setTimeout(() => {
        showNotification('数据导出完成', 'success');
    }, 2000);
}

function viewLogs() {
    window.location.href = '/logs.html';
}

// 刷新模型使用情况
function refreshModelUsage() {
    if (modelUsageChart) {
        // 生成新的随机数据
        const newData = [
            Math.floor(Math.random() * 40) + 20,
            Math.floor(Math.random() * 30) + 15,
            Math.floor(Math.random() * 25) + 10,
            Math.floor(Math.random() * 20) + 10,
            Math.floor(Math.random() * 15) + 5
        ];
        
        modelUsageChart.data.datasets[0].data = newData;
        modelUsageChart.update();
    }
}

// 处理退出
function handleLogout() {
    if (confirm('确定要退出吗？')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/login.html';
    }
}

// 生成侧边导航
function generateSideNavigation() {
    const sections = [
        { title: '统计概览', id: 'stats' },
        { title: '模型使用', id: 'model-usage' },
        { title: 'API趋势', id: 'api-trends' },
        { title: '系统状态', id: 'system-status' },
        { title: '最近活动', id: 'recent-activity' },
        { title: '快速操作', id: 'quick-actions' }
    ];
    
    const sideNavContent = document.querySelector('.side-nav-content');
    if (sideNavContent) {
        sideNavContent.innerHTML = sections.map((section, index) => `
            <div class="nav-item ${index === 0 ? 'active' : ''}" onclick="scrollToSection('${section.id}')">
                <div class="nav-item-dot"></div>
                <div class="nav-item-title">${section.title}</div>
            </div>
        `).join('');
    }
}

// 滚动到指定区域
function scrollToSection(sectionId) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.target.closest('.nav-item').classList.add('active');
    
    // 滚动到对应区域
    const sections = document.querySelectorAll('.dashboard-card, .stats-grid');
    const targetIndex = ['stats', 'model-usage', 'api-trends', 'system-status', 'recent-activity', 'quick-actions'].indexOf(sectionId);
    
    if (sections[targetIndex]) {
        sections[targetIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 通知系统
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加通知样式（如果不存在）
    if (!document.querySelector('.notification-container')) {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    document.querySelector('.notification-container').appendChild(notification);
    
    // 自动移除
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// 显示错误
function showError(message) {
    showNotification(message, 'error');
}

// 主题切换功能（从原始脚本引入）
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.classList.add('no-transition');
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.classList.add('theme-icon', newTheme === 'dark' ? 'dark-mode' : '');
        themeIcon.className = themeIcon.className.replace('fa-moon', '').replace('fa-sun', '');
        themeIcon.classList.add(newTheme === 'dark' ? 'fa-sun' : 'fa-moon');
    }
    
    setTimeout(() => {
        document.body.classList.remove('no-transition');
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 1000);
    }, 50);
}

// 初始化主题
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.className = `fas theme-icon ${savedTheme === 'dark' ? 'fa-sun dark-mode' : 'fa-moon'}`;
    }
}

// 页面加载时初始化主题
initializeTheme();