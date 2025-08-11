// Documentation page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeDocsPage();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化代码高亮
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
    
    // 设置导航高亮
    setupNavigationHighlight();
});

// 初始化文档页面
async function initializeDocsPage() {
    try {
        await checkAuth();
        initializeTheme();
        generateTableOfContents();
        setupSmoothScrolling();
    } catch (error) {
        console.error('初始化文档页面失败:', error);
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 退出按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 导航链接
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // 滚动事件（用于导航高亮）
    window.addEventListener('scroll', throttle(updateActiveNavigation, 100));
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

// 处理导航链接点击
function handleNavClick(event) {
    event.preventDefault();
    
    const href = event.target.getAttribute('href');
    if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // 更新导航状态
            updateNavigation(event.target);
            
            // 平滑滚动到目标位置
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// 更新导航状态
function updateNavigation(activeLink) {
    // 移除所有活动状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 添加活动状态到点击的链接
    activeLink.classList.add('active');
}

// 设置导航高亮
function setupNavigationHighlight() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (navLink) {
                    updateNavigation(navLink);
                }
            }
        });
    }, {
        rootMargin: '-20% 0px -70% 0px'
    });
    
    // 观察所有章节
    document.querySelectorAll('.doc-section[id]').forEach(section => {
        observer.observe(section);
    });
}

// 更新当前活动的导航项
function updateActiveNavigation() {
    const sections = document.querySelectorAll('.doc-section[id]');
    const scrollPosition = window.scrollY + window.innerHeight * 0.3;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.id;
        }
    });
    
    if (currentSection) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-link[href="#${currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

// 切换代码标签页
function switchCodeTab(tabName) {
    const tabContainer = event.target.closest('.code-tabs');
    
    // 更新按钮状态
    tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新内容
    tabContainer.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const targetPanel = tabContainer.querySelector(`#${tabName}-tab`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}

// 复制代码到剪贴板
async function copyCode(codeId) {
    const codeElement = document.getElementById(codeId);
    if (!codeElement) return;
    
    const code = codeElement.textContent;
    
    try {
        await navigator.clipboard.writeText(code);
        showCopySuccess(event.target);
    } catch (err) {
        // 备用复制方法
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const success = document.execCommand('copy');
            if (success) {
                showCopySuccess(event.target);
            } else {
                showCopyError(event.target);
            }
        } catch (fallbackErr) {
            showCopyError(event.target);
        }
        
        document.body.removeChild(textArea);
    }
}

// 显示复制成功
function showCopySuccess(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';
    button.style.color = 'var(--ios-green)';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.color = '';
    }, 2000);
}

// 显示复制错误
function showCopyError(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-times"></i>';
    button.style.color = 'var(--ios-red)';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.color = '';
    }, 2000);
}

// 切换侧边栏
function toggleSidebar() {
    const sidebar = document.querySelector('.docs-sidebar');
    const content = document.querySelector('.docs-content');
    
    sidebar.classList.toggle('show');
    content.classList.toggle('expanded');
}

// 滚动到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 生成目录
function generateTableOfContents() {
    // 可以在这里生成一个浮动的目录
    const sections = document.querySelectorAll('.doc-section h2, .doc-section h3');
    // 实现目录生成逻辑...
}

// 设置平滑滚动
function setupSmoothScrolling() {
    // 所有内部锚点链接都使用平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (!anchor.classList.contains('nav-link')) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    });
}

// 处理退出
function handleLogout() {
    if (confirm('确定要退出吗？')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/login.html';
    }
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
    
    // 重新初始化代码高亮（如果需要）
    setTimeout(() => {
        if (typeof hljs !== 'undefined') {
            // 更新高亮主题
            const themeLink = document.querySelector('link[href*="highlight"]');
            if (themeLink) {
                const themeName = newTheme === 'dark' ? 'github-dark' : 'github';
                themeLink.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeName}.min.css`;
            }
        }
        
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
    
    // 设置代码高亮主题
    const themeLink = document.querySelector('link[href*="highlight"]');
    if (themeLink) {
        const themeName = savedTheme === 'dark' ? 'github-dark' : 'github';
        themeLink.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeName}.min.css`;
    }
}

// 工具函数：节流
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 工具函数：防抖
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// 搜索功能（可选实现）
function searchDocs(query) {
    // 实现文档搜索功能
    const sections = document.querySelectorAll('.doc-section');
    const results = [];
    
    sections.forEach(section => {
        const content = section.textContent.toLowerCase();
        if (content.includes(query.toLowerCase())) {
            results.push({
                title: section.querySelector('h1, h2')?.textContent || 'Unknown',
                section: section,
                id: section.id
            });
        }
    });
    
    return results;
}

// 响应式处理
function handleResize() {
    const width = window.innerWidth;
    const sidebar = document.querySelector('.docs-sidebar');
    
    if (width > 1024) {
        sidebar.classList.remove('show');
    }
}

window.addEventListener('resize', debounce(handleResize, 250));

// API 测试功能（可选）
async function testApiEndpoint(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        const result = await response.json();
        
        return {
            success: response.ok,
            status: response.status,
            data: result
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 显示 API 测试结果
function showApiTestResult(result) {
    // 创建一个模态框显示测试结果
    const modal = document.createElement('div');
    modal.className = 'api-test-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>API 测试结果</h3>
                <button class="close-btn" onclick="this.closest('.api-test-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <pre><code>${JSON.stringify(result, null, 2)}</code></pre>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加关闭事件
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K 打开搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // 实现搜索功能
    }
    
    // ESC 关闭模态框
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal, .api-test-modal');
        modals.forEach(modal => modal.remove());
    }
});

// 页面加载完成后的额外初始化
window.addEventListener('load', () => {
    // 如果 URL 中有哈希，滚动到对应位置
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 更新导航
                const navLink = document.querySelector(`.nav-link[href="${window.location.hash}"]`);
                if (navLink) {
                    updateNavigation(navLink);
                }
            }
        }, 100);
    }
});

// 导出一些有用的函数供全局使用
window.docsUtils = {
    copyCode,
    switchCodeTab,
    toggleSidebar,
    scrollToTop,
    searchDocs,
    testApiEndpoint
};