# EventPix Database Configuration

## Environment Variables

### For Web App (`apps/web/.env.local`)

```bash
# Appwrite Configuration (default values shown)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=eventpix
NEXT_PUBLIC_APPWRITE_BUCKET_ID=photos
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID=events
NEXT_PUBLIC_APPWRITE_PHOTOS_COLLECTION_ID=photos
NEXT_PUBLIC_APPWRITE_INVITATIONS_COLLECTION_ID=invitations
```

### For Admin App (`apps/admin/.env`)

```bash
# Same as above but for Vite
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
# ... etc
```

## Appwrite Setup

### 1. Create Project
- Log in to Appwrite Console
- Create a new project called "EventPix"
- Copy the Project ID

### 2. Create Database
- Go to Databases > Create Database
- Name: `eventpix`
- ID: `eventpix`

### 3. Create Collections

#### Users Collection (ID: `users`)
- Appwrite manages this automatically with Auth
- No need to create manually

#### Events Collection (ID: `events`)
- Create with ID: `events`
- Attributes:
  - `name` (string, 255, required)
  - `code` (string, 50, required, unique)
  - `visibility` (string, 20, default: 'public')
  - `join_mode` (string, 20, default: 'open')
  - `pin` (string, 10, optional)
  - `approval_required` (boolean, default: false)
  - `allow_anonymous_uploads` (boolean, default: true)
  - `storage_limit_mb` (integer, default: 100)
  - `owner` (string, relationship to users)
  - `description` (string, optional)
  - `start_date` (datetime, optional)
  - `end_date` (datetime, optional)

#### Photos Collection (ID: `photos`)
- Create with ID: `photos`
- Attributes:
  - `file` (string, required) - stores file ID from storage
  - `caption` (string, optional)
  - `event` (string, relationship to events)
  - `owner` (string, relationship to users)
  - `status` (string, 20, default: 'pending')
  - `likes` (string array, optional)
  - `session_tag` (string, optional)
  - `phash` (string, optional)

#### Invitations Collection (ID: `invitations`)
- Create with ID: `invitations`
- Attributes:
  - `event` (string, relationship to events)
  - `email` (string, required)

### 4. Create Storage Bucket

- Go to Storage > Create Bucket
- Name: `photos`
- ID: `photos`
- Permissions: Read/Write as needed for your app

### 5. Configure Authentication

- Go to Auth > Providers
- Enable OAuth2 for Google/Apple
- Set callback URLs

### 6. API Keys

- Go to Settings > API Keys
- Create a new key with appropriate scopes for deployment

## Running the Apps

```bash
# Web
cd apps/web
npm run dev

# Admin
cd apps/admin
npm run dev
```

## Deployment to Appwrite Static Sites

```bash
# Build the web app
cd apps/web
npm run build

# Deploy using the Appwrite CLI or Console
# Upload the .output/static or .next folder as a static site
```