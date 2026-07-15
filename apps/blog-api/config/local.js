module.exports = {
  port: 8086,
  mysql: {
    host: '127.0.0.1',
    user: 'local',
    password: '',
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
    smtp_user: 'local',
    smtp_password: 'local',
    from_email: 'noreply@localhost',
    from_name: '晓黎团队',
  },
  storage: {
    provider: 'minio',
    endpoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'local-development',
    secretKey: 'local-development',
    bucket: 'xiaoli-company-content',
    region: 'us-east-1',
    publicUrl: '/uploads',
  },
  comment: {
    entityType: ['Article', 'Message'],
    adminCustomerEmail: [],
  },
  tokenSecretKey: 'local-development-only-change-me',
  vipCustomerEmail: [],
  author: {
    name: '晓黎团队',
    website: 'http://localhost:3015',
  },
};
