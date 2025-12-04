# Templates API Specification

**Backend URL**: `http://localhost:8000`
**Status**: ⚠️ **PENDING IMPLEMENTATION**

---

## 📋 Overview

The Templates API provides read-only access to post templates for the frontend application. Templates are used to create social media posts with predefined layouts and text zones.

### Key Requirements

- **Frontend is READ-ONLY**: No create, update, or delete operations from frontend
- **Backend/Admin Management**: All template CRUD operations are backend-only
- **Authentication Required**: All endpoints require Bearer token authentication

---

## 📡 Endpoint

### Get All Templates

```
GET /api/templates
Headers: Authorization: Bearer {token}
Response: {
  "data": [
    {
      "id": "career-single",
      "name": "Career - Single Post",
      "postType": "career",
      "type": "single",
      "description": "Professional job posting or career update",
      "imageUrl": "https://example.com/career-single.jpg",
      "carouselImages": null,
      "textZones": [...]
    },
    ...
  ]
}
```

---

## 🔍 Data Structure

### Template Interface

```typescript
interface Template {
  id: string;                    // Unique identifier
  name: string;                  // Display name (e.g., "Career - Single Post")
  postType: 'career' | 'news' | 'advert' | 'tutorials' | 'insight';
  type: 'single' | 'carousel';   // Format type
  description: string;           // Template description
  imageUrl: string;              // Primary template image URL
  carouselImages?: string[];     // Additional images for carousel (optional)
  textZones: TextZone[];         // Text overlay configuration
}
```

### TextZone Interface

```typescript
interface TextZone {
  id: string;              // Unique identifier for this zone
  label: string;           // Field label (e.g., "Job Title", "Headline")
  x: number;               // X position as percentage (0-100)
  y: number;               // Y position as percentage (0-100)
  width: number;           // Width as percentage (0-100)
  height: number;          // Height as percentage (0-100)
  fontSize: number;        // Font size in pixels
  textAlign: 'left' | 'center' | 'right';
  color: string;           // Hex color (e.g., "#ffffff")
}
```

### Response Format

```typescript
interface TemplatesResponse {
  data: Template[];
}
```

---

## 📝 Field Descriptions

### `postType` (Required)
The category of social media post. Must be one of:
- `career` - Job postings, career updates, team announcements
- `news` - News articles, company updates, press releases
- `advert` - Advertisements, promotional content, product launches
- `tutorials` - How-to guides, educational content, tips
- `insight` - Industry insights, thought leadership, expert tips

### `type` (Required)
The format of the post:
- `single` - Single image post
- `carousel` - Multiple image carousel post

### `textZones` (Required)
Array of text overlay zones that define where and how text appears on the template image. Each zone represents an editable text field in the post creator.

**Common Text Zones by Post Type**:
- **Career**: `job_title`, `description`
- **News**: `headline`, `summary`
- **Advert**: `tagline`, `cta` (call to action)
- **Tutorials**: `tutorial_title`, `instructions`
- **Insight**: `insight_text`, `author`

### `carouselImages` (Optional)
Only required when `type` is `carousel`. Array of image URLs for additional carousel slides.

---

## 📦 Example Response

```json
{
  "data": [
    {
      "id": "career-single",
      "name": "Career - Single Post",
      "postType": "career",
      "type": "single",
      "description": "Professional job posting or career update",
      "imageUrl": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1080&q=80",
      "carouselImages": null,
      "textZones": [
        {
          "id": "job_title",
          "label": "Job Title",
          "x": 10,
          "y": 35,
          "width": 80,
          "height": 15,
          "fontSize": 44,
          "textAlign": "center",
          "color": "#1a1a1a"
        },
        {
          "id": "description",
          "label": "Description",
          "x": 10,
          "y": 55,
          "width": 80,
          "height": 25,
          "fontSize": 18,
          "textAlign": "center",
          "color": "#4a4a4a"
        }
      ]
    },
    {
      "id": "news-carousel",
      "name": "News - Carousel",
      "postType": "news",
      "type": "carousel",
      "description": "Multi-slide news story",
      "imageUrl": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&q=80",
      "carouselImages": [
        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1080&q=80",
        "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1080&q=80"
      ],
      "textZones": [
        {
          "id": "content",
          "label": "Content",
          "x": 10,
          "y": 40,
          "width": 80,
          "height": 30,
          "fontSize": 32,
          "textAlign": "center",
          "color": "#ffffff"
        }
      ]
    }
  ]
}
```

---

## 📐 Template Requirements

### Minimum Required Templates

The system expects **10 templates** (5 post types × 2 formats):

| Post Type | Single Template | Carousel Template |
|-----------|----------------|-------------------|
| Career | ✅ Required | ✅ Required |
| News | ✅ Required | ✅ Required |
| Advert | ✅ Required | ✅ Required |
| Tutorials | ✅ Required | ✅ Required |
| Insight | ✅ Required | ✅ Required |

### Image Requirements

- **Image URLs**: Must be publicly accessible HTTPS URLs
- **Recommended Size**: 1080×1080 pixels (square format for Instagram/social)
- **Format**: JPEG, PNG, or WebP
- **Carousel**: 2-10 images recommended

