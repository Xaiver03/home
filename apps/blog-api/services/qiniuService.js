const { client } = require('../db/qiniu');
const stream = require('stream');
const fs = require('fs');
const config = require('config');
const qiniuConfig = config.get('qiniu');
const path = require('path');
const { IncomingForm } = require('formidable');
const qiniu = require('qiniu');

module.exports = {
  /**
   * 读取请求中的文件
   * @param {*} req 请求对象
   * @returns {Object} { fields, files, tempFilePath } fields(文件字段)，files(文件)，tempFilePath(本地存储路径)
   */
  readAndSaveFile: async (req) => {
    return new Promise((resolve, reject) => {
      const form = new IncomingForm({
        uploadDir: path.resolve(__dirname, '../temp/images'), // 定义文件的临时存储位置
        maxFileSize: 30 * 1024 * 1024, // 大小限制为30M
      });
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.log('文件上传出错:', err);
          const error = {
            msg: `文件上传出错，请联系管理员，错误代码：${err.code}`,
            status: 500,
          };
          switch (err.code) {
            case 1009:
              error.msg = '文件过大，请压缩后上传（30MB以下）';
              error.status = '500';
              break;
          }
          return reject(error);
        }
        const tempFilePath = files.file[0].filepath;
        resolve({ fields, files, tempFilePath });
      });
    });
  },

  /**
   * 删除本地文件
   * @param {String} filePath  文件位置
   */
  deleteLocalFile: (filePath) => {
    fs.unlinkSync(filePath); // 删除临时文件
  },

  /**
   * 上传文本内容到本地文件系统指定路径，可用于覆盖原文件内容
   * @param {String} filePath 上传文件的本地目录位置
   * @param {String} content 文本内容
   * @returns 若果上传成功则返回状态，否则返回-1
   */
  uploadOrUpdateFile: async (filePath, content) => {
    try {
      const baseDir = qiniuConfig.baseDir || '/opt/home/blog';
      const fullPath = path.join(baseDir, filePath);
      const dir = path.dirname(fullPath);

      // 确保目录存在
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      return 200;
    } catch (e) {
      console.log(e);
      throw new Error(`${e.message}`);
    }
  },

  /**
   * 七牛云删除文件
   * @param {String} path 七牛云中的文件路径
   * @param {Boolean} prefixOrNot 是否添加qiniuConfig.baseDir前缀
   * @returns 若果删除成功则返回状态，否则返回-1
   */
  deleteFile: async (path, prefixOrNot = true) => {
    try {
      if (!client) {
        throw new Error('七牛云客户端未初始化');
      }

      const key = (prefixOrNot ? qiniuConfig.baseDir : '') + path;

      return new Promise((resolve, reject) => {
        client.bucketManager.delete(client.bucket, key, (err, respBody, respInfo) => {
          if (err) {
            console.log('七牛云删除文件失败:', err);
            reject(err);
          } else if (respInfo.statusCode === 200) {
            resolve(200);
          } else {
            console.log('七牛云删除文件失败:', respInfo.statusCode, respBody);
            resolve(respInfo.statusCode);
          }
        });
      });
    } catch (e) {
      console.log(e);
      throw new Error(`${e.message}`);
    }
  },

  /**
   * 获取七牛云指定路径下的文件列表
   * @param {String} path 七牛云路径 注：不以 / 开头和结尾
   * @param {String} delimiter 默认null。若为'/'分割文件和文件夹，同时只展示当前目录下的内容
   * @returns 若果获取成功则返回文件列表，否则返回-1
   */
  getFileInPath: async (path, delimiter = null) => {
    try {
      if (!client) {
        throw new Error('七牛云客户端未初始化');
      }

      const prefix = qiniuConfig.baseDir.replace(/\//g, '') + path;

      return new Promise((resolve, reject) => {
        client.bucketManager.listPrefix(client.bucket, {
          limit: 500,
          prefix,
          delimiter,
        }, (err, respBody, respInfo) => {
          if (err) {
            console.log('七牛云获取文件列表失败:', err);
            reject(err);
          } else if (respInfo.statusCode === 200) {
            const objects = respBody.items || [];
            if (respBody.commonPrefixes) {
              objects.push(...respBody.commonPrefixes.map(prefix => ({ name: prefix })));
            }
            resolve(objects);
          } else {
            console.log('七牛云获取文件列表失败:', respInfo.statusCode, respBody);
            reject(new Error(`获取文件列表失败: ${respInfo.statusCode}`));
          }
        });
      });
    } catch (e) {
      console.log(e);
      throw new Error(`${e.message}`);
    }
  },

  /**
   * 获取本地指定路径下的文件内容（回退到七牛云）
   * @param {String} filePath 本地或七牛云中的路径(包含文件名及后缀)
   * @returns 若成功返回文本，否则返回-1
   */
  getFileContent: async (filePath) => {
    try {
      const baseDir = qiniuConfig.baseDir || '/opt/home/blog';
      const localPath = path.join(baseDir, filePath);

      // 优先从本地文件读取
      if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath, 'utf8');
      }

      // 本地文件不存在，回退到七牛云（如果配置正确）
      if (!client) {
        throw new Error('本地文件不存在且七牛云客户端未初始化');
      }

      const fileUrl = `https://${client.domain}/${qiniuConfig.baseDir}${filePath}`;
      const fetch = require('node-fetch');

      const response = await fetch(fileUrl);
      if (response.ok) {
        return await response.text();
      } else {
        throw new Error(`获取文件内容失败: ${response.status}`);
      }
    } catch (e) {
      console.log(e);
      throw new Error(`${e.message}`);
    }
  },

  /**
   * 流式上传文件到七牛云
   * @param {String} path 七牛云中的路径(包含文件名及后缀)
   * @param {String} filePath 文件所在位置
   * @returns 若成功返回200状态，否则返回-1
   */
  uploadFileStream: async (path, filePath) => {
    try {
      if (!client) {
        throw new Error('七牛云客户端未初始化');
      }

      const key = qiniuConfig.baseDir + path;
      const uploadToken = client.uploadToken;

      return new Promise((resolve, reject) => {
        const putExtra = new qiniu.form_up.PutExtra();
        client.formUploader.putFile(uploadToken, key, filePath, putExtra, (respErr, respBody, respInfo) => {
          if (respErr) {
            console.log('七牛云流式上传文件失败:', respErr);
            reject(respErr);
          } else if (respInfo.statusCode === 200) {
            const result = {
              code: 200,
              msg: '上传图片成功✅',
              url: `https://${client.domain}/${key}`,
              name: key,
              res: { status: 200 },
            };
            resolve(result);
          } else {
            console.log('七牛云流式上传文件失败:', respInfo.statusCode, respBody);
            reject(new Error(`上传失败: ${respInfo.statusCode}`));
          }
        });
      });
    } catch (e) {
      console.log('七牛云流式上传文件出错:', e);
      throw new Error(`${e.message}`);
    }
  },
};