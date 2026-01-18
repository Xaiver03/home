# Blog System Avatar/Profile Picture Configuration - Complete Guide

## Summary
The blog system manages user avatars and profile pictures through multiple integrated components across the Express.js backend, Vue 3 admin interface, and Nuxt3 frontend.

---

## 1. DATABASE LAYER

### User Table (Primary Avatar Storage)
**Location:** `/opt/home/blog/space-log-express/models/user.js`

```javascript
// Database model for users
{
  id: BIGINT (Primary Key),
  name: STRING(255) - Username,
  mail: STRING(255) - Email (Unique),
  createTime: DATE,
  updatedTime: DATE
}
```

**Note:** The user table itself does NOT store avatar URLs. Avatars are stored in Qiniu Cloud OSS with a naming convention: `/image/userAvatar/{userId}.png`

### Configuration Table (Master Avatar Settings)
**Location:** `/opt/home/blog/space-log-express/models/configuration.js`

```javascript
{
  id: INTEGER (Primary Key),
  label: STRING(255) - Configuration name (e.g., "my-avatar"),
  content: JSON - Configuration value (stores URLs or metadata),
  type: STRING(150) - Data type (STRING or JSON)
}
```

**Key Configuration Entry:**
- **Label:** `my-avatar`
- **Content:** Main avatar/profile picture URL for the blog author
- **Type:** STRING
- **Example:** `https://qiniu-domain.com/blog/image/avatar/author-avatar.png`

---

## 2. BACKEND (Express.js API) - File Location: `/opt/home/blog/space-log-express`

### Avatar Upload Endpoints

#### A. User Avatar Upload (Qiniu Cloud)
**Route:** `/api/user/uploadUserAvatar`
**Method:** POST
**File:** `/opt/home/blog/space-log-express/routes/user.js` (Line 18-25)

```javascript
router.post(
  "/uploadUserAvatar",
  limitCustomerFileUpload(5, undefined, "customer_upload_image", {...}),
  userController.uploadUserAvatar
);
```

**Controller Implementation:** `/opt/home/blog/space-log-express/controller/userController.js` (Line 157-180)

```javascript
uploadUserAvatar: async (req, res) => {
  // Extract user ID from JWT token
  let tokenData = tokenService.checkToken(req.headers["authorization"]);
  
  // File handling
  const { fields, files, tempFilePath } = await qiniuService.readAndSaveFile(req);
  
  // Upload path in Qiniu Cloud
  const ossPath = "/image/userAvatar/" + tokenData.data.id + '.png';
  
  // Upload to Qiniu Cloud
  result = await qiniuService.uploadFileStream(ossPath, tempFilePath);
  
  // Delete temporary local file
  fs.unlinkSync(tempFilePath);
  
  // Return response with upload URL
  res.json(utils.postMessage(result.code, {...}, { url: result.url, path: result.name }));
}
```

**Key Features:**
- Rate limited to 5 uploads per time period per user
- Uploaded files stored as `.png` format
- Path: `/image/userAvatar/{userId}.png`
- Requires Bearer token authentication
- Returns upload URL and path

#### B. Generic Image Upload (Admin-only)
**Route:** `/api/oss/uploadImageQueryIn`
**Method:** POST
**File:** `/opt/home/blog/space-log-express/routes/oss.js` (Line 10-14)

```javascript
router.post(
  "/uploadImageQueryIn",
  checkPermissions(),
  ossController.uploadImageQueryIn
);
```

**Controller:** `/opt/home/blog/space-log-express/controller/ossController.js` (Line 30-45)

```javascript
uploadImageQueryIn: async (req, res) => {
  const { fields, files, tempFilePath } = await qiniuService.readAndSaveFile(req);
  
  // Path comes from query parameter: ?path=/image/userAvatar/123
  const qiniuPath = req.query.path + ".png";
  
  result = await qiniuService.uploadFileStream(qiniuPath, tempFilePath);
  qiniuService.deleteLocalFile(tempFilePath);
  
  res.json(utils.postMessage(result.code, result.msg, {...}));
}
```

### Configuration Management Endpoints

**Route File:** `/opt/home/blog/space-log-express/routes/configuration.js`

#### Get All Configurations
**Endpoint:** `GET /api/configuration/getAllConfiguration` (Admin-only)
**Endpoint:** `GET /api/configuration/reception/getConfig` (Public)
**Controller:** `/opt/home/blog/space-log-express/controller/configurationController.js` (Line 7-18)

