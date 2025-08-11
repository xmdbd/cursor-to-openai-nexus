const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ADMIN_FILE = path.join(__dirname, 'data/admin.json');

// 生成盐值
function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

// 使用盐值哈希密码
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// 创建管理员账号
function createAdmin() {
    try {
        console.log('正在创建管理员账户...\n');

        // 管理员账号信息
        const username = 'admin';
        const password = 'admin123';

        // 生成盐值和密码哈希
        const salt = generateSalt();
        const hash = hashPassword(password, salt);

        console.log('生成的管理员信息:');
        console.log('用户名:', username);
        console.log('密码:', password);
        console.log('盐值:', salt);
        console.log('哈希:', hash);

        // 创建管理员数据
        const adminData = {
            admin: {
                username,
                salt,
                hash
            }
        };

        // 写入文件
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 4));

        console.log('\n✅ 管理员账户已创建并保存到:', ADMIN_FILE);
        console.log('📋 登录信息:');
        console.log('   用户名: admin');
        console.log('   密码: admin123');

        // 验证文件内容
        const savedData = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
        console.log('\n✅ 验证文件内容:', JSON.stringify(savedData, null, 2));

        return true;
    } catch (error) {
        console.error('❌ 创建管理员账户失败:', error);
        return false;
    }
}

createAdmin();