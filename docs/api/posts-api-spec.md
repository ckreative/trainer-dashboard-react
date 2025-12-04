# Posts API Specification

**Backend URL**: `http://localhost:8000`
**Status**: ⚠️ **PENDING IMPLEMENTATION**

---

## 📋 Overview

This document specifies the API requirements for the Posts Listing Screen and Create Post Screen features. These APIs handle creating, managing, and displaying social media posts with template-based content.

### Key Features
- Create scheduled posts and drafts
- List posts with filtering, sorting, and search
- Upload and manage post images
- Generate dynamic templates
- Manage post lifecycle (draft → scheduled → published)

---

## 🗂️ Data Structures

### ScheduledPost (Core Post Entity)

```typescript
interface ScheduledPost {
  id: string;                                // Unique identifier (UUID)
  templateId: string;                        // Reference to template used
  templateName: string;                      // Display name of template
  theme: 'light' | 'dark';                  // Visual theme
  coverType: 'text' | 'image';              // Cover style type
  type: 'single' | 'carousel';              // Post format
  templateImageUrl: string;                  // URL or base64 data URI of image
  textContent: Record<string, string>;       // Dynamic text zones (key-value)
  scheduledDate: Date;                       // When post should be published
  status: 'scheduled' | 'published' | 'draft';  // Post status
  createdAt: Date;                           // Creation timestamp
}
```

**Field Descriptions:**

- `id`: Generated server-side (UUID format recommended)
- `templateId`: ID of the template used to create this post
- `templateName`: Human-readable template name
- `theme`: Light or dark theme variant
- `coverType`: Whether post is text-focused or image-focused
- `type`: Single image post or carousel (multiple images)
- `templateImageUrl`: URL to uploaded image or base64 data URI
- `textContent`: Object mapping text zone IDs to their content (e.g., `{ "headline": "Breaking News", "body": "..." }`)
- `scheduledDate`: ISO 8601 timestamp for publication
- `status`: Current state in post lifecycle
- `createdAt`: When post was created

### Template (Template Entity)

```typescript
interface Template {
  id: string;                              // Unique identifier
  name: string;                            // Template display name
  theme: 'light' | 'dark';                // Theme variant
  coverType: 'text' | 'image';            // Cover type
  type: 'single' | 'carousel';            // Format type
  description: string;                     // Template description
  imageUrl: string;                        // Template preview image
  carouselImages?: string[];               // Optional carousel images
  textZones: TextZone[];                   // Editable text zones
}
```

### TextZone (Template Text Zone)

```typescript
interface TextZone {
  id: string;                              // Unique zone identifier (e.g., "headline", "body")
  label: string;                           // Display label for zone (e.g., "Headline")
  x: number;                               // X position as percentage (0-100)
  y: number;                               // Y position as percentage (0-100)
  width: number;                           // Width as percentage (0-100)
  height: number;                          // Height as percentage (0-100)
  fontSize: number;                        // Font size in pixels
  textAlign: 'left' | 'center' | 'right'; // Text alignment
  color: string;                           // Text color (hex format: #ffffff)
}
```

---

## 📡 API Endpoints

### 1. List Posts

**Endpoint:** `GET /api/posts`

**Purpose:** Retrieve all posts with filtering, sorting, search, and pagination

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Query Parameters:**
```typescript
{
  status?: 'all' | 'scheduled' | 'draft' | 'published';  // Filter by status
  search?: string;                                        // Search query
  sortBy?: 'scheduledDate' | 'createdAt' | 'templateName' | 'status';
  sortOrder?: 'asc' | 'desc';                            // Default: 'asc'
  page?: number;                                          // Default: 1
  limit?: number;                                         // Default: 20
}
```

**Example Request:**
```bash
GET /api/posts?status=scheduled&sortBy=scheduledDate&sortOrder=asc&page=1&limit=20
```

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "templateId": "generated-uuid",
      "templateName": "Generated Template",
      "theme": "light",
      "coverType": "image",
      "type": "single",
      "templateImageUrl": "https://cdn.example.com/images/post-123.jpg",
      "textContent": {
        "headline": "Senior Software Engineer",
        "description": "Join our team to build amazing products"
      },
      "scheduledDate": "2025-10-31T10:00:00Z",
      "status": "scheduled",
      "createdAt": "2025-10-28T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