#### Create Configuration
**Endpoint:** `POST /api/configuration/addConfiguration` (Admin-only)

#### Update Configuration
**Endpoint:** `POST /api/configuration/updateConfiguration` (Admin-only)

#### Delete Configuration
**Endpoint:** `DELETE /api/configuration/deleteConfiguration` (Admin-only)

### Services

#### Qiniu Cloud Service
**File:** `/opt/home/blog/space-log-express/services/qiniuService.js`

**Key Methods:**
- `uploadFileStream(path, filePath)` - Stream upload to Qiniu Cloud
  - Returns: `{ code: 200, msg, url, name, res }`
  - URL format: `https://{domain}/{path}`
  
- `deleteFile(path, prefixOrNot)` - Delete file from Qiniu Cloud
  
- `getFileInPath(path, delimiter)` - List files in directory

**Configuration:** `/opt/home/blog/space-log-express/config/pro.json`
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

## 3. ADMIN INTERFACE - File Location: `/opt/home/blog/admin/src`

### User Management Pages

#### User List Page with Avatar Management
**File:** `/opt/home/blog/admin/src/pages/user/UserListPage.vue`

**Avatar Display Section (Line 20-33):**
```vue
<!-- Avatar display and upload -->
<template v-if="column.key === 'avatar'">
  <div class="actionBar" v-if="currentColumn['id'] === record['id']">
    <!-- Upload component -->
    <a-upload 
      v-model:file-list="imageFileList"
      name="file"
      :action="proxy.GLOBAL.VUE_APP_BASE_URL + '/oss/uploadImageQueryIn?path=/image/userAvatar/' + record.id"
      :headers="fileHeaders"
      @change="handleUploadImageChange"
    >
      <a>上传头像</a>
    </a-upload>
    <a @click="deleteArticleCover(record.id)">删除</a>
  </div>
  <!-- Display avatar image -->
  <a-image 
    :width="100"
    v-else
    :src="`${proxy.GLOBAL.VUE_APP_OSS_IMAGE_BASE_URL + proxy.GLOBAL.VUE_APP_OSS_BASE_DIR}/image/userAvatar/${record.id}.png`"
    :fallback="store.state.config?.['not-found-image']?.content || ''"
  />
</template>
```

**Table Columns (Line 79-114):**
- Column key: "avatar"
- Display width: 100px
- Inline edit mode with upload functionality

**Upload Headers (Line 167-170):**
```javascript
const fileHeaders = {
  authorization: `Bearer ${Cookies.get("token")}`,
};
```

**File List Model (Line 167):**
```javascript
let imageFileList = ref([]);
```

**Upload Change Handler (Line 171-185):**
```javascript
const handleUploadImageChange = (info) => {
  if (info.file.status === 'done') {
    notification['success']({
      message: '上传成功',
      description: '上传头像成功',
      duration: 3,
    })
  } else if (info.file.status === 'error') {
    notification['error']({
      message: '上传失败',
      description: '上传头像失败',
      duration: 3,
    })
  }
}
```

#### Admin List Page
**File:** `/opt/home/blog/admin/src/pages/user/AdminListPage.vue`

**Note:** Admin users do NOT have avatar upload functionality in this interface.

### Configuration Management Page
**File:** `/opt/home/blog/admin/src/pages/configuration/ConfigListPage.vue`

**Purpose:** Manage site-wide configurations including "my-avatar"

**Features (Line 1-194):**
- Search by configuration name (`configLabel`)
- Filter by data type (`configStatus`) - STRING or JSON
- Create new configurations
- Edit existing configurations
- Delete configurations
- Support for JSON editing with `json-editor` component

**Example Configuration Entry Creation:**
```javascript
{
  label: "my-avatar",
  content: "https://qiniu-domain.com/blog/image/avatar/author.png",
  type: "STRING"
}
```

### API Integration
**File:** `/opt/home/blog/admin/src/api/api.js`

```javascript
// Configuration API methods (Line 221-238)
getAllConfig() {
  return req.get("/configuration/getAllConfiguration");
},
addConfig(data) {
  return req.post("/configuration/addConfiguration", data);
},
updateConfig(data) {
  return req.post("/configuration/updateConfiguration", data);
},
deleteConfig(data) {
  return req.delete("/configuration/deleteConfiguration", data);
},
```

