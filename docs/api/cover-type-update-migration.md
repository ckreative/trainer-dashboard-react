# Cover Type Field Update - Frontend Migration Guide

**Date**: October 30, 2025
**Priority**: Medium
**Breaking Change**: Yes (validation update)

---

## 🎯 What Changed

The `cover_type` field has been simplified to better reflect its purpose. The `carousel_slide` option has been **removed** because it was incorrectly conflating two separate concepts:

### Before (Incorrect):
```typescript
cover_type: 'text' | 'solid' | 'image' | 'carousel_slide'
type: 'single' | 'carousel'
```

### After (Correct):
```typescript
cover_type: 'text' | 'image'        // How the cover displays
type: 'single' | 'carousel'         // Post structure
```

---

## 📊 Understanding the Fields

### `cover_type` - Cover Display Style
Controls **HOW** the cover is displayed:
- `text` - Text overlay on solid or gradient background
- `image` - Image background with optional text overlay

### `type` - Post Structure
Controls **WHAT** structure the post uses:
- `single` - Single post (one image)
- `carousel` - Carousel post (multiple slides)

### ✅ Correct Usage Examples:

```typescript
// Single post with text cover
{
  type: 'single',
  cover_type: 'text',
  template_name: 'Cover - Text Background'
}

// Single post with image cover
{
  type: 'single',
  cover_type: 'image',
  template_name: 'Cover - Image Background'
}

// Carousel post with text-based slides
{
  type: 'carousel',
  cover_type: 'text',
  template_name: 'Carousel Slide (Light)'
}

// Carousel post with image-based slides
{
  type: 'carousel',
  cover_type: 'image',
  template_name: 'Carousel - Image Slides'
}
```

---

## 🔧 Required Frontend Changes

### 1. Update TypeScript Types

**Location**: `src/types/post.ts` (or wherever your types are defined)

```typescript
// ❌ OLD - Remove this
export type CoverType = 'text' | 'solid' | 'image' | 'carousel_slide';

// ✅ NEW - Use this
export type CoverType = 'text' | 'image';

export type PostType = 'single' | 'carousel';

export interface Post {
  id: string;
  user_id: string;
  template_id?: string;
  template_name?: string;
  theme?: 'light' | 'dark';
  cover_type?: CoverType;        // Only 'text' or 'image'
  type?: PostType;               // 'single' or 'carousel'
  template_image_url?: string;
  text_content?: Record<string, string>;
  status: 'draft' | 'scheduled' | 'published';
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
}
```

### 2. Update Form Components

**Location**: Post creation/edit forms

```tsx
// ❌ OLD - Remove carousel_slide option
<Select name="cover_type">
  <option value="text">Text</option>
  <option value="solid">Solid</option>
  <option value="image">Image</option>
  <option value="carousel_slide">Carousel Slide</option>
</Select>

// ✅ NEW - Only text and image
<Select name="cover_type">
  <option value="text">Text Overlay</option>
  <option value="image">Image Background</option>
</Select>

// Separate field for post structure
<Select name="type">
  <option value="single">Single Post</option>
  <option value="carousel">Carousel Post</option>
</Select>
```

### 3. Update Form Validation

**Location**: Form validation schemas (Zod, Yup, etc.)

```typescript
// ❌ OLD
const postSchema = z.object({
  cover_type: z.enum(['text', 'solid', 'image', 'carousel_slide']).optional(),
  type: z.enum(['single', 'carousel']).optional(),
});

// ✅ NEW
const postSchema = z.object({
  cover_type: z.enum(['text', 'image']).optional(),
  type: z.enum(['single', 'carousel']).optional(),
});
```

### 4. Update Template Filtering Logic

**Location**: Template selection components

```typescript
// ❌ OLD - Don't filter by carousel_slide
const carouselTemplates = templates.filter(
  t => t.cover_type === 'carousel_slide'
);

// ✅ NEW - Filter by type instead
const carouselTemplates = templates.filter(
  t => t.type === 'carousel'
);

const textCoverTemplates = templates.filter(
  t => t.cover_type === 'text'
);

const imageCoverTemplates = templates.filter(
  t => t.cover_type === 'image'
);
```

### 5. Update Conditional Rendering

**Location**: Components that render based on cover_type

```tsx
// ❌ OLD - Remove carousel_slide checks
{post.cover_type === 'carousel_slide' && (
  <CarouselSlideEditor />
)}

// ✅ NEW - Check type instead
{post.type === 'carousel' && (
  <CarouselEditor />
)}

// Check cover_type for display style
{post.cover_type === 'text' && (
  <TextOverlayEditor />
)}

{post.cover_type === 'image' && (
  <ImageBackgroundEditor />
)}
```