**Search Behavior:**
- Searches in `templateName` and all values within `textContent`
- Case-insensitive partial matching
- Example: search "engineer" matches posts with "Senior Software Engineer"

**Sorting:**
- Default sort: `scheduledDate` ascending
- Multiple sort fields supported via query params

---

### 2. Create Post

**Endpoint:** `POST /api/posts`

**Purpose:** Create a new scheduled post or draft

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "templateId": "generated-uuid",
  "templateName": "Generated Template",
  "theme": "light",
  "coverType": "image",
  "type": "single",
  "templateImageUrl": "https://cdn.example.com/images/uploaded-bg.jpg",
  "textContent": {
    "headline": "Breaking News",
    "body": "Important announcement about our new product"
  },
  "scheduledDate": "2025-11-01T14:00:00Z",
  "status": "scheduled"
}
```

**Response:**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "templateId": "generated-uuid",
    "templateName": "Generated Template",
    "theme": "light",
    "coverType": "image",
    "type": "single",
    "templateImageUrl": "https://cdn.example.com/images/uploaded-bg.jpg",
    "textContent": {
      "headline": "Breaking News",
      "body": "Important announcement about our new product"
    },
    "scheduledDate": "2025-11-01T14:00:00Z",
    "status": "scheduled",
    "createdAt": "2025-10-29T16:45:00Z"
  },
  "message": "Post created successfully"
}
```

**Status Codes:**
- `201`: Created successfully
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

**Validation Rules:**

1. **templateId** (required)
   - Must be valid UUID or string
   - Must reference a valid template

2. **templateName** (required)
   - String, max 255 characters
   - Cannot be empty

3. **theme** (required)
   - Enum: `['light', 'dark']`

4. **coverType** (required)
   - Enum: `['text', 'image']`

5. **type** (required)
   - Enum: `['single', 'carousel']`

6. **templateImageUrl** (required)
   - Valid URL or base64 data URI
   - Must be accessible image

7. **textContent** (required)
   - Object with at least one key-value pair
   - All values must be non-empty strings
   - Keys should match template's text zone IDs

8. **scheduledDate** (required)
   - Valid ISO 8601 date string
   - Must be future date if status is 'scheduled'
   - Can be past date for 'draft' status

9. **status** (required)
   - Enum: `['scheduled', 'draft']`
   - Note: 'published' is set automatically by system

**Validation Error Response:**
```json
{
  "message": "Validation failed",
  "errors": {
    "templateName": ["Template name is required"],
    "textContent": ["Please fill in: Headline, Description"],
    "scheduledDate": ["Scheduled date must be in the future"]
  }
}
```

---

### 3. Get Single Post

**Endpoint:** `GET /api/posts/{id}`

**Purpose:** Retrieve a single post by ID

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "templateId": "generated-uuid",
    "templateName": "Generated Template",
    "theme": "light",
    "coverType": "image",
    "type": "single",
    "templateImageUrl": "https://cdn.example.com/images/post-123.jpg",
    "textContent": {
      "headline": "Senior Software Engineer",
      "description": "Join our team to build amazing products"
    },
    "scheduledDate": "2025-10-31T10:00:00Z",
    "status": "scheduled",
    "createdAt": "2025-10-28T14:30:00Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Post not found
- `401`: Unauthorized

---

### 4. Update Post

**Endpoint:** `PUT /api/posts/{id}`

**Purpose:** Update an existing post (all fields optional except ID)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:** (all fields optional)
```json
{
  "templateName": "Updated Template Name",
  "textContent": {
    "headline": "Updated Headline"
  },
  "scheduledDate": "2025-11-02T10:00:00Z",
  "status": "draft"
}
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "templateId": "generated-uuid",
    "templateName": "Updated Template Name",
    "theme": "light",
    "coverType": "image",
    "type": "single",
    "templateImageUrl": "https://cdn.example.com/images/post-123.jpg",
    "textContent": {
      "headline": "Updated Headline",
      "description": "Join our team to build amazing products"
    },
    "scheduledDate": "2025-11-02T10:00:00Z",
    "status": "draft",
    "createdAt": "2025-10-28T14:30:00Z"
  },
  "message": "Post updated successfully"
}
```