### Global Configuration
**Location:** Admin initialization
- Fetches global config: `getGlobalConfig()` - calls `/configuration/reception/getConfig`
- Stores in Vuex state for use across admin interface

---

## 4. NUXT3 FRONTEND - File Location: `/opt/home/blog/space-log-nuxt3/app`

### Pages Using Avatar/Profile Picture

#### Home Page (/)
**File:** `/opt/home/blog/space-log-nuxt3/app/pages/index.vue`

```vue
<img 
  class="w-80 h-80 rounded-full mx-auto mb-6 mt-12 p-2" 
  :src="store.$state.config['my-avatar']?.content"
/>
```

#### About Page (/about)
**File:** `/opt/home/blog/space-log-nuxt3/app/pages/about.vue`

```vue
<img 
  class="w-80 h-80 rounded-full mx-auto mb-6 mt-12 p-2" 
  :src="store.$state.config['my-avatar']?.content"
/>
```

#### Friends Links Page (/link)
**File:** `/opt/home/blog/space-log-nuxt3/app/pages/link.vue`

```vue
<!-- Display author avatar -->
<p class="py-1">📌头像：{{ store.$state.config['my-avatar'].content }}</p>

<!-- Friend link avatars -->
<a-avatar :src="item.coverLink" :alt="item.id + '头像'" :size="64">
</a-avatar>
```

#### Messages Page (/message)
**File:** `/opt/home/blog/space-log-nuxt3/app/pages/message/[page].vue`

```vue
<!-- For admin comments (userId == -1) -->
<a-avatar 
  :src="message.userId == -1 ? 
    store.$state.config['my-avatar']?.content : 
    `${config.public.ossUrl}/image/userAvatar/${message.user?.id}.png`"
/>

<!-- For nested replies -->
<a-avatar 
  :src="childMessage.userId == -1 ? 
    store.$state.config['my-avatar']?.content : 
    `${config.public.ossUrl}/image/userAvatar/${childMessage.user?.id}.png`"
/>
```

#### Article Detail Page (/log/article/detail/[id])
**File:** `/opt/home/blog/space-log-nuxt3/app/pages/log/article/detail/[id].vue`

```vue
<!-- Comment author avatars -->
<a-avatar
  :src="comment.userId == -1 ? 
    store.$state.config['my-avatar']?.content : 
    `${config.public.ossUrl}/image/userAvatar/${comment.user?.id}.png`"
/>
```

### Navigation Header Component
**File:** `/opt/home/blog/space-log-nuxt3/app/components/common/NaviHeader.vue`

**User Avatar Display with Caching (Line 85-180):**

```javascript
// Avatar timestamp for cache busting
let avatarTimestamp = ref(null);

// Avatar display in user dropdown
const handleImageError = () => {
  userImageStatus.value = false;
}

// Use timestamp query param to bypass cache when avatar changes
:src="`${config.public.ossUrl}/image/userAvatar/${userData.id}.png?timestamp=${avatarTimestamp}`"
```

**Avatar refresh trigger:**
```javascript
// Refresh avatar timestamp to clear cache
avatarTimestamp.value = new Date();
```

**Size variations:**
- Large avatars: 200px (in dropdowns/modals)
- Standard avatars: `size="large"` (in header)

---

## 5. HOW AVATARS ARE DISPLAYED

### Admin/User Avatars Display Flow

1. **Admin Interface** (Vue 3 Admin Panel):
   - User clicks edit on a user row → Avatar upload field appears
   - User selects image → Uploaded to `/image/userAvatar/{userId}.png`
   - Real-time display from OSS with 100px width

2. **Frontend Display**:
   - Author comments: Shows `my-avatar` config URL
   - User comments: Shows `/image/userAvatar/{userId}.png`
   - Author profile: Shows `my-avatar` on home page, about page
   - Cache busting: Uses timestamp query parameter

### Author Profile Picture ("my-avatar")

1. **Configuration Location:**
   - Stored in `configuration` table with label: `"my-avatar"`
   - Content field contains the URL

2. **Admin Management:**
   - Access: `/mgmt` → Configuration page
   - Edit: Click edit → Update URL in content field
   - Type: STRING

3. **Frontend Usage:**
   - Accessed via: `store.$state.config['my-avatar']?.content`
   - Used in: Home page, About page, Comments section
   - Fallback: Optional safe navigation operator (`?.`)

