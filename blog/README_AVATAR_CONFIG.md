# Avatar & Profile Picture Configuration - Documentation Index

Complete exploration of how avatars and profile pictures are managed across the blog system.

## Documentation Files

### 1. AVATAR_FINDINGS_SUMMARY.txt (15 KB)
**Executive Summary** - Start here for a quick overview
- Section 1: Two avatar systems identified
- Section 2: File structure map
- Section 3: Complete request flows
- Section 4: Critical file locations
- Section 5: API endpoints
- Section 6: Database schema
- Section 7: Configuration variables
- Section 8: Security & rate limiting
- Section 9: Files created
- Section 10: Key insights

### 2. AVATAR_PROFILE_GUIDE.md (20 KB)
**Comprehensive Technical Reference** - Detailed implementation guide
- 12 complete sections with code snippets
- Every file with line numbers
- Database layer details
- Backend API documentation
- Admin interface walkthrough
- Frontend implementation
- Request/response flows
- Environment configuration
- File summary table
- Avatar types and locations
- Rate limits & security
- Quick start guide
- Troubleshooting

### 3. AVATAR_QUICK_REFERENCE.md (5.6 KB)
**Quick Lookup Reference** - Fast access to key information
- Key locations at a glance
- Backend files summary
- Admin interface files
- Frontend files
- Database tables
- API endpoints summary
- Configuration structure
- Common tasks (step-by-step)
- Rate limits & constraints
- Troubleshooting checklist

---

## System Overview

### Two Avatar Systems

**System A: User Avatars**
- Storage: Qiniu Cloud OSS `/blog/image/userAvatar/{userId}.png`
- Management: Admin → User List → Edit user → Upload avatar
- Display: User comments, messages, profiles
- Upload: POST /api/oss/uploadImageQueryIn?path=/image/userAvatar/{userId}

**System B: Author Avatar ("my-avatar")**
- Storage: MySQL configuration table (label="my-avatar")
- Management: Admin → Configuration → Search "my-avatar" → Edit
- Display: Home page, About page, Author comments
- Update: POST /api/configuration/updateConfiguration

---

## Directory Structure

```
/opt/home/blog/
├── space-log-express/              # Express.js backend
│   ├── models/
│   │   ├── user.js
│   │   └── configuration.js
│   ├── routes/
│   │   ├── user.js (avatar upload)
│   │   ├── oss.js (file upload)
│   │   └── configuration.js
│   ├── controller/
│   │   ├── userController.js
│   │   ├── ossController.js
│   │   └── configurationController.js
│   ├── services/
│   │   ├── qiniuService.js
│   │   └── configurationService.js
│   └── config/
│       └── pro.json (Qiniu config)
│
├── admin/                           # Vue 3 admin interface
│   └── src/
│       ├── pages/
│       │   └── user/
│       │       ├── UserListPage.vue (avatar upload)
│       │       └── AdminListPage.vue
│       │   └── configuration/
│       │       └── ConfigListPage.vue (my-avatar config)
│       └── api/
│           └── api.js
│
├── space-log-nuxt3/                # Nuxt3 frontend
│   └── app/
│       ├── pages/
│       │   ├── index.vue (shows my-avatar)
│       │   ├── about.vue (shows my-avatar)
│       │   ├── link.vue (shows my-avatar)
│       │   ├── message/[page].vue (user & author avatars)
│       │   └── log/article/detail/[id].vue (comments)
│       └── components/
│           └── common/
│               └── NaviHeader.vue (user avatar display)
│
└── Documentation (created)
    ├── AVATAR_FINDINGS_SUMMARY.txt
    ├── AVATAR_PROFILE_GUIDE.md
    ├── AVATAR_QUICK_REFERENCE.md
    └── README_AVATAR_CONFIG.md (this file)
```

---

## Key APIs

### Upload User Avatar
```
POST /api/oss/uploadImageQueryIn?path=/image/userAvatar/{userId}
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data
```

### Update Author Avatar Configuration
```
POST /api/configuration/updateConfiguration
Authorization: Bearer {admin-token}
Body: {
  id: integer,
  label: "my-avatar",
  content: "https://example.com/avatar.png",
  type: "STRING"
}
```

### Get Configuration (Public)
```
GET /api/configuration/reception/getConfig
Response: {
  "my-avatar": {
    id: integer,
    label: "my-avatar",
    content: "https://example.com/avatar.png",
    type: "STRING"
  }
}
```

