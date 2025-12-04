# Template Live Preview - Frontend Integration Guide

## Overview

The Template Preview endpoint allows you to generate image previews in real-time as users fill out form fields. This provides instant visual feedback without saving images to storage.

## Quick Start

```javascript
// On field blur event
const updatePreview = async (formData) => {
  const response = await fetch(`${API_URL}/templates/${templateId}/preview`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      textData: {
        category: formData.category,
        quote: formData.quote,
        attribution: formData.attribution
      }
    })
  });

  const { success, image } = await response.json();

  if (success) {
    setPreviewUrl(`data:image/png;base64,${image}`);
  }
};
```

---

## Endpoint Details

**POST** `/templates/{id}/preview`

**Purpose**: Generate real-time preview images without saving to storage

**Authentication**: Required (Bearer token)

**Rate Limit**: 60 requests/minute (higher than generate endpoint)

---

## Request Format

```json
{
  "textData": {
    "category": "INNOVATION",
    "quote": "The future is here",
    "attribution": "- John Doe"
  }
}
```

**Field Descriptions:**
- `textData` (object, required): Text content for each template zone
  - Keys match template text zone IDs
  - Values are the text strings to display

---

## Response Format

**Success (200 OK):**
```json
{
  "success": true,
  "image": "iVBORw0KGgoAAAANSUhEUgAABDgAAAV..."
}
```

**Response Fields:**
- `success` (boolean): Always true on success
- `image` (string): Base64-encoded PNG image data

**Error (500):**
```json
{
  "success": false,
  "message": "Preview generation failed",
  "error": "Error details"
}
```

---

## Complete React Implementation

### 1. Custom Hook

```typescript
// hooks/useTemplatePreview.ts
import { useState } from 'react';

interface TextData {
  [key: string]: string;
}

export const useTemplatePreview = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async (templateId: string, textData: TextData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.VITE_API_BASE_URL}/templates/${templateId}/preview`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ textData })
        }
      );

      if (!response.ok) {
        throw new Error('Preview generation failed');
      }

      const { success, image } = await response.json();

      if (!success) {
        throw new Error('Preview generation failed');
      }

      const dataUrl = `data:image/png;base64,${image}`;
      setPreviewUrl(dataUrl);

      return dataUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setError(null);
  };

  return {
    previewUrl,
    loading,
    error,
    generatePreview,
    clearPreview
  };
};
```

### 2. Form Component with Live Preview

```typescript
// components/PostCreator.tsx
import React, { useState } from 'react';
import { useTemplatePreview } from '../hooks/useTemplatePreview';

interface FormData {
  category: string;
  quote: string;
  attribution: string;
}