### Text Zone Guidelines

- **Position/Size**: Use percentages (0-100) for responsive layout
- **Font Size**: 16-60px recommended for readability
- **Colors**: Use hex format with # prefix
- **Labels**: Should be clear and descriptive (shown to users as field labels)

---

## 🎨 Post Type Examples

### Career Templates
```json
{
  "textZones": [
    {"id": "job_title", "label": "Job Title", ...},
    {"id": "description", "label": "Description", ...}
  ]
}
```

### News Templates
```json
{
  "textZones": [
    {"id": "headline", "label": "Headline", ...},
    {"id": "summary", "label": "Summary", ...}
  ]
}
```

### Advert Templates
```json
{
  "textZones": [
    {"id": "tagline", "label": "Tagline", ...},
    {"id": "cta", "label": "Call to Action", ...}
  ]
}
```

### Tutorials Templates
```json
{
  "textZones": [
    {"id": "tutorial_title", "label": "Tutorial Title", ...},
    {"id": "instructions", "label": "Instructions", ...}
  ]
}
```

### Insight Templates
```json
{
  "textZones": [
    {"id": "insight_text", "label": "Insight", ...},
    {"id": "author", "label": "Author/Source", ...}
  ]
}
```

---

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found
```json
{
  "message": "No templates found"
}
```

### 500 Server Error
```json
{
  "message": "An error occurred while fetching templates",
  "errors": {}
}
```

---

## 🧪 Testing

### cURL Example

```bash
# Get all templates
curl -X GET http://localhost:8000/api/templates \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Create Test Data in Laravel

```bash
cd ../concrete-kreative-management-platform-api-laravel
php artisan tinker
```

```php
// Example: Create a Career Single Post template
\App\Models\Template::create([
    'id' => 'career-single',
    'name' => 'Career - Single Post',
    'post_type' => 'career',
    'type' => 'single',
    'description' => 'Professional job posting or career update',
    'image_url' => 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1080&q=80',
    'carousel_images' => null,
    'text_zones' => json_encode([
        [
            'id' => 'job_title',
            'label' => 'Job Title',
            'x' => 10,
            'y' => 35,
            'width' => 80,
            'height' => 15,
            'fontSize' => 44,
            'textAlign' => 'center',
            'color' => '#1a1a1a'
        ],
        [
            'id' => 'description',
            'label' => 'Description',
            'x' => 10,
            'y' => 55,
            'width' => 80,
            'height' 25,
            'fontSize' => 18,
            'textAlign' => 'center',
            'color' => '#4a4a4a'
        ]
    ])
]);
```

---

## 🔐 Test Credentials

**Email**: `test@example.com`
**Password**: `password`

---

## 🚀 Start Backend

```bash
cd ../concrete-kreative-management-platform-api-laravel
php artisan serve
```

Backend runs at: `http://localhost:8000`

---

## 📊 Database Schema Suggestion

### Templates Table

```sql
CREATE TABLE templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    post_type ENUM('career', 'news', 'advert', 'tutorials', 'insight') NOT NULL,
    type ENUM('single', 'carousel') NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    carousel_images JSON NULL,
    text_zones JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_post_type (post_type),
    INDEX idx_type (type)
);
```

### Laravel Migration Example

```php
Schema::create('templates', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('name');
    $table->enum('post_type', ['career', 'news', 'advert', 'tutorials', 'insight']);
    $table->enum('type', ['single', 'carousel']);
    $table->text('description');
    $table->text('image_url');
    $table->json('carousel_images')->nullable();
    $table->json('text_zones');
    $table->timestamps();

    $table->index('post_type');
    $table->index('type');
});
```

---

## ⚙️ React .env Configuration

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🔄 Frontend Implementation Status

### ✅ Completed
- Template interface with `postType` field
- Template service with `fetchTemplates()` method
- Read-only template manager UI
- Template badges display (post type + format)
- PostCreator integration with new template structure
- Fallback to mock data when API unavailable

### ⏳ Pending Backend
- `GET /api/templates` endpoint
- Database schema and migrations
- Template seeder with 10 templates
- Admin CRUD interface (future)

---

## 📖 Related Documentation

- `/docs/api/quick-reference.md` - Authentication API reference
- `/docs/backend/MESSAGE_FROM_BACKEND_TEAM.md` - Backend setup guide
- `/docs/backend/integration-guide.md` - Full integration guide

---

## 💡 Notes for Backend Developer

1. **Frontend Expects 10 Templates**: Seed at least 10 templates (5 post types × 2 formats) for complete functionality
2. **Image URLs**: Use Unsplash or similar for placeholder images
3. **Text Zones**: These define the form fields shown in the post creator - make them descriptive
4. **JSON Storage**: `text_zones` and `carousel_images` should be stored as JSON
5. **Read-Only Frontend**: No need to implement POST/PUT/DELETE endpoints for templates from frontend
6. **Admin Panel**: Template management will be backend/admin-only (separate from this API)

---

**Questions?** Contact the frontend team or refer to existing authentication implementation as reference.