**Status Codes:**
- `200`: Updated successfully
- `400`: Validation error
- `404`: Post not found
- `401`: Unauthorized

**Status Transition Rules:**
- `draft` → `scheduled`: Requires valid future `scheduledDate`
- `draft` → `published`: Allowed
- `scheduled` → `published`: Allowed (typically done by system)
- `published` → `draft`/`scheduled`: Discouraged, may need business approval

---

### 5. Delete Post

**Endpoint:** `DELETE /api/posts/{id}`

**Purpose:** Delete a post permanently

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response:**
```json
{
  "message": "Post deleted successfully"
}
```

**Status Codes:**
- `200`: Deleted successfully
- `404`: Post not found
- `401`: Unauthorized

**Recommendation:** Implement soft delete with `deletedAt` timestamp for post recovery.

---

### 6. Bulk Delete Posts

**Endpoint:** `DELETE /api/posts`

**Purpose:** Delete multiple posts at once

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**Response:**
```json
{
  "deleted": 2,
  "message": "2 posts deleted successfully"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request (empty array, invalid IDs)
- `401`: Unauthorized

---

### 7. Generate Template

**Endpoint:** `POST /api/templates/generate`

**Purpose:** Generate a dynamic template based on user preferences

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "theme": "light",
  "coverType": "image",
  "type": "single"
}
```

**Response:**
```json
{
  "data": {
    "id": "generated-uuid",
    "name": "Generated Template",
    "theme": "light",
    "coverType": "image",
    "type": "single",
    "description": "Light theme image-focused single post",
    "imageUrl": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1080&q=80",
    "carouselImages": null,
    "textZones": [
      {
        "id": "headline",
        "label": "Headline",
        "x": 10,
        "y": 35,
        "width": 80,
        "height": 15,
        "fontSize": 44,
        "textAlign": "center",
        "color": "#1a1a1a"
      },
      {
        "id": "body",
        "label": "Body Text",
        "x": 10,
        "y": 55,
        "width": 80,
        "height": 25,
        "fontSize": 18,
        "textAlign": "center",
        "color": "#4a4a4a"
      }
    ]
  }
}
```

**Validation Rules:**
- `theme`: Required, enum `['light', 'dark']`
- `coverType`: Required, enum `['text', 'image']`
- `type`: Required, enum `['single', 'carousel']`

**Status Codes:**
- `200`: Template generated successfully
- `400`: Invalid parameters
- `401`: Unauthorized
- `500`: Generation failed

**Note:** See `/docs/api/template-generation-api-spec.md` for detailed template generation specifications.

---

### 8. Upload Image

**Endpoint:** `POST /api/uploads/image`

**Purpose:** Upload background images for posts

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData:
- file: File (image file)
- purpose: 'post_background' | 'template_preview'
```

**Example:**
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('purpose', 'post_background');

fetch('/api/uploads/image', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

**Response:**
```json
{
  "url": "https://cdn.example.com/uploads/2025/10/29/abc123.jpg",
  "filename": "background-image.jpg",
  "size": 245678,
  "mimeType": "image/jpeg"
}
```

**Validation Rules:**
1. **Max file size:** 10MB
2. **Allowed types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`
3. **Image dimensions:**
   - Minimum: 400x400px
   - Maximum: 4000x4000px
   - Recommended: 1080x1080px (Instagram square format)
4. **File must be valid image format**

**Status Codes:**
- `201`: Uploaded successfully
- `400`: Invalid file or validation error
- `401`: Unauthorized
- `413`: File too large (> 10MB)

**Error Response:**
```json
{
  "message": "File validation failed",
  "errors": {
    "file": ["File size must not exceed 10MB", "Image dimensions must be at least 400x400px"]
  }
}
```

