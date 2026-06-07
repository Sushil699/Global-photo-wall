# Global Photo Wall

A production-ready public photo sharing platform where anyone in the world can upload images without authentication. All photos are visible in a responsive masonry gallery, each with a unique searchable ID.

![Gallery Screenshot Placeholder](./docs/screenshots/gallery-placeholder.png)
![Upload Modal Screenshot Placeholder](./docs/screenshots/upload-placeholder.png)
![Photo Detail Screenshot Placeholder](./docs/screenshots/detail-placeholder.png)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Backend | Spring Boot 3.4 (Java 21) |
| Database | MongoDB Atlas |
| Image Storage | Cloudinary |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

## Project Structure

```
global-photo-wall/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/globalphotowall/
│   │   ├── controller/         # REST endpoints
│   │   ├── service/            # Business logic
│   │   ├── repository/         # MongoDB repositories
│   │   ├── model/              # Domain entities
│   │   ├── dto/                # API response objects
│   │   ├── exception/          # Error handling
│   │   └── config/             # CORS, Cloudinary, properties
│   ├── Dockerfile
│   └── render.yaml
├── frontend/                   # React SPA
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Route pages
│       ├── services/           # Axios API client
│       ├── hooks/              # Custom React hooks
│       └── utils/              # Helpers & validators
└── README.md
```

## Features

- **Public upload** — No account required; JPEG, PNG, WebP up to 10 MB
- **Unique IDs** — Sequential IDs like `IMG-100001`, `IMG-100002`
- **Public gallery** — Masonry layout with infinite scroll
- **Photo detail** — Full-size view with zoom, upload date, view count
- **Search** — Find photos by exact ID
- **View counter** — Increments on each detail page visit
- **Duplicate prevention** — SHA-256 content hash blocks repeated uploads

## Design Decisions

1. **Layered Spring Boot architecture** — Controllers handle HTTP, services contain business logic, repositories abstract MongoDB. Keeps the API testable and maintainable.

2. **Cloudinary for images, MongoDB for metadata** — Images are served from Cloudinary CDN; only URLs and metadata live in MongoDB. This keeps the database lean and scales image delivery globally.

3. **Atomic photo ID generation** — A MongoDB counter collection with `findAndModify` ensures unique sequential IDs even under concurrent uploads.

4. **Content-hash deduplication** — Before upload, the backend hashes file bytes. Duplicate content returns HTTP 409 instead of re-uploading to Cloudinary.

5. **Infinite scroll over traditional pagination** — Better UX for a photo gallery; the API still uses page/size parameters for scalability.

6. **Separate view increment endpoint** — `PUT /api/photos/{id}/view` is called from the detail page so gallery browsing does not inflate view counts.

---

## Local Development Setup

### Prerequisites

- Java 21
- Maven 3.9+
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### 1. MongoDB Atlas (or local)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access (`0.0.0.0/0` for development).
3. Copy the connection string:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/global-photo-wall
   ```

### 2. Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com).
2. From the Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

### 3. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials

# Set environment variables (PowerShell example)
$env:MONGODB_URI="mongodb+srv://..."
$env:CLOUDINARY_CLOUD_NAME="your_cloud"
$env:CLOUDINARY_API_KEY="your_key"
$env:CLOUDINARY_API_SECRET="your_secret"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"

mvn spring-boot:run
```

API runs at `http://localhost:8080`

### 4. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8080

npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## API Documentation

Base URL: `https://your-api.onrender.com` (production) or `http://localhost:8080` (local)

### `POST /api/photos/upload`

Upload a new photo.

**Request:** `multipart/form-data` with field `file`

**Response:** `201 Created`
```json
{
  "photoId": "IMG-100001",
  "imageUrl": "https://res.cloudinary.com/...",
  "uploadedAt": "2026-06-06T12:00:00Z",
  "message": "Photo uploaded successfully"
}
```

**Errors:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid file type or empty file |
| 413 | File exceeds 10 MB |
| 409 | Duplicate image already uploaded |

---

### `GET /api/photos`

List photos (newest first) with pagination.

**Query params:** `page` (default 0), `size` (default 20, max 50)

**Response:** `200 OK`
```json
{
  "photos": [
    {
      "photoId": "IMG-100003",
      "imageUrl": "https://res.cloudinary.com/...",
      "uploadedAt": "2026-06-06T12:00:00Z",
      "viewCount": 5
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 42,
  "totalPages": 3,
  "hasNext": true
}
```

---

### `GET /api/photos/{photoId}`

Get a single photo by ID.

**Response:** `200 OK` — Photo object

**Errors:** `404` if not found

---

### `GET /api/photos/search?photoId=IMG-100001`

Search for a photo by exact ID.

**Response:** `200 OK` — Photo object

**Errors:** `404` if not found

---

### `PUT /api/photos/{photoId}/view`

Increment view count (call when detail page opens).

**Response:** `200 OK` — Updated photo object

---

### `GET /api/health`

Health check for deployment monitoring.

**Response:** `200 OK`
```json
{ "status": "UP", "service": "Global Photo Wall API" }
```

---

## MongoDB Schema

**Collection: `photos`**
```json
{
  "_id": "ObjectId",
  "photoId": "IMG-100001",
  "imageUrl": "https://res.cloudinary.com/...",
  "contentHash": "sha256hex...",
  "uploadedAt": "ISODate",
  "viewCount": 0
}
```

**Collection: `counters`**
```json
{
  "_id": "photo_id",
  "seq": 100001
}
```

---

## Deployment

### Frontend — Vercel

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Import the repository.
4. Set **Root Directory** to `frontend`.
5. Framework Preset: **Vite**.
6. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-api.onrender.com
   ```
7. Deploy. Vercel auto-detects `npm run build` and serves from `dist/`.
8. The included `vercel.json` handles SPA routing for React Router.

### Backend — Render

1. Go to [render.com](https://render.com) → **New Web Service**.
2. Connect your GitHub repo.
3. Set **Root Directory** to `backend`.
4. Runtime: **Docker** (uses included `Dockerfile`).
5. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
6. Set **Health Check Path** to `/api/health`.
7. Deploy. Render assigns a URL like `https://global-photo-wall-api.onrender.com`.

Alternatively, use the included `render.yaml` Blueprint for infrastructure-as-code deployment.

### MongoDB Atlas (Production)

1. Create a production cluster (M0 free tier works for demos).
2. **Database Access** → create a user with read/write on `global-photo-wall`.
3. **Network Access** → add `0.0.0.0/0` (or Render's IP ranges).
4. Use the SRV connection string as `MONGODB_URI`.

### Cloudinary (Production)

1. Use the same credentials from your Cloudinary dashboard.
2. Images are stored under the `global-photo-wall/` folder.
3. Optional: configure upload presets or transformations in the Cloudinary console.

### Post-Deploy Checklist

- [ ] Backend health check returns `UP`
- [ ] Frontend `VITE_API_BASE_URL` points to Render URL
- [ ] Backend `CORS_ALLOWED_ORIGINS` includes Vercel URL
- [ ] Upload a test image end-to-end
- [ ] Search by photo ID works
- [ ] View count increments on detail page

---

## Environment Variables

### Frontend (`.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL |

### Backend (`.env` or Render env vars)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins |
| `PORT` | Server port (Render sets automatically) |

---

## Future Enhancements

The following features are intentionally excluded from the initial release but can be added later:

- User authentication
- Likes and comments
- Payment integration for premium photo slots
- User profiles
- Admin moderation dashboard
- AI image tagging

---

## License

MIT
