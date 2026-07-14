const utils = require("../utils/index");
const storageService = require("../services/storageService");
const tokenService = require("../services/tokenService");
const uuid = require("uuid");
let path = require("path");

// 本地存储公开 URL 前缀
const STORAGE_URL = '/uploads';

module.exports = {
  // 上传图片到本地存储
  uploadImage: async (req, res) => {
    const { fields, files, tempFilePath } = await storageService.readAndSaveFile(req);
    const storagePath =
      fields.path[0] +
      (fields.uuidOrNot[0] == "true"
        ? uuid.v4() + path.extname(files.file[0].originalFilename)
        : files.file[0].originalFilename);
    const result = await storageService.uploadFileStream(storagePath, tempFilePath);
    storageService.deleteLocalFile(tempFilePath);
    res.json(
      utils.postMessage(result.code, result.msg, {
        url: STORAGE_URL + result.url,
        path: result.name,
      })
    );
  },

  // 上传图片到本地存储（query 中指定路径）
  uploadImageQueryIn: async (req, res) => {
    const { fields, files, tempFilePath } = await storageService.readAndSaveFile(req);
    const storagePath = req.query.path + ".png";
    const result = await storageService.uploadFileStream(storagePath, tempFilePath);
    storageService.deleteLocalFile(tempFilePath);
    res.json(
      utils.postMessage(result.code, result.msg, {
        url: STORAGE_URL + result.url,
        path: result.name,
      })
    );
  },

  // 客户端上传图片
  customerUploadImage: async (req, res) => {
    let tokenData = tokenService.checkToken(req.headers["authorization"]);
    const allowFilePath = ["/temp/", `/image/messageImage/`];
    const allowFileType = [
      "image/png", "image/jpeg", "image/gif", "image/webp",
      "image/tiff", "image/heic", "image/x-icon", "image/svg+xml",
    ];
    const { fields, files, tempFilePath } = await storageService.readAndSaveFile(req);
    if (
      !allowFilePath.includes(fields.path[0]) ||
      !allowFileType.includes(files.file[0].mimetype)
    ) {
      utils.throwError(
        { message: "文件上传失败", description: "请按上传规则上传文件（指定路径and图片格式）" },
        403
      );
    }
    const storagePath =
      fields.path[0] +
      tokenData.data.id +
      "/" +
      (fields.uuidOrNot[0] == "true"
        ? uuid.v4() + path.extname(files.file[0].originalFilename)
        : files.file[0].originalFilename);
    const result = await storageService.uploadFileStream(storagePath, tempFilePath);
    storageService.deleteLocalFile(tempFilePath);
    res.json(
      utils.postMessage(result.code, result.msg, {
        url: STORAGE_URL + result.url,
        path: result.name,
      })
    );
  },

  // 获取本地存储文件列表
  getFileInPath: async (req, res) => {
    const files = await storageService.getFileInPath(req.query.path, req.query.delimiter);
    res.json(files);
  },

  // 删除本地存储文件
  deleteImage: async (req, res) => {
    const result = await storageService.deleteFile(req.query.path);
    res.json(utils.postMessage(result, result === 200 ? "删除成功" : "文件不存在"));
  },

  // 客户端删除文件
  customerDeleteImage: async (req, res) => {
    let tokenData = tokenService.checkToken(req.headers["authorization"]);
    const allowFilePath = [
      `/temp/${tokenData.data.id}/`,
      `/image/messageImage/${tokenData.data.id}/`,
    ];
    const lastSlashIndex = req.query.path.lastIndexOf("/");
    let directory = req.query.path.substring(0, lastSlashIndex + 1);
    if (!directory.startsWith("/")) directory = "/" + directory;
    if (allowFilePath.includes(directory)) {
      const result = await storageService.deleteFile(req.query.path);
      res.json(utils.postMessage(result, result === 200 ? "删除成功" : "文件不存在"));
    } else {
      utils.throwError(
        { message: "无权删除该文件", description: "只能删除指定路径的文件" },
        403
      );
    }
  },
};