**Implementation Recommendations:**
1. Store images in cloud storage (AWS S3, Cloudinary, Google Cloud Storage)
2. Generate multiple sizes for responsive delivery
3. Optimize images server-side (compress, convert to WebP)
4. Return CDN URL for fast global delivery
5. Clean up orphaned images periodically

---

## 🔍 Search & Filter Capabilities

### Status Filter
- Filter by: `'all'`, `'scheduled'`, `'draft'`, `'published'`
- Shows count for each status in UI dropdown
- Default: `'all'` (shows all posts)

### Text Search
- Searches in:
  - `templateName` field
  - All values in `textContent` object
- Case-insensitive
- Partial match supported
- Example: "engineer" matches "Senior Software Engineer"

### Sorting
- **Available sort fields:**
  - `scheduledDate` - When post is scheduled to publish
  - `createdAt` - When post was created
  - `templateName` - Alphabetical by template name
  - `status` - Alphabetical by status

- **Sort order:**
  - `asc` - Ascending (A-Z, oldest-newest)
  - `desc` - Descending (Z-A, newest-oldest)

- **Default:** `scheduledDate` ascending

### Combined Filtering
- Status filter and search query work together
- Filters applied first, then sorting
- Example: Search "news" + Status "scheduled" + Sort by "scheduledDate desc"

---

## ✅ Validation Requirements

### Create Post Form Validation

**Frontend Form Fields** (not all stored in ScheduledPost):
1. **Title** (used to populate text zone)
   - Required: Yes
   - Max length: 255 characters
   - Must not be empty string

2. **Subtext** (used to populate text zone)
   - Required: Yes
   - Max length: 1000 characters
   - Must not be empty string

3. **Background Image** (conditional)
   - Required: Yes, if `coverType === 'image'`
   - Not required if `coverType === 'text'`
   - Must be uploaded via file input
   - Validates on client before upload

### Backend Validation

1. **Template Selection**
   - `templateId` must be valid
   - `templateName` must not be empty

2. **Text Content**
   - All text zones from template must have content
   - Each zone value must be non-empty string
   - Keys must match template's text zone IDs
   - Error lists missing zones by label

3. **Scheduled Date**
   - Required for `status === 'scheduled'`
   - Optional for `status === 'draft'`
   - Must be valid ISO 8601 date
   - Should be future date for scheduled posts
   - Error if date is in past for scheduled posts

4. **Image URL**
   - Must be valid URL or base64 data URI
   - Must be accessible (return 200 status)
   - Recommended: Validate image dimensions server-side

### Validation Error Format

```json
{
  "message": "Validation failed",
  "errors": {
    "templateName": ["Template name is required"],
    "textContent": ["The following fields are required: Headline, Body Text"],
    "scheduledDate": ["Scheduled date must be in the future"]
  }
}
```

---

## 🖼️ Image Handling

### Current Client-Side Implementation

**Flow:**
1. User selects image via file input
2. Image read as base64 DataURL using `FileReader`
3. Preview shown immediately (stored in component state)
4. Base64 string sent to server or used directly

**Code Reference:** `/src/components/PostCreator.tsx:47-56`

```typescript
const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);  // base64 string
    };
    reader.readAsDataURL(file);
  }
};
```

### Recommended Server-Side Implementation

**Upload Flow:**
1. Client uploads file via `multipart/form-data`
2. Server validates file type, size, dimensions
3. Server resizes/optimizes image
4. Server stores in cloud storage (S3, Cloudinary, etc.)
5. Server returns public CDN URL
6. Client uses URL in `templateImageUrl` field

**Advantages:**
- Smaller request payloads
- Faster page loads
- CDN delivery for images
- Image optimization (WebP conversion, compression)
- Scalable storage

**Image Optimization:**
- Generate multiple sizes: thumbnail (300x300), medium (800x800), full (1080x1080)
- Convert to WebP format for 25-35% smaller file size
- Apply compression (quality: 85-90%)
- Strip EXIF metadata for privacy and size reduction

### Image Size Recommendations

**Social Media Formats:**
- **Instagram Square:** 1080x1080px
- **Instagram Portrait:** 1080x1350px
- **Instagram Landscape:** 1080x566px
- **Instagram Story:** 1080x1920px
- **Facebook Post:** 1200x630px
- **Twitter Post:** 1200x675px

