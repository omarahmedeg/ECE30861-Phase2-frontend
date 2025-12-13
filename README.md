# ECE 461 Package Registry - Frontend

A modern, responsive React frontend for the ECE 461 Trustworthy Module Registry. This application provides a beautiful interface to browse, upload, and manage npm and GitHub packages.

## Features

- 🔐 **Authentication**: Secure login/signup with admin support
- 📦 **Package Management**: Browse, search, upload, update, and delete packages
- 📊 **Package Analytics**: View ratings, costs, and download history
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- 🔍 **Advanced Search**: Search by name or regex patterns
- 👑 **Admin Panel**: Registry management and reset functionality
- 📈 **Real-time Updates**: Live package metrics and statistics

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Sonner** for toast notifications

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Your backend server running (see backend documentation)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Configure the backend URL:

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:
```
VITE_API_URL=http://localhost:8080
```

**Note**: If your backend is running on a different port or host, update this accordingly.

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080` (or the port shown in your terminal).

## Configuration

### Backend Connection

The frontend connects to your backend API using the `VITE_API_URL` environment variable. 

- **Default**: `http://localhost:8080`
- **Production**: Update this to your production backend URL

Example configurations:
```bash
# Local development
VITE_API_URL=http://localhost:8080

# Production
VITE_API_URL=https://your-backend-domain.com

# Custom port
VITE_API_URL=http://localhost:3000
```

### API Endpoints Used

The frontend connects to these backend endpoints:

**Authentication:**
- `PUT /authenticate` - Get auth token
- `POST /users` - Create new user

**Package Operations:**
- `POST /packages` - Search/list packages
- `GET /package/{id}` - Get package details
- `POST /package` - Upload new package
- `POST /package/{id}` - Update package
- `DELETE /package/{id}` - Delete package
- `GET /package/{id}/rate` - Get package rating
- `GET /package/{id}/cost` - Get package cost
- `GET /package/{id}/history` - Get download history
- `POST /package/byRegEx` - Search by regex

**Admin:**
- `DELETE /reset` - Reset registry

## Usage

### First-Time Setup

1. Start your backend server
2. Start the frontend: `npm run dev`
3. Navigate to `http://localhost:8080` (or your configured port)
4. Create an account on the "Sign Up" tab
5. Login with your credentials

### Creating Admin Users

To login as admin, check the "Login as admin" checkbox when signing in.

### Uploading Packages

1. Click "Upload" in the navigation bar
2. Choose upload method:
   - **Via URL**: Enter GitHub or npm URL
   - **Via File**: Upload a ZIP file
3. Optionally add:
   - Package name
   - JS Program
   - Debloat option
4. Click "Upload Package"

### Viewing Package Details

1. Click on any package card in the dashboard
2. View tabs:
   - **Overview**: Basic package information
   - **Rating**: Quality metrics
   - **Cost**: Cost analysis with dependencies
   - **History**: Download history

### Admin Features

1. Login as admin
2. Click "Admin" in the navigation
3. Access to:
   - Reset registry (danger zone)
   - View system statistics

## Development

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── Navbar.tsx       # Navigation bar
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state
├── lib/                 # Utilities
│   ├── api.ts          # API client functions
│   └── utils.ts        # Helper functions
├── pages/              # Route pages
│   ├── Auth.tsx        # Login/Signup
│   ├── Dashboard.tsx   # Package list
│   ├── PackageDetails.tsx
│   ├── Upload.tsx
│   ├── Admin.tsx
│   └── NotFound.tsx
└── App.tsx             # Main app component
```

### Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Customization

The design system is defined in:
- `src/index.css` - CSS variables and base styles
- `tailwind.config.ts` - Tailwind configuration

To change colors, update the HSL values in `src/index.css`:
```css
:root {
  --primary: 217 91% 60%;     /* Blue */
  --accent: 260 80% 65%;      /* Purple */
  /* ... other colors */
}
```

## Troubleshooting

### Backend Connection Issues

If you see connection errors:

1. Verify your backend is running
2. Check the `VITE_API_URL` in your `.env` file
3. Ensure CORS is enabled on your backend
4. Check browser console for specific errors

### Authentication Issues

If authentication fails:

1. Verify user credentials
2. Check that the `/authenticate` endpoint is working
3. Ensure the backend is returning a valid JWT token
4. Clear localStorage and try again

### Build Issues

If the build fails:

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Ensure Node.js version is 16+

## API Response Formats

The frontend expects these response formats from the backend:

**Package:**
```json
{
  "metadata": {
    "Name": "package-name",
    "Version": "1.0.0",
    "ID": "package-id"
  },
  "data": {
    "Content": "base64-encoded-zip",
    "URL": "https://github.com/...",
    "JSProgram": "console.log('hello');"
  }
}
```

**Authentication Token:**
```json
"bearer eyJhbGciOiJIUzI1NiIs..."
```

See `src/lib/api.ts` for complete type definitions.

## Security Notes

- Never commit your `.env` file
- Always use HTTPS in production
- Implement proper CORS policies on backend
- Validate all user inputs
- Keep dependencies updated

## License

[Your License Here]

## Support

For issues or questions:
1. Check the [GitHub Issues](your-repo-issues-url)
2. Review backend API documentation
3. Contact the development team

---

Built with ❤️ for ECE 461 - Fall 2024