### 6. Update API Request Payloads

**Location**: API service calls

```typescript
// ✅ Ensure you're sending valid values
const createPost = async (postData: CreatePostPayload) => {
  // Validate cover_type before sending
  if (postData.cover_type && !['text', 'image'].includes(postData.cover_type)) {
    throw new Error('Invalid cover_type. Must be "text" or "image"');
  }

  return fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};
```

---

## 🔍 What to Search For

Use these search patterns to find all instances that need updating:

```bash
# Search for carousel_slide references
grep -r "carousel_slide" src/

# Search for cover_type enums/types
grep -r "cover_type.*:" src/

# Search for solid references (also removed earlier)
grep -r "'solid'" src/
grep -r '"solid"' src/
```

---

## 🧪 Testing Checklist

After making changes, test these scenarios:

### Create Post Flow
- [ ] Create single post with text cover
- [ ] Create single post with image cover
- [ ] Create carousel post with text covers
- [ ] Create carousel post with image covers
- [ ] Verify invalid cover_type values show validation error

### Edit Post Flow
- [ ] Edit existing post and change cover_type
- [ ] Edit existing post and change type (single ↔ carousel)
- [ ] Verify form validation prevents invalid values

### Template Selection
- [ ] Filter templates by `type: 'single'`
- [ ] Filter templates by `type: 'carousel'`
- [ ] Filter templates by `cover_type: 'text'`
- [ ] Filter templates by `cover_type: 'image'`

### API Integration
- [ ] POST /api/posts accepts `cover_type: 'text'`
- [ ] POST /api/posts accepts `cover_type: 'image'`
- [ ] POST /api/posts rejects `cover_type: 'carousel_slide'` (422 error)
- [ ] GET /api/templates returns correct cover_type values

---

## 📦 Affected Templates

The following templates were updated on the backend:

| Template Name | Type | Old cover_type | New cover_type |
|---------------|------|----------------|----------------|
| Carousel Slide (Light) | carousel | carousel_slide | text |
| Carousel Slide (Dark) | carousel | carousel_slide | text |

**Note**: If you have hardcoded template IDs or names, these templates still exist but their `cover_type` has changed from `carousel_slide` to `text`.

---

## 🚨 Breaking Changes

### API Validation
The backend will **reject** requests with `cover_type: 'carousel_slide'`:

```json
// ❌ This will return 422 Unprocessable Entity
{
  "cover_type": "carousel_slide"
}

// Response:
{
  "message": "The selected cover type is invalid.",
  "errors": {
    "cover_type": ["The selected cover type is invalid."]
  }
}
```

### Database Enum
The database enum has been updated. Valid values are now **only**:
- `text`
- `image`

---

## 🎓 Migration Strategy

### Step 1: Update Types First
Start with TypeScript types to get compile-time errors showing you where changes are needed.

### Step 2: Update Components
Fix all form components, dropdowns, and validation schemas.

### Step 3: Update Logic
Search for conditional logic that checks for `carousel_slide` and refactor to use the `type` field instead.

### Step 4: Test Thoroughly
Run through all create/edit flows to ensure everything works.

### Step 5: Update Documentation
Update any frontend documentation or comments that reference the old behavior.

---

## ❓ FAQ

**Q: What if I have existing posts with `cover_type: 'carousel_slide'`?**
A: The backend database has been refreshed. All existing posts are cleared. If you have a production database, contact the backend team for a data migration script.

**Q: Should carousel posts always use `cover_type: 'text'`?**
A: No! Carousel posts can use either:
- `cover_type: 'text'` - Text-based carousel slides
- `cover_type: 'image'` - Image-based carousel slides

**Q: What happened to `cover_type: 'solid'`?**
A: It was removed earlier as it was functionally identical to `text`. Use `text` instead.

**Q: How do I show a carousel slide template selector?**
A: Filter by `type === 'carousel'`, not by cover_type:
```typescript
const carouselTemplates = templates.filter(t => t.type === 'carousel');
```

**Q: Can a single post use text cover type?**
A: Yes! Both single and carousel posts can use either `text` or `image` cover types.

---

## 📞 Questions?

If you have questions about this update, check:
1. This migration guide
2. `/docs/api/posts-integration.md` - Posts API documentation
3. `/docs/api/templates-api-spec.md` - Templates API documentation
4. Backend team (open an issue or ask in Slack)

---

**Migration Deadline**: ASAP (validation will reject old values immediately)

**Backend Updated**: October 30, 2025
**Database Migrated**: October 30, 2025
**Frontend Update Required**: Before next deployment
