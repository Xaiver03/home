module.exports = {
  port: 8087,
  mysql: {
    host: '127.0.0.1',
    user: 'required',
    password: 'required',
    database: 'xiaoli_company_content',
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    password: '',
  },
  mail: {
    smtp_host: '127.0.0.1',
    smtp_port: 1025,
    smtp_user: 'required',
    smtp_password: 'required',
    from_email: 'noreply@localhost',
    from_name: '晓黎团队',
  },
  storage: {
    provider: 'minio',
    endpoint: '127.0.0.1',
    port: 9100,
    useSSL: false,
    accessKey: 'required',
    secretKey: 'required',
    bucket: 'xiaoli-company-content',
    region: 'us-east-1',
    publicUrl: '/uploads',
  },
  comment: {
    entityType: ['Article', 'Message'],
    adminCustomerEmail: [],
  },
  tokenSecretKey: 'required',
  vipCustomerEmail: [],
  author: {
    name: '晓黎团队',
    website: 'http://x-creative.team',
  },
};
