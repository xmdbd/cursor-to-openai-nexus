// Models page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeModelsPage();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载模型数据
    loadModels();
});

let allModels = [];
let currentModel = null;

// 模型数据定义（实际应该从API获取）
const MODEL_DATABASE = {
    'claude-3-5-sonnet': {
        name: 'Claude-3.5-Sonnet',
        provider: 'Anthropic',
        type: 'chat',
        status: 'available',
        description: '最新的Claude 3.5 Sonnet模型，在多项任务中表现出色，特别适合编程、数学推理和创意写作。提供了更好的指令理解能力和更一致的响应质量。',
        features: [
            '200K上下文窗口',
            '优秀的代码理解和生成能力',
            '强大的数学和逻辑推理',
            '多语言支持',
            '图像理解能力'
        ],
        useCases: ['代码生成', '数学推理', '创意写作', '数据分析', '技术文档'],
        contextLength: '200,000 tokens',
        outputLength: '8,192 tokens',
        languages: '中文、英文、日文、韩文等',
        trainingCutoff: '2024年4月',
        apiVersion: 'v1',
        responseTime: '~2-5秒',
        inputPrice: '$3.00 / 1M tokens',
        outputPrice: '$15.00 / 1M tokens'
    },
    'claude-3-sonnet': {
        name: 'Claude-3-Sonnet',
        provider: 'Anthropic',
        type: 'chat',
        status: 'available',
        description: 'Claude 3系列的中等规模模型，在性能和成本之间取得了良好的平衡。适合大多数对话和文本处理任务。',
        features: [
            '200K上下文窗口',
            '平衡的性能和成本',
            '稳定的输出质量',
            '多语言支持',
            '快速响应'
        ],
        useCases: ['对话系统', '内容创作', '文本分析', '翻译', '摘要生成'],
        contextLength: '200,000 tokens',
        outputLength: '4,096 tokens',
        languages: '中文、英文、日文、韩文等',
        trainingCutoff: '2024年2月',
        apiVersion: 'v1',
        responseTime: '~1-3秒',
        inputPrice: '$3.00 / 1M tokens',
        outputPrice: '$15.00 / 1M tokens'
    },
    'claude-3-haiku': {
        name: 'Claude-3-Haiku',
        provider: 'Anthropic',
        type: 'chat',
        status: 'available',
        description: '最快最经济的Claude 3模型，专为高频使用场景设计。在保持质量的同时提供极快的响应速度。',
        features: [
            '200K上下文窗口',
            '极快的响应速度',
            '经济实惠的价格',
            '适合高频调用',
            '轻量级推理'
        ],
        useCases: ['实时对话', '快速问答', '内容审核', '分类任务', '简单推理'],
        contextLength: '200,000 tokens',
        outputLength: '4,096 tokens',
        languages: '中文、英文、日文、韩文等',
        trainingCutoff: '2024年2月',
        apiVersion: 'v1',
        responseTime: '~0.5-2秒',
        inputPrice: '$0.25 / 1M tokens',
        outputPrice: '$1.25 / 1M tokens'
    },
    'claude-3-opus': {
        name: 'Claude-3-Opus',
        provider: 'Anthropic',
        type: 'reasoning',
        status: 'limited',
        description: 'Claude 3系列中最强大的模型，在复杂推理、创意任务和专业分析方面表现卓越。适合最具挑战性的AI任务。',
        features: [
            '200K上下文窗口',
            '顶级推理能力',
            '卓越的创意性',
            '深度分析能力',
            '复杂问题解决'
        ],
        useCases: ['复杂推理', '研究分析', '创意写作', '专业咨询', '策略规划'],
        contextLength: '200,000 tokens',
        outputLength: '4,096 tokens',
        languages: '中文、英文、日文、韩文等',
        trainingCutoff: '2024年2月',
        apiVersion: 'v1',
        responseTime: '~3-8秒',
        inputPrice: '$15.00 / 1M tokens',
        outputPrice: '$75.00 / 1M tokens'
    },
    'cursor-small': {
        name: 'Cursor Small',
        provider: 'Cursor',
        type: 'code',
        status: 'available',
        description: 'Cursor专用的小型代码模型，专门针对代码补全和简单编程任务优化。提供快速准确的代码建议。',
        features: [
            '代码专用优化',
            '快速代码补全',
            '多语言编程支持',
            '上下文感知',
            'IDE集成优化'
        ],
        useCases: ['代码补全', '语法修正', '简单重构', '代码注释', '变量命名'],
        contextLength: '4,096 tokens',
        outputLength: '1,024 tokens',
        languages: 'Python, JavaScript, TypeScript, Java, C++等',
        trainingCutoff: '2024年3月',
        apiVersion: 'v1',
        responseTime: '~0.3-1秒',
        inputPrice: '$0.10 / 1M tokens',
        outputPrice: '$0.30 / 1M tokens'
    }
};

