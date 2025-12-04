# Template Generation API Specification

**Backend URL**: `http://localhost:8000`
**Status**: ⚠️ **PENDING IMPLEMENTATION**

---

## 📋 Overview

The Template Generation API provides on-demand template generation based on user-selected parameters. Templates are dynamically created with appropriate images and text zones based on the theme, cover type, and format selected.

### Key Requirements

- **Dynamic Generation**: Templates are generated on-demand, not fetched from storage
- **No Caching**: Each generation request creates a fresh template
- **Authentication Required**: All endpoints require Bearer token authentication
- **Backend Logic**: Backend selects appropriate images and defines text zones based on parameters

---

## 📡 Endpoint

### Generate Template

```
POST /api/templates/generate
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
  Accept: application/json

Request Body: {
  "theme": "light" | "dark",
  "coverType": "text" | "image",
  "type": "single" | "carousel"
}

Response: {
  "data": {
    "id": "generated-uuid",
    "name": "Generated Template",
    "theme": "light",
    "coverType": "image",
    "type": "single",
    "description": "Dynamically generated template",
    "imageUrl": "https://example.com/image.jpg",
    "carouselImages": null,
    "textZones": [...]
  }
}
```

---

## 🔍 Data Structure

### Request Parameters

```typescript
interface TemplateGenerationParams {
  theme: 'light' | 'dark';      // Visual theme of the template
  coverType: 'text' | 'image';  // Whether text or image is primary
  type: 'single' | 'carousel';  // Post format
}
```

### Response Template Interface

```typescript
interface Template {
  id: string;                    // Generated UUID for this template
  name: string;                  // Display name (e.g., "Generated Template")
  theme: 'light' | 'dark';       // Theme used
  coverType: 'text' | 'image';   // Cover type used
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
  label: string;           // Field label (e.g., "Headline", "Body Text")
  x: number;               // X position as percentage (0-100)
  y: number;               // Y position as percentage (0-100)
  width: number;           // Width as percentage (0-100)
  height: number;          // Height as percentage (0-100)
  fontSize: number;        // Font size in pixels
  textAlign: 'left' | 'center' | 'right';
  color: string;           // Hex color (e.g., "#ffffff")
}
```

---

## 📝 Parameter Combinations

There are **8 possible combinations** of parameters:

| Theme | Cover Type | Format   | Use Case |
|-------|-----------|----------|----------|
| Light | Text      | Single   | Text-focused light post |
| Light | Text      | Carousel | Text-focused light story |
| Light | Image     | Single   | Image-focused light post |
| Light | Image     | Carousel | Image-focused light story |
| Dark  | Text      | Single   | Text-focused dark post |
| Dark  | Text      | Carousel | Text-focused dark story |
| Dark  | Image     | Single   | Image-focused dark post |
| Dark  | Image     | Carousel | Image-focused dark story |

---

## 🎨 Template Generation Logic

### Backend Should Consider:

1. **Theme Selection**
   - **Light**: Use bright backgrounds, dark text colors
   - **Dark**: Use dark backgrounds, light text colors

2. **Cover Type**
   - **Text**: Prioritize text visibility, simpler backgrounds
   - **Image**: Prioritize visual imagery, may have overlay effects

3. **Format**
   - **Single**: One primary image with text zones
   - **Carousel**: Multiple images (2-5 recommended) with text zones

### Image Selection Guidelines

- **Light + Text**: Minimal, clean backgrounds (whitespace, subtle patterns)
- **Light + Image**: Bright, vibrant images
- **Dark + Text**: Dark solid or gradient backgrounds
- **Dark + Image**: Moody, dramatic images

### Text Zone Guidelines

