# Posts API - Frontend Integration Guide

## Authentication

All endpoints require authentication using Laravel Sanctum. Include the bearer token in the Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

## Base URL

```
http://localhost:8001/api
```

---

## Endpoints

### 1. List Posts (with Filtering & Pagination)

**GET** `/posts`

**Query Parameters:**
```javascript
{
  status: 'draft' | 'scheduled' | 'published',  // Optional
  theme: 'light' | 'dark',                       // Optional
  type: 'single' | 'carousel',                   // Optional
  cover_type: 'text' | 'solid' | 'image' | 'carousel_slide', // Optional
  search: 'search term',                         // Optional - searches template_name and text_content
  start_date: '2025-01-01',                     // Optional - filter by created_at
  end_date: '2025-12-31',                       // Optional - filter by created_at
  sort_by: 'created_at',                        // Optional - default: 'created_at'
  sort_order: 'desc' | 'asc',                   // Optional - default: 'desc'
  per_page: 15                                   // Optional - default: 15
}
```

**Example Request:**
```javascript
const response = await fetch('http://localhost:8001/api/posts?status=published&per_page=20', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
});

const data = await response.json();
```

**Response:**
```json
{
  "data": [
    {
      "id": "9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a",
      "user_id": 1,
      "template_id": "9d4e5f6a-1111-9d0e-1f2a-3b4c5d6e7f8a",
      "template_name": "Cover - Text Only (Dark)",
      "theme": "dark",
      "cover_type": "text",
      "type": "single",
      "template_image_url": "/storage/generated/post-123.png",
      "text_content": {
        "category": "INNOVATION",
        "quote": "The future is here",
        "attribution": "- John Doe"
      },
      "status": "published",
      "scheduled_date": null,
      "published_at": "2025-10-29T12:00:00+00:00",
      "created_at": "2025-10-29T10:00:00+00:00",
      "updated_at": "2025-10-29T12:00:00+00:00",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "template": {
        "id": "9d4e5f6a-1111-9d0e-1f2a-3b4c5d6e7f8a",
        "name": "Cover - Text Only (Dark)",
        "theme": "dark",
        "type": "single"
        // ... other template fields
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 73
  }
}
```

---

### 2. Create Post

**POST** `/posts`

**⚠️ IMPORTANT**: Do NOT include `user_id` in your request body. It is automatically populated from the authenticated user's token.

**Request Body:**
```json
{
  "template_id": "9d4e5f6a-1111-9d0e-1f2a-3b4c5d6e7f8a",  // Optional - UUID
  "template_name": "Cover - Text Only (Dark)",            // Optional - string
  "theme": "dark",                                        // Optional - 'light' | 'dark'
  "cover_type": "text",                                   // Optional - 'text' | 'solid' | 'image' | 'carousel_slide'
  "type": "single",                                       // Optional - 'single' | 'carousel'
  "template_image_url": "/storage/generated/post-123.png", // Optional - string
  "text_content": {                                       // Optional - object
    "category": "INNOVATION",
    "quote": "The future is here",
    "attribution": "- John Doe"
  },
  "status": "draft",                                      // Optional - 'draft' | 'scheduled' | 'published'
  "scheduled_date": "2025-10-30T15:00:00Z"               // Optional - ISO 8601 date (required if status=scheduled)
}
```

**Validation Rules:**
- `user_id`: **Automatically set from authenticated user** (do not include in request)
- `template_id`: Must exist in templates table
- `scheduled_date`: Must be a future date
- All enum fields must match allowed values

**Example Request:**
```javascript
const response = await fetch('http://localhost:8001/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    template_id: "9d4e5f6a-1111-9d0e-1f2a-3b4c5d6e7f8a",
    template_name: "Cover - Text Only (Dark)",
    theme: "dark",
    cover_type: "text",
    type: "single",
    text_content: {
      category: "INNOVATION",
      quote: "The future is here",
      attribution: "- John Doe"
    },
    status: "draft"
  })
});

const data = await response.json();
```

**Response:** (Same structure as single post object above)

---

### 3. Get Single Post

**GET** `/posts/{id}`

**Example Request:**
```javascript
const response = await fetch(`http://localhost:8001/api/posts/${postId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
});