---

## 6. COMPLETE REQUEST/RESPONSE FLOW

### User Avatar Upload Flow

```
1. Admin selects user row → Click "编辑"
2. Avatar column shows upload field
3. Admin uploads image (PNG/JPEG/GIF/WEBP)
4. POST /api/oss/uploadImageQueryIn?path=/image/userAvatar/{userId}
   - Headers: Authorization: Bearer {token}
   - Body: multipart/form-data with file
5. Backend:
   - Validates token
   - Reads file to temp location
   - Uploads to Qiniu Cloud: /blog/image/userAvatar/{userId}.png
   - Deletes temp file
   - Returns: { url, path, name }
6. Frontend display:
   - Image URL: {OSS_DOMAIN}/blog/image/userAvatar/{userId}.png
   - Shown in admin interface at 100px width
   - Used in frontend as user comment avatar
```

### Author Avatar Configuration Flow

```
1. Admin accesses Configuration page
2. Searches for "my-avatar" config entry
3. Clicks edit → Text field appears
4. Enters URL: https://example.com/avatar.png
5. Clicks save → POST /api/configuration/updateConfiguration
   - Body: { id, label: "my-avatar", content: "URL", type: "STRING" }
6. Backend updates configuration table
7. Frontend:
   - Fetches: GET /api/configuration/reception/getConfig
   - Stores in Pinia/Vuex store
   - Used on all pages: store.$state.config['my-avatar']?.content
```

---

## 7. ENVIRONMENT/CONFIGURATION VARIABLES

### Frontend Environment (.env)

```bash
# Nuxt3 Config
NUXT_PUBLIC_API_URL=https://xiangleideng.site/api
NUXT_PUBLIC_ENV=pro

# OSS Configuration
VUE_APP_OSS_IMAGE_BASE_URL=https://qiniu-domain.com
VUE_APP_OSS_BASE_DIR=/blog/
VUE_APP_BASE_URL=https://xiangleideng.site/api
```

### Backend Configuration (config/pro.json)

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

---

## 8. KEY FILES SUMMARY TABLE

| Category | File Path | Purpose |
|----------|-----------|---------|
| **Database Models** | `/opt/home/blog/space-log-express/models/user.js` | User table definition |
| | `/opt/home/blog/space-log-express/models/configuration.js` | Configuration table definition |
| **Backend Routes** | `/opt/home/blog/space-log-express/routes/user.js` | User endpoints including avatar upload |
| | `/opt/home/blog/space-log-express/routes/oss.js` | OSS upload endpoints |
| | `/opt/home/blog/space-log-express/routes/configuration.js` | Configuration CRUD endpoints |
| **Backend Controllers** | `/opt/home/blog/space-log-express/controller/userController.js` | User logic (uploadUserAvatar) |
| | `/opt/home/blog/space-log-express/controller/ossController.js` | OSS logic (uploadImageQueryIn) |
| | `/opt/home/blog/space-log-express/controller/configurationController.js` | Configuration CRUD logic |
| **Backend Services** | `/opt/home/blog/space-log-express/services/qiniuService.js` | Qiniu Cloud integration |
| | `/opt/home/blog/space-log-express/services/configurationService.js` | Configuration service |
| **Admin Pages** | `/opt/home/blog/admin/src/pages/user/UserListPage.vue` | User management with avatar upload |
| | `/opt/home/blog/admin/src/pages/configuration/ConfigListPage.vue` | Configuration management |
| **Admin API** | `/opt/home/blog/admin/src/api/api.js` | API methods for frontend |
| **Frontend Pages** | `/opt/home/blog/space-log-nuxt3/app/pages/index.vue` | Home page (displays my-avatar) |
| | `/opt/home/blog/space-log-nuxt3/app/pages/about.vue` | About page (displays my-avatar) |
| | `/opt/home/blog/space-log-nuxt3/app/pages/link.vue` | Friends page (shows my-avatar config) |
| | `/opt/home/blog/space-log-nuxt3/app/pages/message/[page].vue` | Messages (user & author avatars) |
| **Frontend Components** | `/opt/home/blog/space-log-nuxt3/app/components/common/NaviHeader.vue` | User avatar display with cache busting |

---

## 9. AVATAR TYPES AND LOCATIONS