- **Text-focused**: More text zones (2-3), larger text areas
- **Image-focused**: Fewer text zones (1-2), smaller text areas overlaying image
- **Light theme**: Use dark text colors (#1a1a1a, #4a4a4a)
- **Dark theme**: Use light text colors (#ffffff, #e0e0e0)

---

## 📦 Example Requests and Responses

### Example 1: Light + Image + Single

**Request:**
```json
POST /api/templates/generate
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
    "id": "550e8400-e29b-41d4-a716-446655440000",
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

### Example 2: Dark + Text + Carousel

**Request:**
```json
POST /api/templates/generate
{
  "theme": "dark",
  "coverType": "text",
  "type": "carousel"
}
```

**Response:**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Generated Template",
    "theme": "dark",
    "coverType": "text",
    "type": "carousel",
    "description": "Dark theme text-focused carousel",
    "imageUrl": "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1080&q=80",
    "carouselImages": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80",
      "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1080&q=80"
    ],
    "textZones": [
      {
        "id": "title",
        "label": "Title",
        "x": 10,
        "y": 30,
        "width": 80,
        "height": 20,
        "fontSize": 42,
        "textAlign": "left",
        "color": "#ffffff"
      },
      {
        "id": "content",
        "label": "Content",
        "x": 10,
        "y": 55,
        "width": 80,
        "height": 30,
        "fontSize": 20,
        "textAlign": "left",
        "color": "#e0e0e0"
      },
      {
        "id": "caption",
        "label": "Caption",
        "x": 10,
        "y": 87,
        "width": 80,
        "height": 8,
        "fontSize": 14,
        "textAlign": "left",
        "color": "#a0a0a0"
      }
    ]
  }
}
```

---

## 🚨 Error Responses

### 400 Bad Request (Invalid Parameters)
```json
{
  "message": "Validation failed",
  "errors": {
    "theme": ["The theme field must be either light or dark."],
    "coverType": ["The cover type field must be either text or image."],
    "type": ["The type field must be either single or carousel."]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 500 Server Error
```json
{
  "message": "Failed to generate template",
  "errors": {}
}
```

---

## 🧪 Testing

### cURL Example

```bash
# Generate a light image single template
curl -X POST http://localhost:8000/api/templates/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "theme": "light",
    "coverType": "image",
    "type": "single"
  }'
```

### Test All 8 Combinations

```bash
# Light + Text + Single
curl -X POST http://localhost:8000/api/templates/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"theme":"light","coverType":"text","type":"single"}'

# Light + Text + Carousel
curl -X POST http://localhost:8000/api/templates/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"theme":"light","coverType":"text","type":"carousel"}'

# Light + Image + Single
curl -X POST http://localhost:8000/api/templates/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"theme":"light","coverType":"image","type":"single"}'

# Light + Image + Carousel
curl -X POST http://localhost:8000/api/templates/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"theme":"light","coverType":"image","type":"carousel"}'

# Dark + Text + Single
curl -X POST http://localhost:8000/api/templates/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","coverType":"text","type":"single"}'

# Dark + Text + Carousel
curl -X POST http://localhost:8000/api/templates/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","coverType":"text","type":"carousel"}'

# Dark + Image + Single
curl -X POST http://localhost:8000/api/templates/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","coverType":"image","type":"single"}'

# Dark + Image + Carousel
curl -X POST http://localhost:8000/api/templates/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","coverType":"image","type":"carousel"}'
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

## 📊 Implementation Suggestions

### Laravel Controller Example

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TemplateGenerationController extends Controller
{
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'theme' => 'required|in:light,dark',
            'coverType' => 'required|in:text,image',
            'type' => 'required|in:single,carousel',
        ]);

        $template = $this->buildTemplate(
            $validated['theme'],
            $validated['coverType'],
            $validated['type']
        );

        return response()->json(['data' => $template]);
    }

    private function buildTemplate(string $theme, string $coverType, string $type): array
    {
        $id = (string) Str::uuid();

        // Select images based on parameters
        $imageUrl = $this->selectImage($theme, $coverType);
        $carouselImages = $type === 'carousel' ? $this->selectCarouselImages($theme, $coverType) : null;

        // Generate text zones based on parameters
        $textZones = $this->generateTextZones($theme, $coverType);

        return [
            'id' => $id,
            'name' => 'Generated Template',
            'theme' => $theme,
            'coverType' => $coverType,
            'type' => $type,
            'description' => ucfirst($theme) . ' theme ' . $coverType . '-focused ' . $type . ' post',
            'imageUrl' => $imageUrl,
            'carouselImages' => $carouselImages,
            'textZones' => $textZones,
        ];
    }

    private function selectImage(string $theme, string $coverType): string
    {
        // Logic to select appropriate image
        // This could use an image service, database, or predefined URLs
        $images = [
            'light_text' => 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1080&q=80',
            'light_image' => 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1080&q=80',
            'dark_text' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80',
            'dark_image' => 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=1080&q=80',
        ];

        return $images["{$theme}_{$coverType}"];
    }

    private function selectCarouselImages(string $theme, string $coverType): array
    {
        // Return 2-3 additional images for carousel
        // Implementation depends on your image source
        return [
            'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1080&q=80',
            'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1080&q=80',
        ];
    }

    private function generateTextZones(string $theme, string $coverType): array
    {
        $textColor = $theme === 'light' ? '#1a1a1a' : '#ffffff';
        $bodyColor = $theme === 'light' ? '#4a4a4a' : '#e0e0e0';

        // Text-focused templates have more text zones
        if ($coverType === 'text') {
            return [
                [
                    'id' => 'title',
                    'label' => 'Title',
                    'x' => 10,
                    'y' => 30,
                    'width' => 80,
                    'height' => 20,
                    'fontSize' => 42,
                    'textAlign' => 'left',
                    'color' => $textColor,
                ],
                [
                    'id' => 'content',
                    'label' => 'Content',
                    'x' => 10,
                    'y' => 55,
                    'width' => 80,
                    'height' => 30,
                    'fontSize' => 20,
                    'textAlign' => 'left',
                    'color' => $bodyColor,
                ],
                [
                    'id' => 'caption',
                    'label' => 'Caption',
                    'x' => 10,
                    'y' => 87,
                    'width' => 80,
                    'height' => 8,
                    'fontSize' => 14,
                    'textAlign' => 'left',
                    'color' => $bodyColor,
                ],
            ];
        }

        // Image-focused templates have fewer, overlaid text zones
        return [
            [
                'id' => 'headline',
                'label' => 'Headline',
                'x' => 10,
                'y' => 35,
                'width' => 80,
                'height' => 15,
                'fontSize' => 44,
                'textAlign' => 'center',
                'color' => $textColor,
            ],
            [
                'id' => 'body',
                'label' => 'Body Text',
                'x' => 10,
                'y' => 55,
                'width' => 80,
                'height' => 25,
                'fontSize' => 18,
                'textAlign' => 'center',
                'color' => $bodyColor,
            ],
        ];
    }
}
```

### Route Registration

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/templates/generate', [TemplateGenerationController::class, 'generate']);
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
- Template generation service method
- PostCreator UI with theme/coverType/format selectors
- Generate button with loading state
- Dynamic form fields based on generated template
- Preview with overlay text zones
- Badge display for theme/coverType/format
- Updated ScheduledPost interface
- Mock data with new structure

### ⏳ Pending Backend
- `POST /api/templates/generate` endpoint
- Image selection logic
- Text zone generation logic
- Validation and error handling

---

## 📖 Related Documentation

- `/docs/api/quick-reference.md` - Authentication API reference
- `/docs/backend/MESSAGE_FROM_BACKEND_TEAM.md` - Backend setup guide
- `/docs/backend/integration-guide.md` - Full integration guide

---

## 💡 Notes for Backend Developer

1. **No Database Storage**: Templates are generated on-the-fly, not stored in database
2. **Image URLs**: Use Unsplash or similar for placeholder images
3. **Text Zones**: Define logical text zones based on theme/coverType combination
4. **Unique IDs**: Generate new UUID for each template generation
5. **Validation**: Strictly validate enum values (theme, coverType, type)
6. **Performance**: Generation should be fast (<500ms) as it happens on every post creation
7. **Flexibility**: Backend has full control over image selection and text zone layout

---

**Questions?** Contact the frontend team or refer to existing authentication implementation as reference.
