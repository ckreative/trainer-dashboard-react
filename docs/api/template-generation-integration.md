# Template Generation API - Frontend Integration Guide

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

## Two Endpoints: Preview vs Generate

### Quick Comparison

| Feature | `/preview` (NEW) | `/generate` |
|---------|------------------|-------------|
| **Purpose** | Live form previews | Final image save |
| **Response** | Base64 only | URL or Base64 |
| **Storage** | No | Yes (optional) |
| **Speed** | Faster (~200-400ms) | Standard (~300-600ms) |
| **Rate Limit** | 60/min | 30/min |
| **When to Use** | Field blur events | Save/Publish actions |

### Usage Pattern

```javascript
// Use PREVIEW for live updates as user types
const handleFieldBlur = async () => {
  const result = await fetch('/templates/{id}/preview', { ... });
  const { image } = await result.json();
  setPreview(`data:image/png;base64,${image}`);
};

// Use GENERATE for final save
const handlePublish = async () => {
  const result = await fetch('/templates/{id}/generate', { ... });
  const { url } = await result.json();
  savePost({ template_image_url: url });
};
```

**📘 For detailed preview integration, see: [Template Live Preview Guide](./template-preview-integration.md)**

---

## Preview Endpoint (Live Previews)

**POST** `/templates/{id}/preview`

**Purpose**: Generate real-time image previews without saving to storage.

**Request:**
```json
{
  "textData": {
    "category": "INNOVATION",
    "quote": "The future is here",
    "attribution": "- John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "image": "iVBORw0KGgoAAAANSUhEUgAABDgAAAV..."
}
```

**Display:**
```javascript
const { success, image } = await response.json();
if (success) {
  setPreviewUrl(`data:image/png;base64,${image}`);
}
```

**Characteristics**:
- ✅ Fast generation (no file I/O)
- ✅ Higher rate limit (60/min)
- ✅ Perfect for field blur events
- ✅ No storage clutter

---

## Generate Image from Template (Final Save)

**POST** `/templates/{id}/generate`

Generates an Instagram post image (1080x1350px) from a template with dynamic text overlays.

### Request Parameters

**Path Parameters:**
- `id` (string, required): Template UUID

**Request Body:**
```json
{
  "textData": {
    "category": "INNOVATION",
    "quote": "The future is here",
    "attribution": "- John Doe"
  },
  "returnImage": false
}
```

**Field Descriptions:**
- `textData` (object, required): Dynamic text content for each text zone defined in the template
  - Keys must match the `id` field of text zones in the template
  - Values are the text strings to overlay
- `returnImage` (boolean, optional): Determines response format
  - `false` (default): Saves image to storage and returns URL
  - `true`: Returns base64-encoded image data directly

---

## Response Formats

### Mode 1: Save and Return URL (`returnImage: false`)

**Use Case**: When you want to save the image permanently and get a URL to display/download later.

**Request:**
```javascript
const response = await fetch(`http://localhost:8001/api/templates/${templateId}/generate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    textData: {
      category: "INNOVATION",
      quote: "The future is here",
      attribution: "- John Doe"
    },
    returnImage: false
  })
});

