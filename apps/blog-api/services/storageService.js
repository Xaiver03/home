const fs = require('fs');
const path = require('path');
const { IncomingForm } = require('formidable');
const Minio = require('minio');
const config = require('config');

const storageConfig = config.get('storage');

if (storageConfig.provider !== 'minio') {
  throw new Error('对象存储必须配置为 MinIO（storage.provider=minio）');
}

const requiredConfig = ['endpoint', 'accessKey', 'secretKey', 'bucket'];
const missingConfig = requiredConfig.filter((key) => !storageConfig[key]);
if (missingConfig.length > 0) {
  throw new Error(`MinIO 配置缺失：${missingConfig.join(', ')}`);
}

const client = new Minio.Client({
  endPoint: storageConfig.endpoint,
  port: Number(storageConfig.port || 9000),
  useSSL: storageConfig.useSSL === true || storageConfig.useSSL === 'true',
  accessKey: storageConfig.accessKey,
  secretKey: storageConfig.secretKey,
  region: storageConfig.region || undefined,
});

const bucket = storageConfig.bucket;
const publicUrl = storageConfig.publicUrl || '/uploads';
const tempDir = path.resolve(__dirname, '../temp/images');

fs.mkdirSync(tempDir, { recursive: true });

const objectName = (value, allowEmpty = false) => {
  const normalized = path.posix.normalize(String(value || '').replaceAll('\\', '/'));
  const clean = normalized.replace(/^\/+/, '');
  if ((!clean || clean === '.') && allowEmpty) return '';
  if (!clean || clean === '.' || clean.startsWith('../') || clean.includes('/../')) {
    throw new Error(`非法对象路径：${value}`);
  }
  return clean;
};

const publicPath = (value) => `${publicUrl.replace(/\/$/, '')}/${objectName(value)}`;

const putObject = (key, data, size, metaData = {}) => new Promise((resolve, reject) => {
  client.putObject(bucket, key, data, size, metaData, (error, result) => {
    if (error) return reject(error);
    resolve(result);
  });
});

const getObject = (key) => new Promise((resolve, reject) => {
  client.getObject(bucket, key, (error, stream) => {
    if (error) return reject(error);
    resolve(stream);
  });
});

const statObject = (key) => new Promise((resolve, reject) => {
  client.statObject(bucket, key, (error, stat) => {
    if (error) return reject(error);
    resolve(stat);
  });
});

const deleteObject = (key) => new Promise((resolve, reject) => {
  client.removeObject(bucket, key, (error) => {
    if (error) return reject(error);
    resolve(200);
  });
});

const listObjects = (prefix) => new Promise((resolve, reject) => {
  const result = [];
  const stream = client.listObjectsV2(bucket, prefix, false);
  stream.on('data', (item) => result.push({
    name: item.prefix || item.name,
    type: item.prefix ? 'directory' : 'file',
    size: item.size || 0,
  }));
  stream.on('error', reject);
  stream.on('end', () => resolve(result));
});

module.exports = {
  readAndSaveFile: async (req) => new Promise((resolve, reject) => {
    const form = new IncomingForm({ uploadDir: tempDir, maxFileSize: 30 * 1024 * 1024 });
    form.parse(req, (error, fields, files) => {
      if (error) {
        return reject({
          msg: error.code === 1009 ? '文件过大，请压缩后上传（30MB以下）' : `文件上传出错：${error.message}`,
          status: 500,
        });
      }
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) return reject({ msg: '未找到上传文件', status: 400 });
      resolve({ fields, files: { file: [file] }, tempFilePath: file.filepath });
    });
  }),

  deleteLocalFile: (filePath) => {
    try { fs.unlinkSync(filePath); } catch (error) { /* temporary file cleanup is best effort */ }
  },

  uploadFileStream: async (storagePath, tempFilePath) => {
    const key = objectName(storagePath);
    const stat = fs.statSync(tempFilePath);
    await putObject(key, fs.createReadStream(tempFilePath), stat.size);
    return { code: 200, msg: '上传成功', url: publicPath(key), name: `/${key}`, res: { status: 200 } };
  },

  uploadBuffer: async (storagePath, buffer, contentType) => {
    const key = objectName(storagePath);
    await putObject(key, buffer, buffer.length, contentType ? { 'Content-Type': contentType } : {});
    return { code: 200, msg: '上传成功', url: publicPath(key), name: `/${key}`, res: { status: 200 } };
  },

  uploadOrUpdateFile: async (storagePath, content) => {
    await putObject(objectName(storagePath), Buffer.from(content, 'utf8'), Buffer.byteLength(content), {
      'Content-Type': 'text/markdown; charset=utf-8',
    });
    return 200;
  },

  getFileContent: async (storagePath) => {
    const stream = await getObject(objectName(storagePath));
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
  },

  getFileInPath: async (directoryPath) => listObjects(objectName(directoryPath || '', true)),

  deleteFile: async (storagePath) => {
    try {
      await statObject(objectName(storagePath));
      return await deleteObject(objectName(storagePath));
    } catch (error) {
      if (error.code === 'NotFound' || error.code === 'NoSuchKey' || error.statusCode === 404) return 404;
      throw error;
    }
  },

  getObjectStream: async (storagePath) => {
    const key = objectName(storagePath);
    const [stream, stat] = await Promise.all([getObject(key), statObject(key)]);
    return { stream, stat };
  },
};