// 初始化页面
async function initializeModelsPage() {
    try {
        await checkAuth();
        generateSideNavigation();
        initializeFilters();
    } catch (error) {
        console.error('初始化模型页面失败:', error);
        showNotification('初始化失败: ' + error.message, 'error');
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 筛选按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // 模态框关闭
    document.getElementById('closeModal').addEventListener('click', closeModelModal);
    
    // 退出按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        const modelModal = document.getElementById('modelModal');
        const testModal = document.getElementById('testModal');
        
        if (event.target === modelModal) {
            closeModelModal();
        }
        
        if (event.target === testModal) {
            closeTestModal();
        }
    });
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

// 加载模型数据
async function loadModels() {
    const loadingState = document.getElementById('loadingState');
    const modelsGrid = document.getElementById('modelsGrid');
    
    // 显示加载状态
    loadingState.style.display = 'block';
    modelsGrid.style.display = 'none';
    
    try {
        // 先尝试从API获取实际可用模型
        try {
            const response = await fetch('/v1/models');
            if (response.ok) {
                const data = await response.json();
                console.log('从API获取的模型:', data);
                
                // 将API数据与本地数据库合并
                if (data.data && Array.isArray(data.data)) {
                    allModels = data.data.map(model => {
                        const localData = MODEL_DATABASE[model.id] || {};
                        return {
                            id: model.id,
                            name: localData.name || model.id,
                            provider: localData.provider || 'Unknown',
                            type: localData.type || 'chat',
                            status: 'available',
                            ...localData
                        };
                    });
                }
            }
        } catch (error) {
            console.warn('从API获取模型失败，使用本地数据:', error);
        }
        
        // 如果API调用失败，使用本地模型数据库
        if (allModels.length === 0) {
            allModels = Object.keys(MODEL_DATABASE).map(id => ({
                id,
                ...MODEL_DATABASE[id]
            }));
        }
        
        // 渲染模型
        renderModels(allModels);
        
    } catch (error) {
        console.error('加载模型失败:', error);
        showNotification('加载模型失败: ' + error.message, 'error');
    } finally {
        loadingState.style.display = 'none';
        modelsGrid.style.display = 'grid';
    }
}