export const PostCreator: React.FC<{ templateId: string }> = ({ templateId }) => {
  const [formData, setFormData] = useState<FormData>({
    category: '',
    quote: '',
    attribution: ''
  });

  const { previewUrl, loading, generatePreview } = useTemplatePreview();

  const handleFieldBlur = async (fieldName: keyof FormData) => {
    // Only generate preview if field has value
    if (!formData[fieldName].trim()) return;

    try {
      await generatePreview(templateId, formData);
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="post-creator">
      <div className="form-section">
        <input
          type="text"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          onBlur={() => handleFieldBlur('category')}
          placeholder="Category (e.g., INNOVATION)"
        />

        <textarea
          value={formData.quote}
          onChange={(e) => handleChange('quote', e.target.value)}
          onBlur={() => handleFieldBlur('quote')}
          placeholder="Main quote"
          rows={4}
        />

        <input
          type="text"
          value={formData.attribution}
          onChange={(e) => handleChange('attribution', e.target.value)}
          onBlur={() => handleFieldBlur('attribution')}
          placeholder="Attribution (e.g., - John Doe)"
        />
      </div>

      <div className="preview-section">
        <h3>Preview</h3>
        {loading && <div className="spinner">Generating preview...</div>}

        {previewUrl && !loading && (
          <img
            src={previewUrl}
            alt="Post preview"
            className="preview-image"
          />
        )}

        {!previewUrl && !loading && (
          <div className="placeholder">
            Fill in the form to see a preview
          </div>
        )}
      </div>
    </div>
  );
};
```

### 3. Optimized with Debouncing (Optional)

```typescript
// For onChange instead of onBlur
import { useCallback } from 'react';
import { debounce } from 'lodash';

const PostCreator: React.FC<{ templateId: string }> = ({ templateId }) => {
  const { generatePreview } = useTemplatePreview();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    quote: '',
    attribution: ''
  });

  // Debounce preview generation
  const debouncedPreview = useCallback(
    debounce(async (data: FormData) => {
      // Only generate if at least one field has value
      if (!data.category && !data.quote && !data.attribution) return;

      try {
        await generatePreview(templateId, data);
      } catch (error) {
        console.error('Preview failed:', error);
      }
    }, 500), // Wait 500ms after user stops typing
    [templateId, generatePreview]
  );

  const handleChange = (field: keyof FormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    debouncedPreview(newData); // Auto-preview on change
  };

  return (
    // Same JSX as above, but without onBlur handlers
    <input
      value={formData.category}
      onChange={(e) => handleChange('category', e.target.value)}
      placeholder="Category"
    />
  );
};
```

---

## Comparison: Preview vs Generate

| Feature | `/preview` | `/generate` |
|---------|-----------|-------------|
| **When to Use** | Live form previews | Final save/publish |
| **Response** | Base64 only | URL or Base64 |
| **Storage** | No | Yes (optional) |
| **Speed** | ~200-400ms | ~300-600ms |
| **Rate Limit** | 60/min | 30/min |
| **Trigger** | Field blur / onChange | Save / Publish button |

### Usage Pattern

```typescript
// Preview on field blur
const handleFieldBlur = async () => {
  await fetch('/templates/{id}/preview', { ... });
};

// Generate on publish
const handlePublish = async () => {
  const result = await fetch('/templates/{id}/generate', { ... });
  // Save result.data.url to post
};
```

---

## Performance Best Practices

### 1. Conditional Preview Generation

```typescript
const handleFieldBlur = async (fieldName: string) => {
  // Don't generate preview for empty fields
  if (!formData[fieldName].trim()) return;

  // Don't generate if nothing changed since last preview
  if (formData === lastPreviewedData) return;

  await generatePreview(templateId, formData);
  setLastPreviewedData(formData);
};
```

### 2. Loading States

```typescript
{loading && (
  <div className="preview-overlay">
    <Spinner />
    <span>Generating preview...</span>
  </div>
)}

{!loading && previewUrl && (
  <img src={previewUrl} alt="Preview" />
)}
```

### 3. Error Handling

```typescript
try {
  await generatePreview(templateId, formData);
} catch (error) {
  // Show user-friendly error
  toast.error('Preview generation failed. Please try again.');

  // Log for debugging
  console.error('Preview error:', error);
}
```

### 4. Cancel Previous Requests

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

const generatePreview = async (templateId: string, textData: TextData) => {
  // Cancel previous request if still running
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  abortControllerRef.current = new AbortController();

  try {
    const response = await fetch(`/templates/${templateId}/preview`, {
      signal: abortControllerRef.current.signal,
      // ... other options
    });
    // ... rest of logic
  } catch (error) {
    if (error.name === 'AbortError') {
      // Request was cancelled, ignore
      return;
    }
    throw error;
  }
};
```

---

## Full Workflow Example