### Type 1: User Avatars (for blog readers/commenters)
- **Storage:** Qiniu Cloud OSS
- **Path:** `/blog/image/userAvatar/{userId}.png`
- **Management:** Admin User List page
- **Display:** User comments, messages
- **Upload:** Via POST /api/oss/uploadImageQueryIn
- **Authentication:** Requires admin token

### Type 2: Author/Site Avatar ("my-avatar")
- **Storage:** URL stored in configuration table
- **Path:** External URL (can be any CDN or storage service)
- **Management:** Admin Configuration page
- **Display:** Home page, About page, Author comments
- **Update:** Via POST /api/configuration/updateConfiguration
- **Authentication:** Requires admin token

### Type 3: Friend Link Avatars
- **Storage:** Qiniu Cloud or external URLs
- **Path:** Configured per friend link entry
- **Management:** Friend links management page
- **Display:** Friends page
- **Upload:** Via friend link entry creation

---

## 10. RATING LIMITS & SECURITY

### Avatar Upload Rate Limiting
**File:** `/opt/home/blog/space-log-express/routes/user.js` (Line 19-23)

```javascript
limitCustomerFileUpload(5, undefined, "customer_upload_image", {
  message: "触发限制啦⛔️",
  description: "上传文件过于频繁，触发防脚本🤖，请稍后重试"
})
```

- **Limit:** 5 uploads per time period
- **Scope:** Per user (identified by token)
- **Error:** Returns "触发限制啦⛔️" (Rate limit triggered)

### File Size Limit
**File:** `/opt/home/blog/space-log-express/services/qiniuService.js` (Line 20)

```javascript
maxFileSize: 30 * 1024 * 1024 // 30MB limit
```

### File Type Validation (Customer Upload)
**File:** `/opt/home/blog/space-log-express/controller/ossController.js` (Line 53-62)

```javascript
const allowFileType = [
  "image/png", "image/jpeg", "image/gif", "image/webp",
  "image/tiff", "image/heic", "image/x-icon", "image/svg+xml"
];
```

---

## 11. QUICK START: How to Update Avatar

### Update Author Profile Picture ("my-avatar")

**Step 1: Prepare the image URL**
- Upload image to your server/CDN
- Note the full URL (e.g., https://example.com/avatar.png)

**Step 2: Access Admin Configuration**
- Login to `/mgmt` with admin credentials
- Navigate to Configuration page

**Step 3: Update Configuration**
- Search for "my-avatar" in configuration list
- Click Edit
- Update content field with new URL
- Click Save

**Step 4: Verify Frontend**
- Home page should show new avatar: store.$state.config['my-avatar']?.content
- About page should display updated avatar
- Comments from admin will show new avatar

### Upload User Avatar (for registered users)

**Step 1: Access Admin User Management**
- Login to `/mgmt` with admin credentials
- Navigate to User List page

**Step 2: Edit User**
- Find target user in table
- Click "编辑" button on that row

**Step 3: Upload Avatar**
- Avatar column appears with upload field
- Click "上传头像"
- Select PNG/JPEG/GIF/WEBP image
- System automatically uploads to `/image/userAvatar/{userId}.png`

**Step 4: Verify Frontend**
- User's avatar displays in comments
- User's avatar displays in messages section
- Appears at `/image/userAvatar/{userId}.png` on frontend

---

## 12. TROUBLESHOOTING

### Avatar Not Displaying

**Issue:** Avatar image shows as broken
**Solutions:**
1. Check Qiniu Cloud configuration in config/pro.json
2. Verify correct domain in VUE_APP_OSS_IMAGE_BASE_URL
3. Check if file exists in OSS: `/blog/image/userAvatar/{userId}.png`
4. Verify auth token in request headers
5. Check OSS access permissions

### Upload Fails with Rate Limit

**Issue:** "触发限制啦⛔️" error appears
**Solutions:**
1. Wait for rate limit window to pass
2. Check Redis cache for rate limit state
3. Verify request has proper authorization header
4. Check file size (must be < 30MB)

### Avatar Not Loading on Frontend

**Issue:** Blank image or 404 error on frontend
**Solutions:**
1. Verify Qiniu Cloud domain configuration
2. Check VUE_APP_OSS_IMAGE_BASE_URL environment variable
3. Clear browser cache (use timestamp query param)
4. Verify OSS file permissions
5. Check CORS headers on OSS bucket

---