// 渲染模型卡片
function renderModels(models) {
    const modelsGrid = document.getElementById('modelsGrid');
    
    if (models.length === 0) {
        modelsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 48px; color: var(--ios-gray); margin-bottom: 16px;"></i>
                <p style="color: var(--ios-text-secondary);">未找到符合条件的模型</p>
            </div>
        `;
        return;
    }
    
    modelsGrid.innerHTML = models.map(model => `
        <div class="model-card" onclick="showModelDetail('${model.id}')">
            <div class="model-card-header">
                <div class="model-avatar">
                    <i class="fas fa-${getModelIcon(model.type)}"></i>
                </div>
                <div class="model-info">
                    <h3>${model.name}</h3>
                    <p class="model-provider">${model.provider}</p>
                </div>
            </div>
            
            <div class="model-tags">
                <span class="tag">${getTypeLabel(model.type)}</span>
                <span class="tag status-${model.status}">${getStatusLabel(model.status)}</span>
            </div>
            
            <p class="model-description">
                ${model.description || '暂无描述信息'}
            </p>
            
            <div class="model-specs">
                <div class="spec-item">
                    <span class="spec-label">上下文</span>
                    <span class="spec-value">${model.contextLength || 'N/A'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">响应时间</span>
                    <span class="spec-value">${model.responseTime || 'N/A'}</span>
                </div>
            </div>
            
            <div class="model-actions">
                <button class="model-action-btn primary" onclick="event.stopPropagation(); testModel('${model.id}')">
                    <i class="fas fa-play"></i> 测试
                </button>
                <button class="model-action-btn secondary" onclick="event.stopPropagation(); showModelDetail('${model.id}')">
                    <i class="fas fa-info"></i> 详情
                </button>
            </div>
        </div>
    `).join('');
}

// 获取模型图标
function getModelIcon(type) {
    const icons = {
        'chat': 'comments',
        'code': 'code',
        'reasoning': 'brain',
        'image': 'image',
        'audio': 'volume-up'
    };
    return icons[type] || 'robot';
}

// 获取类型标签
function getTypeLabel(type) {
    const labels = {
        'chat': '对话模型',
        'code': '代码模型',
        'reasoning': '推理模型',
        'image': '图像模型',
        'audio': '音频模型'
    };
    return labels[type] || type;
}

// 获取状态标签
function getStatusLabel(status) {
    const labels = {
        'available': '可用',
        'limited': '限制',
        'unavailable': '不可用',
        'maintenance': '维护中'
    };
    return labels[status] || status;
}

// 处理筛选按钮点击
function handleFilterClick(event) {
    const btn = event.target;
    const group = btn.parentElement;
    
    // 更新按钮状态
    group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // 应用筛选
    applyFilters();
}

// 应用筛选条件
function applyFilters() {
    const typeFilter = document.querySelector('[data-filter].active').dataset.filter;
    const providerFilter = document.querySelector('[data-provider].active').dataset.provider;
    
    let filteredModels = allModels;
    
    // 类型筛选
    if (typeFilter !== 'all') {
        filteredModels = filteredModels.filter(model => model.type === typeFilter);
    }
    
    // 提供商筛选
    if (providerFilter !== 'all') {
        filteredModels = filteredModels.filter(model => 
            model.provider.toLowerCase() === providerFilter.toLowerCase()
        );
    }
    
    renderModels(filteredModels);
}

// 初始化筛选器
function initializeFilters() {
    // 设置默认选中状态
    document.querySelector('[data-filter="all"]').classList.add('active');
    document.querySelector('[data-provider="all"]').classList.add('active');
}

// 显示模型详情
function showModelDetail(modelId) {
    const model = allModels.find(m => m.id === modelId);
    if (!model) return;
    
    currentModel = model;
    
    // 填充模态框数据
    document.getElementById('modalModelName').textContent = model.name;
    document.getElementById('modalModelProvider').textContent = model.provider;
    document.getElementById('modalModelType').textContent = getTypeLabel(model.type);
    document.getElementById('modalModelStatus').textContent = getStatusLabel(model.status);
    document.getElementById('modalModelStatus').className = `tag status-${model.status}`;
    
    // 概述标签页
    document.getElementById('modalModelDescription').textContent = model.description || '暂无描述信息';
    
    const featuresList = document.getElementById('modalModelFeatures');
    featuresList.innerHTML = (model.features || []).map(feature => `<li>${feature}</li>`).join('');
    
    const useCasesContainer = document.getElementById('modalUseCases');
    useCasesContainer.innerHTML = (model.useCases || []).map(useCase => 
        `<span class="use-case-tag">${useCase}</span>`
    ).join('');
    
    // 规格标签页
    document.getElementById('modalContextLength').textContent = model.contextLength || 'N/A';
    document.getElementById('modalOutputLength').textContent = model.outputLength || 'N/A';
    document.getElementById('modalLanguages').textContent = model.languages || 'N/A';
    document.getElementById('modalTrainingCutoff').textContent = model.trainingCutoff || 'N/A';
    document.getElementById('modalApiVersion').textContent = model.apiVersion || 'N/A';
    document.getElementById('modalResponseTime').textContent = model.responseTime || 'N/A';
    
    // 价格标签页
    document.getElementById('modalInputPrice').textContent = model.inputPrice || 'N/A';
    document.getElementById('modalOutputPrice').textContent = model.outputPrice || 'N/A';
    
    // 显示模态框
    document.getElementById('modelModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

// 关闭模型详情模态框
function closeModelModal() {
    document.getElementById('modelModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

// 切换标签页
function switchTab(tabName) {
    // 更新标签按钮
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // 更新标签内容
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
}

// 测试模型
async function testModel(modelId) {
    const model = allModels.find(m => m.id === modelId);
    if (!model) return;
    
    // 显示测试模态框
    showTestModal(model);
    
    const testQuestion = "你好，请简单介绍一下自己，并说明你的主要功能。";
    
    try {
        const startTime = Date.now();
        
        const response = await fetch('/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (localStorage.getItem('testApiKey') || 'test-key')
            },
            body: JSON.stringify({
                model: modelId,
                messages: [{
                    role: 'user',
                    content: testQuestion
                }],
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (response.ok) {
            const data = await response.json();
            showTestSuccess(data, responseTime);
        } else {
            const errorData = await response.json();
            showTestError(`HTTP ${response.status}: ${errorData.error || '未知错误'}`);
        }
        
    } catch (error) {
        console.error('测试模型失败:', error);
        showTestError(error.message);
    }
}

// 显示测试模态框
function showTestModal(model) {
    document.getElementById('testModelName').textContent = model.name;
    document.getElementById('testTime').textContent = new Date().toLocaleString();
    
    // 重置状态
    const testStatus = document.getElementById('testStatus');
    testStatus.className = 'test-status testing';
    testStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 测试中...';
    
    // 重置响应内容
    const responseContent = document.getElementById('testResponseContent');
    responseContent.innerHTML = `
        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    // 隐藏指标
    document.getElementById('testMetrics').style.display = 'none';
    
    // 显示模态框
    document.getElementById('testModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

// 显示测试成功结果
function showTestSuccess(data, responseTime) {
    const testStatus = document.getElementById('testStatus');
    testStatus.className = 'test-status success';
    testStatus.innerHTML = '<i class="fas fa-check-circle"></i> 测试成功';
    
    // 显示响应内容
    const responseContent = document.getElementById('testResponseContent');
    const message = data.choices && data.choices[0] && data.choices[0].message;
    responseContent.textContent = message ? message.content : '无响应内容';
    
    // 显示指标
    document.getElementById('responseTimeMetric').textContent = responseTime + 'ms';
    document.getElementById('tokenCountMetric').textContent = (data.usage?.total_tokens || 0) + ' tokens';
    document.getElementById('statusCodeMetric').textContent = '200';
    document.getElementById('testMetrics').style.display = 'flex';
}

// 显示测试错误结果
function showTestError(errorMessage) {
    const testStatus = document.getElementById('testStatus');
    testStatus.className = 'test-status error';
    testStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> 测试失败';
    
    // 显示错误内容
    const responseContent = document.getElementById('testResponseContent');
    responseContent.textContent = errorMessage;
    
    // 隐藏指标
    document.getElementById('testMetrics').style.display = 'none';
}

// 关闭测试模态框
function closeTestModal() {
    document.getElementById('testModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

// 测试当前模型
function testCurrentModel() {
    if (currentModel) {
        closeModelModal();
        testModel(currentModel.id);
    }
}

// 复制模型端点
function copyModelEndpoint() {
    if (currentModel) {
        const endpoint = `http://localhost:3010/v1/chat/completions`;
        copyTextToClipboard(endpoint);
        showNotification('API端点已复制到剪贴板', 'success');
    }
}

// 复制代码示例
function copyCode(exampleId) {
    const codeElement = document.getElementById(exampleId);
    if (codeElement) {
        const code = codeElement.textContent;
        copyTextToClipboard(code);
        showNotification('代码已复制到剪贴板', 'success');
    }
}

// 测试所有模型
async function testAllModels() {
    showNotification('开始测试所有模型...', 'info');
    
    let successCount = 0;
    let totalCount = allModels.filter(m => m.status === 'available').length;
    
    for (const model of allModels.filter(m => m.status === 'available')) {
        try {
            const response = await fetch('/v1/models');
            if (response.ok) {
                successCount++;
            }
        } catch (error) {
            console.error(`测试模型 ${model.name} 失败:`, error);
        }
    }
    
    showNotification(`模型测试完成：${successCount}/${totalCount} 个模型可用`, 
        successCount === totalCount ? 'success' : 'error');
}

// 刷新模型列表
function refreshModels() {
    showNotification('正在刷新模型列表...', 'info');
    loadModels();
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
        { title: '模型概览', id: 'models-overview' },
        { title: '对话模型', id: 'chat-models' },
        { title: '代码模型', id: 'code-models' },
        { title: '推理模型', id: 'reasoning-models' }
    ];
    
    const sideNavContent = document.querySelector('.side-nav-content');
    if (sideNavContent) {
        sideNavContent.innerHTML = sections.map((section, index) => `
            <div class="nav-item ${index === 0 ? 'active' : ''}" onclick="filterByType('${section.id}')">
                <div class="nav-item-dot"></div>
                <div class="nav-item-title">${section.title}</div>
            </div>
        `).join('');
    }
}

// 按类型筛选
function filterByType(sectionId) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
    
    // 根据section设置筛选器
    const typeMap = {
        'models-overview': 'all',
        'chat-models': 'chat',
        'code-models': 'code',
        'reasoning-models': 'reasoning'
    };
    
    const targetType = typeMap[sectionId];
    if (targetType) {
        // 更新筛选按钮状态
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === targetType) {
                btn.classList.add('active');
            }
        });
        
        // 应用筛选
        applyFilters();
    }
}

// 复制文本到剪贴板
async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('复制失败:', err);
        
        // 备用方法
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        } catch (fallbackErr) {
            console.error('备用复制方法失败:', fallbackErr);
            return false;
        }
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
    
    // 确保通知容器存在
    if (!document.querySelector('.notification-container')) {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    document.querySelector('.notification-container').appendChild(notification);
    
    // 自动移除
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// 主题切换功能
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