const data = await response.json();
```

**Response:** (Same structure as single post object)

---

### 4. Update Post

**PUT** or **PATCH** `/posts/{id}`

**Authorization:** Only the post owner can update

**Request Body:** (All fields optional, only send what you want to update)
```json
{
  "template_id": "9d4e5f6a-2222-9d0e-1f2a-3b4c5d6e7f8a",
  "template_name": "Updated Template Name",
  "theme": "light",
  "cover_type": "solid",
  "type": "carousel",
  "template_image_url": "/storage/generated/post-456.png",
  "text_content": {
    "headline": "Updated headline"
  },
  "status": "scheduled",
  "scheduled_date": "2025-10-31T10:00:00Z"
}
```

**Example Request:**
```javascript
const response = await fetch(`http://localhost:8001/api/posts/${postId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    status: "scheduled",
    scheduled_date: "2025-10-31T10:00:00Z"
  })
});

const data = await response.json();
```

**Response:** (Same structure as single post object)

---

### 5. Delete Post

**DELETE** `/posts/{id}`

**Authorization:** Only the post owner can delete

**Example Request:**
```javascript
const response = await fetch(`http://localhost:8001/api/posts/${postId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
});

const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Error Response (Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 6. Bulk Delete Posts

**POST** `/posts/bulk-delete`

**Request Body:**
```json
{
  "ids": [
    "9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a",
    "9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8b",
    "9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8c"
  ]
}
```

**Validation:**
- `ids` must be an array with at least 1 item
- Each ID must be a valid UUID
- Each ID must exist in the posts table

**Example Request:**
```javascript
const response = await fetch('http://localhost:8001/api/posts/bulk-delete', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    ids: [postId1, postId2, postId3]
  })
});

const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "3 post(s) deleted successfully",
  "data": {
    "deleted_count": 3
  }
}
```

---

### 7. Update Post Status

**PATCH** `/posts/{id}/status`

**Authorization:** Only the post owner can update status

**Request Body:**
```json
{
  "status": "published"  // Required - 'draft' | 'scheduled' | 'published'
}
```

**Behavior:**
- When status changes to `published`, the `published_at` timestamp is automatically set (if not already set)

**Example Request:**
```javascript
const response = await fetch(`http://localhost:8001/api/posts/${postId}/status`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    status: "published"
  })
});

const data = await response.json();
```

**Response:** (Same structure as single post object)

---

### 8. Duplicate Post

**POST** `/posts/{id}/duplicate`

**Authorization:** Only the post owner can duplicate their posts

**Behavior:**
- Creates an exact copy of the post
- New post status is always set to `draft`
- `scheduled_date` and `published_at` are cleared
- Generates new UUID for the duplicate

**Example Request:**
```javascript
const response = await fetch(`http://localhost:8001/api/posts/${postId}/duplicate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
});

const data = await response.json();
```

**Response:** (Same structure as single post object - the newly created duplicate)

---

## Upload Endpoints

### 9. Upload Single Image

**POST** `/upload/image`

**Content-Type:** `multipart/form-data`

**Form Data:**
```javascript
{
  image: File,           // Required - jpeg, png, gif, webp (max 10MB)
  folder: 'posts'        // Optional - default: 'uploads'
}
```

**Example Request:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('folder', 'posts');

const response = await fetch('http://localhost:8001/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
    // Note: Don't set Content-Type header - browser will set it with boundary
  },
  body: formData
});

const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "path": "posts/9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a.png",
    "url": "http://localhost:8001/storage/posts/9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a.png",
    "filename": "9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a.png",
    "size": 245678,
    "mime_type": "image/png"
  }
}
```

---

### 10. Upload Multiple Images

**POST** `/upload/multiple`

**Content-Type:** `multipart/form-data`

**Form Data:**
```javascript
{
  images: File[],        // Required - array of images (max 10 files, each max 10MB)
  folder: 'posts'        // Optional - default: 'uploads'
}
```

**Example Request:**
```javascript
const formData = new FormData();
imageFiles.forEach(file => {
  formData.append('images[]', file);
});
formData.append('folder', 'posts');

const response = await fetch('http://localhost:8001/api/upload/multiple', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  },
  body: formData
});