const data = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image generated and saved successfully",
  "data": {
    "url": "http://localhost:8001/storage/generated/template_fe88cc98-c77a-464e-9b89-4e5ea022e12a_1761786335.png",
    "path": "generated/template_fe88cc98-c77a-464e-9b89-4e5ea022e12a_1761786335.png"
  }
}
```

**Usage:**
```javascript
if (data.success) {
  const imageUrl = data.data.url;
  // Use the URL directly in an <img> tag or save to your post
  setGeneratedImageUrl(imageUrl);
}
```

---

### Mode 2: Return Base64 Image (`returnImage: true`)

**Use Case**: When you want the image data immediately for preview or client-side manipulation.

**Request:**
```javascript
const response = await fetch(`http://localhost:8001/api/templates/${templateId}/generate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    textData: {
      headline: "Breaking News Story",
      category: "NEWS"
    },
    returnImage: true
  })
});

const data = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image generated successfully",
  "data": {
    "image": "iVBORw0KGgoAAAANSUhEUgAABDgAAAV...[base64 encoded PNG data]",
    "format": "png",
    "encoding": "base64"
  }
}
```

**Usage:**
```javascript
if (data.success) {
  const base64Image = data.data.image;
  const imgSrc = `data:image/png;base64,${base64Image}`;

  // Use in <img> tag for immediate preview
  setPreviewImage(imgSrc);

  // Or convert to Blob for upload
  const blob = await fetch(imgSrc).then(r => r.blob());
}
```

---

## Template Text Zones

Each template has predefined text zones. You must provide text data for the zones you want to populate.

### Common Text Zone IDs

#### Cover Templates (Text/Solid/Image)
```json
{
  "category": "INNOVATION",     // Small category label
  "quote": "Main headline",     // Large main text
  "attribution": "- Author"     // Attribution text
}
```

Or for news-style:
```json
{
  "headline": "Breaking News Story",  // Main headline
  "category": "NEWS"                  // Category label
}
```

#### Carousel Slide Templates
```json
{
  "title": "Slide Title",        // Bold title text
  "body": "Slide body content"   // Paragraph text
}
```

**Note**: The `logo` zone is automatically populated by the template - don't include it in `textData`.

---

## Getting Template Information

Before generating, you may want to fetch template details to know which text zones are available:

**GET** `/templates/{id}`

**Response:**
```json
{
  "data": {
    "id": "fe88cc98-c77a-464e-9b89-4e5ea022e12a",
    "name": "Cover - Text Only (Dark)",
    "theme": "dark",
    "cover_type": "text",
    "type": "single",
    "text_zones": [
      {
        "id": "category",
        "label": "Category",
        "x": 5,
        "y": 8,
        "fontSize": 28,
        "fontFamily": "poppins-light",
        "color": "#FFFFFF"
      },
      {
        "id": "quote",
        "label": "Main Quote",
        "x": 5,
        "y": 15,
        "fontSize": 80,
        "fontFamily": "poppins-medium",
        "color": "#FFFFFF"
      },
      {
        "id": "attribution",
        "label": "Attribution",
        "x": 5,
        "y": 73,
        "fontSize": 40,
        "color": "#FFFFFF"
      }
    ]
  }
}
```

Use the `text_zones` array to:
1. Build your form UI dynamically
2. Know which `id` values to use in `textData`
3. Display the `label` as field labels in your form

---

## Complete Example: Generate Post Image

```javascript
// 1. Fetch template to get text zones
const fetchTemplate = async (templateId) => {
  const response = await fetch(`http://localhost:8001/api/templates/${templateId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return await response.json();
};

// 2. Generate image with user-provided text
const generatePostImage = async (templateId, formData) => {
  const response = await fetch(`http://localhost:8001/api/templates/${templateId}/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      textData: {
        category: formData.category,
        quote: formData.quote,
        attribution: formData.attribution
      },
      returnImage: false  // Save to storage
    })
  });

  return await response.json();
};

// 3. Usage in component
const CreatePost = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (formData) => {
    setLoading(true);
    try {
      const result = await generatePostImage(selectedTemplate.id, formData);

      if (result.success) {
        setImageUrl(result.data.url);
        // Save the URL to your post model
        await savePost({
          template_id: selectedTemplate.id,
          template_image_url: result.data.url,
          text_content: formData,
          status: 'draft'
        });
      } else {
        console.error('Generation failed:', result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {imageUrl && <img src={imageUrl} alt="Generated post" />}
      {/* Form UI here */}
    </div>
  );
};
```

---

## Error Handling

### Validation Errors (422)

**Scenario**: Invalid or missing textData

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "textData": ["The text data field is required."]
  }
}
```

### Not Found (404)

**Scenario**: Template doesn't exist

```json
{
  "message": "No query results for model [App\\Models\\Template] fe88cc98-..."
}
```

### Server Error (500)

**Scenario**: Image generation failed

```json
{
  "success": false,
  "message": "Failed to generate image",
  "error": "Detailed error message"
}
```

**Example Error Handling:**
```javascript
try {
  const result = await generatePostImage(templateId, formData);

  if (!result.success) {
    throw new Error(result.error || result.message);
  }

  return result.data;
} catch (error) {
  if (error.response?.status === 422) {
    // Handle validation errors
    setErrors(error.response.data.errors);
  } else if (error.response?.status === 404) {
    // Handle template not found
    showNotification('Template not found');
  } else {
    // Handle general errors
    showNotification('Failed to generate image');
  }
}
```

---

## Image Specifications

All generated images follow Instagram post specifications:

- **Dimensions**: 1080 x 1350 pixels (4:5 ratio)
- **Format**: PNG with transparency support
- **Font**: Poppins (Light, Regular, Medium variants)
- **Text Rendering**: High-quality anti-aliased text
- **Logo**: Automatically positioned CK logo overlay
- **Gradient**: Smooth 30-step gradient for image backgrounds (if configured)

---

## Performance Considerations

### Generation Time
- **Typical**: 200-500ms per image
- **With Gradient**: 300-600ms per image
- **Complex Text**: 400-700ms per image

### Storage
- **Average Size**: 20-30KB per generated PNG
- **Storage Path**: `storage/app/public/generated/`
- **URL Pattern**: `{base_url}/storage/generated/{filename}.png`
- **Cleanup**: Consider implementing cleanup for old generated images

### Optimization Tips

1. **Use URL Mode for Permanent Posts**:
   ```javascript
   { returnImage: false }  // Saves to storage, reusable URL
   ```

2. **Use Base64 Mode for Previews**:
   ```javascript
   { returnImage: true }  // Quick preview, no storage
   ```

3. **Cache Template Data**:
   ```javascript
   // Fetch template once, reuse for multiple generations
   const template = await fetchTemplate(templateId);
   ```

4. **Debounce Live Previews**:
   ```javascript
   const debouncedGenerate = debounce(generatePreview, 500);
   ```

---

## TypeScript Types

```typescript
export interface TextData {
  category?: string;
  quote?: string;
  attribution?: string;
  headline?: string;
  title?: string;
  body?: string;
  [key: string]: string | undefined;
}

