const fs = require('fs');
const path = require('path');
const { IncomingForm } = require('formidable');
const config = require('config');

// 本地存储配置
const storageConfig = config.has('storage') ? config.get('storage') : {
  baseDir: path.resolve(__dirname, '../public/uploads'),
  publicUrl: '/uploads',
};

const UPLOAD_DIR = storageConfig.baseDir;

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

module.exports = {
  /**
   * 读取请求中的文件并保存到临时目录
   */
  readAndSaveFile: async (req) => {
    return new Promise((resolve, reject) => {
      const form = new IncomingForm({
        uploadDir: path.resolve(__dirname, '../temp/images'),
        maxFileSize: 30 * 1024 * 1024,
      });
      form.parse(req, (err, fields, files) => {
        if (err) {
          const error = {
            msg: `文件上传出错，错误代码：${err.code || err.message}`,
            status: 500,
          };
          if (err.code === 1009) {
            error.msg = '文件过大，请压缩后上传（30MB以下）';
          }
          return reject(error);
        }
        const tempFilePath = files.file[0].filepath;
        resolve({ fields, files, tempFilePath });
      });
    });
  },

  /** 删除本地临时文件 */
  deleteLocalFile: (filePath) => {
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
  },

  /**
   * 上传文件到本地存储
   * @param {String} storagePath 存储路径（包含文件名及后缀）
   * @param {String} tempFilePath 临时文件路径
   * @returns 上传结果
   */
  uploadFileStream: async (storagePath, tempFilePath) => {
    const fullPath = path.join(UPLOAD_DIR, storagePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 复制文件到存储目录
    fs.copyFileSync(tempFilePath, fullPath);

    const publicPath = storagePath.startsWith('/') ? storagePath : '/' + storagePath;
    return {
      code: 200,
      msg: '上传成功',
      url: `${publicPath}`,
      name: publicPath,
      res: { status: 200 },
    };
  },

  /**
   * 获取本地目录下的文件列表
   */
  getFileInPath: async (dirPath, delimiter = null) => {
    const fullPath = path.join(UPLOAD_DIR, dirPath || '');
    if (!fs.existsSync(fullPath)) {
      return [];
    }

    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    return items.map(item => {
      const relativePath = path.join(dirPath || '', item.name);
      return {
        name: item.isDirectory() ? relativePath + '/' : relativePath,
        type: item.isDirectory() ? 'directory' : 'file',
        size: item.isDirectory() ? 0 : fs.statSync(path.join(fullPath, item.name)).size,
      };
    });
  },

  /**
   * 删除本地文件
   */
  deleteFile: async (filePath) => {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return 200;
    }
    return 404;
  },

  /**
   * 上传文本内容到本地文件
   */
  uploadOrUpdateFile: async (filePath, content) => {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    return 200;
  },

  /**
   * 上传 Buffer 到本地存储
   */
  uploadBuffer: async (storagePath, buffer) => {
    const fullPath = path.join(UPLOAD_DIR, storagePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, buffer);

    const publicPath = storagePath.startsWith('/') ? storagePath : '/' + storagePath;
    return {
      code: 200,
      msg: '上传成功',
      url: `${publicPath}`,
      name: publicPath,
      res: { status: 200 },
    };
  },

  /**
   * 获取本地文件内容
   */
  getFileContent: async (filePath) => {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
    }
    throw new Error(`文件不存在: ${filePath}`);
  },
};