**Current Implementation:** Assumes 1080x1080px (Instagram square)

---

## 🔐 Authentication

All API endpoints require authentication via Bearer token.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Token Storage:**
- Stored in `localStorage` as `auth_token`
- Retrieved via `localStorage.getItem('auth_token')`
- Reference: `/src/services/templates.ts:43-45`

**Unauthenticated Request Response:**
```json
{
  "message": "Unauthenticated."
}
```
**Status Code:** `401 Unauthorized`

---

## ⚠️ Error Handling

### Standard Error Response Format

```json
{
  "message": "Human-readable error message",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

### Common Error Scenarios

**1. Validation Error (400):**
```json
{
  "message": "Validation failed",
  "errors": {
    "scheduledDate": ["The scheduled date must be a future date."],
    "textContent": ["Please fill in: Headline, Description"]
  }
}
```

**2. Unauthorized (401):**
```json
{
  "message": "Authentication required. Please log in."
}
```

**3. Not Found (404):**
```json
{
  "message": "Post not found with ID: 550e8400-e29b-41d4-a716-446655440000"
}
```

**4. Server Error (500):**
```json
{
  "message": "An unexpected error occurred while processing your request. Please try again."
}
```

**5. File Upload Error (413):**
```json
{
  "message": "File too large",
  "errors": {
    "file": ["File size must not exceed 10MB"]
  }
}
```

---

## 🚀 Performance Considerations

### 1. Pagination
- Implement server-side pagination
- Recommended page size: 20-50 items
- Return total count and page info
- Support cursor-based pagination for large datasets

### 2. Caching
- Cache template generation results (60 minutes)
- Cache post lists per user (5 minutes)
- Use ETags for conditional requests
- Implement Redis for fast cache access

### 3. Image Optimization
- Resize images server-side to standard sizes
- Generate WebP variants automatically
- Use lazy loading for images in list view
- Implement progressive JPEG for better UX

### 4. Database Indexing
Create indexes on frequently queried columns:
```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_date ON posts(scheduled_date);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_status_scheduled_date ON posts(status, scheduled_date);
```

### 5. Query Optimization
- Use `SELECT` specific columns instead of `SELECT *`
- Implement eager loading for related data
- Use database query explain to identify slow queries
- Consider materialized views for complex aggregations

### 6. Rate Limiting
- Limit API requests per user: 100 requests/minute
- Limit image uploads: 10 uploads/minute
- Return `429 Too Many Requests` with `Retry-After` header

---

## 💾 Database Schema Recommendation

### Posts Table

```sql
CREATE TABLE posts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL,

  -- Post Data
  template_name VARCHAR(255) NOT NULL,
  theme VARCHAR(10) NOT NULL CHECK (theme IN ('light', 'dark')),
  cover_type VARCHAR(10) NOT NULL CHECK (cover_type IN ('text', 'image')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('single', 'carousel')),
  template_image_url TEXT NOT NULL,
  text_content JSONB NOT NULL,

  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'published', 'draft')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,

  -- Indexes
  CONSTRAINT posts_user_id_idx INDEX (user_id),
  CONSTRAINT posts_status_idx INDEX (status),
  CONSTRAINT posts_scheduled_date_idx INDEX (scheduled_date),
  CONSTRAINT posts_created_at_idx INDEX (created_at),
  CONSTRAINT posts_status_scheduled_date_idx INDEX (status, scheduled_date)
);

-- Composite index for common query pattern
CREATE INDEX idx_posts_user_status_scheduled
ON posts(user_id, status, scheduled_date)
WHERE deleted_at IS NULL;