const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "3 image(s) uploaded successfully",
  "data": [
    {
      "path": "posts/9d4e5f6a-1111-9d0e-1f2a-3b4c5d6e7f8a.png",
      "url": "http://localhost:8001/storage/posts/9d4e5f6a-1111-9d0e-1f2a-3b4c5d6e7f8a.png",
      "filename": "9d4e5f6a-1111-9d0e-1f2a-3b4c5d6e7f8a.png",
      "size": 245678,
      "mime_type": "image/png"
    },
    {
      "path": "posts/9d4e5f6a-2222-9d0e-1f2a-3b4c5d6e7f8a.jpg",
      "url": "http://localhost:8001/storage/posts/9d4e5f6a-2222-9d0e-1f2a-3b4c5d6e7f8a.jpg",
      "filename": "9d4e5f6a-2222-9d0e-1f2a-3b4c5d6e7f8a.jpg",
      "size": 189234,
      "mime_type": "image/jpeg"
    }
  ]
}
```

---

### 11. Delete Uploaded File

**DELETE** `/upload`

**Request Body:**
```json
{
  "path": "posts/9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a.png"  // Required
}
```

**Example Request:**
```javascript
const response = await fetch('http://localhost:8001/api/upload', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    path: "posts/9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a.png"
  })
});

const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## Error Handling

All endpoints return consistent error responses:

### Validation Errors (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "status": ["The selected status is invalid."],
    "scheduled_date": ["The scheduled date must be a date after now."]
  }
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthenticated."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "message": "No query results for model [App\\Models\\Post] {id}"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to upload image",
  "error": "Detailed error message"
}
```

---

## Complete Example: Create Post Workflow

```javascript
// 1. Upload template image (if using custom background)
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', 'posts');

  const response = await fetch('http://localhost:8001/api/upload/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: formData
  });

  return await response.json();
};

// 2. Create the post
const createPost = async (imageUrl) => {
  const response = await fetch('http://localhost:8001/api/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      template_id: "9d4e5f6a-1111-9d0e-1f2a-3b4c5d6e7f8a",
      template_name: "Cover - Image Background (Dark)",
      theme: "dark",
      cover_type: "image",
      type: "single",
      template_image_url: imageUrl,
      text_content: {
        headline: "Breaking News Story",
        category: "NEWS"
      },
      status: "draft"
    })
  });

  return await response.json();
};

// Usage
const imageFile = document.getElementById('fileInput').files[0];
const uploadResult = await uploadImage(imageFile);

if (uploadResult.success) {
  const post = await createPost(uploadResult.data.url);
  console.log('Post created:', post);
}
```

---

## TypeScript Types

```typescript
// Post types
export type PostStatus = 'draft' | 'scheduled' | 'published';
export type Theme = 'light' | 'dark';
export type PostType = 'single' | 'carousel';
export type CoverType = 'text' | 'solid' | 'image' | 'carousel_slide';

export interface Post {
  id: string;
  user_id: number;
  template_id: string | null;
  template_name: string | null;
  theme: Theme | null;
  cover_type: CoverType | null;
  type: PostType | null;
  template_image_url: string | null;
  text_content: Record<string, any> | null;
  status: PostStatus;
  scheduled_date: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  template?: Template;
}

export interface PostsResponse {
  data: Post[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreatePostRequest {
  template_id?: string;
  template_name?: string;
  theme?: Theme;
  cover_type?: CoverType;
  type?: PostType;
  template_image_url?: string;
  text_content?: Record<string, any>;
  status?: PostStatus;
  scheduled_date?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    path: string;
    url: string;
    filename: string;
    size: number;
    mime_type: string;
  };
}
```

---

## Notes

1. **Soft Delete**: Posts use soft delete - deleted posts remain in database with `deleted_at` timestamp
2. **User Ownership**: Users can only update/delete their own posts (checked by `user_id`)
3. **Auto Publishing**: When status changes to `published`, `published_at` is automatically set
4. **Scheduling**: If `scheduled_date` is provided during creation, status defaults to `scheduled`
5. **Image Formats**: Supported formats are JPEG, PNG, GIF, WEBP
6. **File Size Limit**: Maximum 10MB per image
7. **Pagination**: Default 15 items per page, customizable via `per_page` parameter
8. **Search**: The `search` parameter searches in both `template_name` and JSON `text_content` fields