---

## Common Tasks

### Update Author Profile Picture
1. Login to `/mgmt` with admin credentials
2. Navigate to Configuration page
3. Search for "my-avatar"
4. Click Edit
5. Update content field with new URL
6. Save
7. Frontend updates automatically

### Upload User Avatar
1. Login to `/mgmt`
2. Go to User List page
3. Find target user, click "编辑"
4. Click "上传头像" in avatar column
5. Select image (PNG/JPEG/GIF/WEBP)
6. Automatically uploads and displays

---

## Database Schema

### user table
```sql
id (BIGINT, PRIMARY KEY)
name (VARCHAR 255)
mail (VARCHAR 255, UNIQUE)
createTime (DATETIME)
updatedTime (DATETIME)
```
**Note:** Avatar stored externally at `/blog/image/userAvatar/{id}.png`

### configuration table
```sql
id (INT, PRIMARY KEY)
label (VARCHAR 255)
content (JSON)
type (VARCHAR 150)
```
**Avatar Entry:** label="my-avatar", type="STRING", content="{url}"

---

## Security Information

### Rate Limits
- Avatar upload: 5 per time period per user
- Error: "触发限制啦⛔️"

### File Constraints
- Max size: 30MB
- Allowed types: PNG, JPEG, GIF, WEBP, TIFF, HEIC, ICO, SVG
- Stored as: PNG format

### Authentication
- All uploads require Bearer token (JWT)
- Token extracted from Authorization header
- User ID derived from token claims

---

## Environment Configuration

### Backend (config/pro.json)
```json
{
  "qiniu": {
    "accessKey": "qiniu-access-key",
    "secretKey": "qiniu-secret-key",
    "bucket": "space-log",
    "baseDir": "/blog/",
    "domain": "qiniu-domain.com"
  }
}
```

### Frontend
```bash
VUE_APP_BASE_URL=https://xiangleideng.site/api
VUE_APP_OSS_IMAGE_BASE_URL=https://qiniu-domain.com
VUE_APP_OSS_BASE_DIR=/blog/
```

---

## Frontend Avatar Display

### Author Avatar ("my-avatar")
Used on:
- `/opt/home/blog/space-log-nuxt3/app/pages/index.vue` - Home page
- `/opt/home/blog/space-log-nuxt3/app/pages/about.vue` - About page
- `/opt/home/blog/space-log-nuxt3/app/pages/link.vue` - Friends page
- Comments and messages (when userId == -1)

Access: `store.$state.config['my-avatar']?.content`

### User Avatar
Used on:
- `/opt/home/blog/space-log-nuxt3/app/pages/message/[page].vue` - Messages
- `/opt/home/blog/space-log-nuxt3/app/pages/log/article/detail/[id].vue` - Comments
- `/opt/home/blog/space-log-nuxt3/app/components/common/NaviHeader.vue` - Header

Access: `${config.public.ossUrl}/image/userAvatar/${userId}.png`

---

## Troubleshooting

### Avatar Not Displaying
- Verify Qiniu Cloud credentials in pro.json
- Check VUE_APP_OSS_IMAGE_BASE_URL environment variable
- Verify file exists in OSS
- Clear browser cache
- Check OSS bucket permissions

### Upload Rate Limit Error
- Wait for rate limit window (usually 5 minute period)
- Check Redis cache status
- Verify authorization header present

### Configuration Not Updating
- Verify admin token is valid
- Check checkPermissions() middleware
- Ensure label="my-avatar" exactly matches
- Verify database connection

---

## Further Reading

For detailed information on specific components, see:

**Backend Implementation:** AVATAR_PROFILE_GUIDE.md (Section 2)
**Admin Interface:** AVATAR_PROFILE_GUIDE.md (Section 3)
**Frontend Implementation:** AVATAR_PROFILE_GUIDE.md (Section 4)
**Request Flows:** AVATAR_PROFILE_GUIDE.md (Section 6)
**Troubleshooting:** AVATAR_PROFILE_GUIDE.md (Section 12)

For quick lookups: AVATAR_QUICK_REFERENCE.md

---

## Document Statistics

- Total Lines: 1,266
- Total Size: 40.6 KB
- Created: 2025-10-23
- System: Express.js + Vue 3 Admin + Nuxt 3 Blog

---

**Location:** `/opt/home/blog/`

All absolute file paths provided throughout documentation.