-- Full-text search index for text content
CREATE INDEX idx_posts_text_content_gin
ON posts USING gin(text_content);
```

### Templates Table

```sql
CREATE TABLE templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template Data
  name VARCHAR(255) NOT NULL,
  theme VARCHAR(10) NOT NULL CHECK (theme IN ('light', 'dark')),
  cover_type VARCHAR(10) NOT NULL CHECK (cover_type IN ('text', 'image')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('single', 'carousel')),
  description TEXT,
  image_url TEXT NOT NULL,
  carousel_images JSONB,
  text_zones JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  CONSTRAINT templates_theme_cover_type_idx INDEX (theme, cover_type, type)
);
```

### Uploads Table (Optional)

```sql
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  url TEXT NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT uploads_user_id_idx INDEX (user_id),
  CONSTRAINT uploads_created_at_idx INDEX (created_at)
);
```

---

## 🔄 Special Business Logic

### 1. Post Scheduling & Auto-Publishing

**Scheduled Posts:**
- Posts with `status === 'scheduled'` must have future `scheduledDate`
- Background job (cron) checks for posts to publish every minute
- Job queries: `WHERE status = 'scheduled' AND scheduled_date <= NOW()`
- Updates status to `'published'` and sets `published_at` timestamp
- Sends notification to user (optional)

**Cron Job Pseudocode:**
```python
# Run every minute
def publish_scheduled_posts():
    posts = Post.query(
        status='scheduled',
        scheduled_date__lte=now()
    )

    for post in posts:
        post.status = 'published'
        post.published_at = now()
        post.save()

        # Optional: Send to social media platform
        social_media_api.publish(post)

        # Optional: Notify user
        notify_user(post.user_id, f"Post '{post.template_name}' published!")
