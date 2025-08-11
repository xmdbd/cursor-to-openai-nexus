const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ADMIN_FILE = path.join(__dirname, '../data/admin.json');

// 生成盐值
function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

// 使用盐值哈希密码
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// 自动创建管理员账号
function createAdmin() {
    try {
        console.log('自动创建管理员账户...\n');

        // 默认管理员账号信息
        const username = 'admin';
        const password = 'admin123';  // 默认密码，用户可以在启动后修改

        // 生成盐值和密码哈希
        const salt = generateSalt();
        const hash = hashPassword(password, salt);

        // 创建管理员数据
        const adminData = {
            admin: {
                username,
                salt,
                hash
            }
        };

        // 确保data目录存在
        const dataDir = path.dirname(ADMIN_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // 写入文件
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2));

        console.log('✅ 管理员账户创建成功！');
        console.log('📋 登录信息:');
        console.log('   用户名: admin');
        console.log('   密码: admin123');
        console.log('⚠️  请在首次登录后立即修改密码！\n');

        return true;
    } catch (error) {
        console.error('❌ 创建管理员账户失败:', error);
        return false;
    }
}

createAdmin();