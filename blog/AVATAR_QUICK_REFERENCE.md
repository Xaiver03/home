# Avatar/Profile Picture Configuration - Quick Reference

## Key Locations At a Glance

### User Avatars (Uploaded by Admins)
- **Admin Panel:** `/mgmt` → User List → Select user → Edit → Upload avatar
- **Upload Endpoint:** `POST /api/oss/uploadImageQueryIn?path=/image/userAvatar/{userId}`
- **Storage:** Qiniu Cloud OSS at `/image/userAvatar/{userId}.png`
- **Display:** Comments and messages sections on blog
- **Frontend Component:** `/opt/home/blog/space-log-nuxt3/app/components/common/NaviHeader.vue`

### Author Profile Avatar ("my-avatar")
- **Admin Panel:** `/mgmt` → Configuration → Search "my-avatar"
- **Update Endpoint:** `POST /api/configuration/updateConfiguration`
- **Storage:** URL in MySQL `configuration` table (label="my-avatar")
- **Display:** Home page, About page, Author comments
- **Frontend Usage:** `store.$state.config['my-avatar']?.content`
- **Files Using It:**
  - `/opt/home/blog/space-log-nuxt3/app/pages/index.vue` (Home)
  - `/opt/home/blog/space-log-nuxt3/app/pages/about.vue` (About)
  - `/opt/home/blog/space-log-nuxt3/app/pages/message/[page].vue` (Messages)
  - `/opt/home/blog/space-log-nuxt3/app/pages/log/article/detail/[id].vue` (Comments)
  - `/opt/home/blog/space-log-nuxt3/app/pages/link.vue` (Friends)

---

## Backend Architecture Files

| System | File Path | Function |
|--------|-----------|----------|
| User Avatar | `/opt/home/blog/space-log-express/routes/user.js:18-25` | Upload route |
| | `/opt/home/blog/space-log-express/controller/userController.js:157-180` | Upload handler |
| Config Avatar | `/opt/home/blog/space-log-express/routes/configuration.js` | Config CRUD |
| | `/opt/home/blog/space-log-express/controller/configurationController.js` | Config logic |
| OSS Upload | `/opt/home/blog/space-log-express/routes/oss.js` | OSS endpoints |
| | `/opt/home/blog/space-log-express/controller/ossController.js:30-45` | Upload handler |
| Qiniu Service | `/opt/home/blog/space-log-express/services/qiniuService.js` | Cloud storage |

---

## Admin Interface Files

| Component | File Path |
|-----------|-----------|
| User List + Avatar | `/opt/home/blog/admin/src/pages/user/UserListPage.vue` (Line 20-33) |
| Configuration Editor | `/opt/home/blog/admin/src/pages/configuration/ConfigListPage.vue` |
| API Methods | `/opt/home/blog/admin/src/api/api.js` (Line 221-238) |

---

## Frontend Files

| Page | File Path | Avatar Field |
|------|-----------|--------------|
| Home | `/opt/home/blog/space-log-nuxt3/app/pages/index.vue` | my-avatar config |
| About | `/opt/home/blog/space-log-nuxt3/app/pages/about.vue` | my-avatar config |
| Friends | `/opt/home/blog/space-log-nuxt3/app/pages/link.vue` | my-avatar config |
| Messages | `/opt/home/blog/space-log-nuxt3/app/pages/message/[page].vue` | my-avatar OR user avatar |
| Comments | `/opt/home/blog/space-log-nuxt3/app/pages/log/article/detail/[id].vue` | my-avatar OR user avatar |
| Header | `/opt/home/blog/space-log-nuxt3/app/components/common/NaviHeader.vue` | user avatar |

---

## Database Tables

### user table
```sql
- id (BIGINT, Primary Key)
- name (VARCHAR 255)
- mail (VARCHAR 255, Unique)
- createTime (DATE)
- updatedTime (DATE)
```
**Avatar Storage:** External at `/blog/image/userAvatar/{userId}.png`

### configuration table
```sql
- id (INTEGER, Primary Key)
- label (VARCHAR 255) - Config name (e.g., "my-avatar")
- content (JSON) - Value (URL or metadata)
- type (VARCHAR 150) - "STRING" or "JSON"
```
**Key Entry:** label="my-avatar", type="STRING", content="{url}"

---

## API Endpoints Summary

### Upload Avatars
- `POST /api/oss/uploadImageQueryIn?path=/image/userAvatar/{userId}` (Admin)
- Headers: `Authorization: Bearer {token}`
- Response: `{ url, path, name }`

### Configuration Management
- `GET /api/configuration/getAllConfiguration` (Admin)
- `GET /api/configuration/reception/getConfig` (Public)
- `POST /api/configuration/addConfiguration` (Admin)
- `POST /api/configuration/updateConfiguration` (Admin)
- `DELETE /api/configuration/deleteConfiguration` (Admin)

---

## Configuration Structure

### Frontend Env Variables
```bash
VUE_APP_BASE_URL=https://xiangleideng.site/api
VUE_APP_OSS_IMAGE_BASE_URL=https://qiniu-domain.com
VUE_APP_OSS_BASE_DIR=/blog/
```

### Backend Config (config/pro.json)
```json
{
  "qiniu": {
    "accessKey": "...",
    "secretKey": "...",
    "bucket": "space-log",
    "baseDir": "/blog/",
    "domain": "qiniu-domain.com"
  }
}
```

---

## Common Tasks

### Change Author Profile Picture
1. Admin Panel: `/mgmt` → Configuration
2. Search: "my-avatar"
3. Click Edit
4. Update content field with image URL
5. Save
6. Frontend updates automatically

### Upload User Avatar
1. Admin Panel: `/mgmt` → User List
2. Find user → Click Edit
3. Click "上传头像" in avatar column
4. Select image (PNG/JPEG/GIF/WEBP)
5. Automatically uploads to `/image/userAvatar/{userId}.png`

### View Avatar Locations
- Author avatar: `store.$state.config['my-avatar']?.content`
- User avatar: `https://qiniu-domain.com/blog/image/userAvatar/{userId}.png`

---

## Rate Limits & Constraints

- **File Size:** Max 30MB
- **Upload Rate:** 5 per time period per user
- **Format:** PNG/JPEG/GIF/WEBP
- **Auth:** Bearer token required

---

## Troubleshooting Checklist

[ ] Verify Qiniu Cloud config in pro.json
[ ] Check OSS domain in environment variables
[ ] Verify auth token in request
[ ] Check file size (< 30MB)
[ ] Verify file type (PNG/JPEG/GIF/WEBP)
[ ] Check OSS bucket permissions
[ ] Clear browser cache
[ ] Verify database configuration table entry exists
[ ] Check Redis cache for rate limits
[ ] Verify CORS headers on OSS bucket