```

### 2. Draft Handling

**Draft Rules:**
- Drafts can be saved without complete validation
- `scheduledDate` is optional for drafts (defaults to current time if not provided)
- Drafts don't trigger publishing jobs
- Users can convert draft → scheduled by setting future `scheduledDate` and changing status

### 3. Status Transitions

**Allowed Transitions:**
```
draft → scheduled  (requires future scheduledDate)
draft → published  (manual publish)
scheduled → published (auto by system or manual)
scheduled → draft (cancel scheduling)
```

**Discouraged Transitions:**
```
published → draft (can't un-publish)
published → scheduled (can't re-schedule published content)
```

### 4. Text Zone Validation

**Template Text Zones:**
- Templates define text zones with IDs (e.g., "headline", "body")
- Posts must fill ALL text zones from their template
- Frontend dynamically renders form fields based on `template.textZones`
- Backend validates all zone IDs present in `post.textContent`

**Validation Logic:**
```python
def validate_text_content(post, template):
    required_zone_ids = {zone.id for zone in template.text_zones}
    provided_zone_ids = set(post.text_content.keys())

    missing_zones = required_zone_ids - provided_zone_ids
    if missing_zones:
        zone_labels = [zone.label for zone in template.text_zones if zone.id in missing_zones]
        raise ValidationError(f"Please fill in: {', '.join(zone_labels)}")
```

### 5. Soft Delete (Recommended)

**Benefits:**
- Allows post recovery
- Maintains referential integrity
- Audit trail for deleted posts

**Implementation:**
```sql
-- Soft delete
UPDATE posts SET deleted_at = NOW() WHERE id = ?;

-- Restore
UPDATE posts SET deleted_at = NULL WHERE id = ?;

-- Queries exclude soft-deleted by default
SELECT * FROM posts WHERE user_id = ? AND deleted_at IS NULL;
```

### 6. Status Counts

**Current Implementation:** Client-side counts from full posts list

**Recommended:** Server-side aggregation
```sql
SELECT
  status,
  COUNT(*) as count
FROM posts
WHERE user_id = ? AND deleted_at IS NULL
GROUP BY status;
```

**Response:**
```json
{
  "counts": {
    "all": 45,
    "scheduled": 12,
    "published": 28,
    "draft": 5
  }
}
```

---

## 📊 Example Workflow

### Complete Post Creation Flow

**1. User Opens Create Post Screen**
```
GET /api/templates/generate
{
  "theme": "light",
  "coverType": "image",
  "type": "single"
}
```

**2. User Fills Form**
- Selects theme: Light
- Selects cover type: Image
- Selects format: Single
- Enters title: "Join Our Team"
- Enters subtext: "We're hiring talented engineers"
- Uploads background image

**3. Upload Background Image**
```
POST /api/uploads/image
FormData: { file: imageFile, purpose: 'post_background' }

Response: { url: "https://cdn.example.com/uploads/bg123.jpg" }
```

**4. Generate Template**
```
POST /api/templates/generate
{
  "theme": "light",
  "coverType": "image",
  "type": "single"
}

Response: { data: { ...template with textZones... } }
```

**5. User Fills Text Zones**
- Headline: "Senior Software Engineer"
- Description: "Join our team to build amazing products"

**6. User Schedules Post**
```
POST /api/posts
{
  "templateId": "generated-uuid",
  "templateName": "Generated Template",
  "theme": "light",
  "coverType": "image",
  "type": "single",
  "templateImageUrl": "https://cdn.example.com/uploads/bg123.jpg",
  "textContent": {
    "headline": "Senior Software Engineer",
    "description": "Join our team to build amazing products"
  },
  "scheduledDate": "2025-11-01T10:00:00Z",
  "status": "scheduled"
}

Response: { data: { ...created post... }, message: "Post scheduled successfully!" }
```

**7. Background Job Publishes Post**
```
At 2025-11-01 10:00:00 UTC:
- Cron job queries scheduled posts
- Finds post with matching scheduled_date
- Updates status to 'published'
- Sets published_at timestamp
- Optionally publishes to social media API
```

---

## 🧪 Testing

### cURL Examples

**1. List Posts:**
```bash
curl -X GET "http://localhost:8000/api/posts?status=scheduled&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**2. Create Post:**
```bash
curl -X POST "http://localhost:8000/api/posts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "generated-uuid",
    "templateName": "Generated Template",
    "theme": "light",
    "coverType": "image",
    "type": "single",
    "templateImageUrl": "https://example.com/image.jpg",
    "textContent": {
      "headline": "Test Post",
      "body": "This is a test"
    },
    "scheduledDate": "2025-11-01T10:00:00Z",
    "status": "scheduled"
  }'
```

**3. Upload Image:**
```bash
curl -X POST "http://localhost:8000/api/uploads/image" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "purpose=post_background"
```

**4. Delete Post:**
```bash
curl -X DELETE "http://localhost:8000/api/posts/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📖 Related Documentation

- `/docs/api/quick-reference.md` - Authentication API reference
- `/docs/api/template-generation-api-spec.md` - Template generation details
- `/docs/backend/MESSAGE_FROM_BACKEND_TEAM.md` - Backend setup guide
- `/docs/backend/integration-guide.md` - Full integration guide

---

## 💡 Implementation Notes for Backend Team

### Priority Endpoints
1. **High Priority:** List Posts, Create Post, Generate Template
2. **Medium Priority:** Upload Image, Get Single Post, Delete Post
3. **Low Priority:** Update Post, Bulk Delete

### Quick Start Checklist
- [ ] Set up database tables (posts, templates, uploads)
- [ ] Implement authentication middleware
- [ ] Create Posts CRUD endpoints
- [ ] Implement image upload with cloud storage
- [ ] Add template generation endpoint
- [ ] Set up background job for auto-publishing
- [ ] Add validation and error handling
- [ ] Implement pagination and filtering
- [ ] Add database indexes
- [ ] Test with frontend integration

### Technology Recommendations
- **Framework:** Laravel (existing), Node.js/Express, or FastAPI
- **Database:** PostgreSQL (recommended for JSONB support)
- **Cloud Storage:** AWS S3, Cloudinary, or Google Cloud Storage
- **Background Jobs:** Laravel Queue, Celery, or Bull
- **Image Processing:** Intervention Image (Laravel), Sharp (Node.js), or Pillow (Python)

### Security Considerations
1. Validate all user input
2. Sanitize file uploads
3. Implement rate limiting
4. Use prepared statements to prevent SQL injection
5. Validate image dimensions server-side
6. Implement CORS properly
7. Use HTTPS in production
8. Hash sensitive data
9. Implement proper authorization (users can only access their own posts)

---

**Questions?** Contact the frontend team or refer to the codebase at `/src/components/PostCreator.tsx` and `/src/components/PostsView.tsx`.