```typescript
const CreatePostPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<TextData>({});
  const { previewUrl, generatePreview } = useTemplatePreview();
  const [savedPost, setSavedPost] = useState<Post | null>(null);

  // 1. User selects template
  const handleTemplateSelect = async (template: Template) => {
    setSelectedTemplate(template);

    // Initialize form data based on template zones
    const initialData = {};
    template.text_zones.forEach(zone => {
      if (!zone.logoUrl) { // Skip logo zones
        initialData[zone.id] = '';
      }
    });
    setFormData(initialData);
  };

  // 2. User fills form - generate preview on blur
  const handleFieldBlur = async (fieldName: string) => {
    if (!selectedTemplate || !formData[fieldName]) return;

    await generatePreview(selectedTemplate.id, formData);
  };

  // 3. User clicks "Save Draft" - generate and save
  const handleSaveDraft = async () => {
    // Generate final image with storage
    const imageResponse = await fetch(
      `/templates/${selectedTemplate.id}/generate`,
      {
        method: 'POST',
        headers: { /* auth headers */ },
        body: JSON.stringify({
          textData: formData,
          returnImage: false // Save to storage
        })
      }
    );

    const { data: { url } } = await imageResponse.json();

    // Create post
    const postResponse = await fetch('/posts', {
      method: 'POST',
      headers: { /* auth headers */ },
      body: JSON.stringify({
        template_id: selectedTemplate.id,
        template_image_url: url,
        text_content: formData,
        status: 'draft'
      })
    });

    const post = await postResponse.json();
    setSavedPost(post);
  };

  return (
    <div>
      {/* Template selector */}
      <TemplateSelector onSelect={handleTemplateSelect} />

      {selectedTemplate && (
        <>
          {/* Dynamic form based on template zones */}
          <DynamicForm
            zones={selectedTemplate.text_zones}
            data={formData}
            onChange={setFormData}
            onFieldBlur={handleFieldBlur}
          />

          {/* Live preview */}
          <PreviewPanel url={previewUrl} loading={false} />

          {/* Actions */}
          <button onClick={handleSaveDraft}>Save Draft</button>
        </>
      )}
    </div>
  );
};
```

---

## Testing

### Manual Test with cURL

```bash
# Get template details first
curl http://localhost:8001/api/templates/{template-id} \
  -H "Authorization: Bearer YOUR_TOKEN"

# Generate preview
curl -X POST http://localhost:8001/api/templates/{template-id}/preview \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "textData": {
      "category": "INNOVATION",
      "quote": "Test Preview",
      "attribution": "- Test User"
    }
  }' | jq '.success, (.image | length)'
```

### Unit Test Example

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCreator } from './PostCreator';

describe('PostCreator', () => {
  it('generates preview on field blur', async () => {
    const user = userEvent.setup();

    render(<PostCreator templateId="test-template-id" />);

    const categoryInput = screen.getByPlaceholderText('Category');

    // Type in input
    await user.type(categoryInput, 'INNOVATION');

    // Blur triggers preview
    await user.tab();

    // Wait for preview to appear
    await waitFor(() => {
      expect(screen.getByAltText('Post preview')).toBeInTheDocument();
    });
  });
});
```

---

## Troubleshooting

### Preview Not Updating

**Symptom**: Image doesn't update after changing text

**Possible Causes**:
1. Field blur not triggering
2. Previous request still running
3. Rate limit exceeded

**Solutions**:
```typescript
// Add console logging
const handleFieldBlur = async () => {
  console.log('Generating preview with:', formData);
  await generatePreview(templateId, formData);
};

// Check rate limit
if (error.response?.status === 429) {
  alert('Too many requests. Please wait a moment.');
}
```

### Slow Preview Generation

**Symptom**: Takes >1 second to generate preview

**Possible Causes**:
1. Large text content
2. Complex gradient
3. Network latency

**Solutions**:
- Use debouncing (500ms delay)
- Show loading spinner
- Consider caching identical requests

### Base64 Display Issues

**Symptom**: Image not displaying in `<img>` tag

**Solution**:
```typescript
// Ensure proper data URL format
const imageUrl = `data:image/png;base64,${base64String}`;

// Check for valid base64
if (!/^[A-Za-z0-9+/=]+$/.test(base64String)) {
  console.error('Invalid base64 string');
}
```

---

## Summary

### Quick Reference

**Endpoint**: `POST /api/templates/{id}/preview`

**Request**:
```json
{ "textData": { "category": "VALUE", ... } }
```

**Response**:
```json
{ "success": true, "image": "base64..." }
```

**Display**:
```typescript
<img src={`data:image/png;base64,${image}`} />
```

**Best Practices**:
- Generate on field blur (not every keystroke)
- Show loading states
- Handle errors gracefully
- Use preview for previews, generate for final saves
- Don't store preview images

---

**Need Help?** Check the template generation documentation or contact the backend team.