export interface GenerateImageRequest {
  textData: TextData;
  returnImage?: boolean;
}

export interface GenerateImageResponseURL {
  success: true;
  message: string;
  data: {
    url: string;
    path: string;
  };
}

export interface GenerateImageResponseBase64 {
  success: true;
  message: string;
  data: {
    image: string;  // Base64 encoded
    format: 'png';
    encoding: 'base64';
  };
}

export type GenerateImageResponse =
  | GenerateImageResponseURL
  | GenerateImageResponseBase64;

export interface TextZone {
  id: string;
  label: string;
  x: number;        // Percentage (0-100)
  y: number;        // Percentage (0-100)
  width: number;    // Percentage (0-100)
  height: number;   // Percentage (0-100)
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'right' | 'center';
  lineHeight?: number;
  logoUrl?: string;
}

export interface Template {
  id: string;
  name: string;
  post_type: string;
  type: 'single' | 'carousel';
  theme: 'light' | 'dark';
  cover_type: 'text' | 'solid' | 'image' | 'carousel_slide';
  description: string;
  image_url: string;
  text_zones: TextZone[];
  gradient?: {
    start: number;
    end: number;
    steps: number;
  };
}
```

---

## React Hook Example

```typescript
import { useState } from 'react';

export const useTemplateGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    templateId: string,
    textData: TextData,
    returnImage: boolean = false
  ): Promise<GenerateImageResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.VITE_API_BASE_URL}/templates/${templateId}/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ textData, returnImage })
        }
      );

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || data.message);
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
};

// Usage
const { generate, loading, error } = useTemplateGeneration();

const handleSubmit = async (formData) => {
  const result = await generate(templateId, formData, false);
  console.log('Image URL:', result.data.url);
};
```

---

## Testing

### Manual Testing with cURL

```bash
# Generate and save
curl -X POST http://localhost:8001/api/templates/{template-id}/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "textData": {
      "category": "INNOVATION",
      "quote": "Test Quote",
      "attribution": "- Test User"
    },
    "returnImage": false
  }'

# Generate and return base64
curl -X POST http://localhost:8001/api/templates/{template-id}/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "textData": {
      "headline": "Test Headline",
      "category": "NEWS"
    },
    "returnImage": true
  }' | jq '.data.image' | head -c 100
```

---

## FAQ

**Q: Can I regenerate the same content multiple times?**
A: Yes, each generation creates a new unique file. The filename includes a timestamp.

**Q: What happens if I don't provide all text zones?**
A: Only the text zones you provide will be rendered. Missing zones are simply skipped (logo is automatic).

**Q: Can I customize font size or position?**
A: No, these are defined in the template. Select a different template for different layouts.

**Q: What if image generation fails?**
A: You'll receive a 500 error with error details. Common causes: missing fonts, invalid template data, or storage issues.

**Q: How long are generated images stored?**
A: Indefinitely by default. You may want to implement cleanup for old images or associate them with posts for lifecycle management.

**Q: Can I use custom background images?**
A: Not via this endpoint. Background images are defined in the template. Use templates with `cover_type: "image"` for custom backgrounds.

---

## Support

For API support or issues with template generation:
- Check Laravel logs: `storage/logs/laravel.log`
- Verify fonts exist: `storage/fonts/Poppins/`
- Check storage permissions: `storage/app/public/generated/`
- Contact backend team with template ID and error details
