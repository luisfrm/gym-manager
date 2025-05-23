# Gym Management System

A full-stack web application for managing gym memberships, clients, and payments, built with **React**, **Node.js**, and **MongoDB**.

---

## 🚀 Features

- **User authentication and authorization** (JWT)
- **Client management** (CRUD, search, filter, pagination, sorting)
- **Payment management** (register, update, filter, statistics)
- **Membership expiration tracking** and notifications
- **Dashboard** with real-time key metrics and widgets
- **Responsive design** for mobile, tablet, and desktop
- **Role-based access control** (admin, employee)
- **Activity logs** for auditing actions
- **Optimized code splitting** with React.lazy and Suspense
- **Robust error handling** and user feedback (toasts, validation)
- **Modern UI** with Tailwind CSS and Shadcn UI
- **Dockerized** for easy deployment

---

## 🛠️ Tech Stack

### Frontend

- React + TypeScript
- React Router v6
- TanStack Query (React Query) for data fetching and caching
- Zustand for global state management
- Axios for API calls
- Tailwind CSS + Shadcn UI for styling and components
- Sonner for toast notifications
- Lucide React for icons

### Backend

- Node.js + Express + TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Zod for schema validation
- RESTful API design
- Docker support

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v22 or higher)
- MongoDB
- npm or bun
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**
2. **Install dependencies for both frontend and backend:**

   ```bash
   # Frontend
   cd frontend
   npm install
   # or
   bun install

   # Backend
   cd ../backend
   npm install
   # or
   bun install
   ```

3. **Set up environment variables:**

   **Frontend (.env):**
   ```
   VITE_API_URL=http://localhost:3000/v1
   ```

   **Backend (.env):**
   ```
   MONGODB_URI=mongodb://localhost:27017/gym-manager
   TOKEN_SECRET_JWT=""
   JWT_EXPIRATION_TIME=300
   INITIAL_ADMIN_EMAIL=
   INITIAL_ADMIN_PASSWORD=
   INITIAL_ADMIN_USERNAME=
   INITIAL_ADMIN_NAME=
   ```

4. **Start MongoDB service on your machine**

5. **Run the development servers:**

   **Frontend:**
   ```bash
   bun run start-frontend
   # or
   npm run start-frontend
   ```

   **Backend:**
   ```bash
   bun run start-backend
   # or
   npm run start-backend
   ```

6. **Access the application:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3000/v1](http://localhost:3000/v1)

---

## 🐳 Docker Deployment

### Backend

```bash
docker run -d \
  --name gym-manager-backend \
  --restart always \
  -e MONGODB_URI="mongodb://host.docker.internal:27017/gym-manager" \
  -e TOKEN_SECRET_JWT="" \
  -e JWT_EXPIRATION_TIME=3600 \
  -e INITIAL_ADMIN_EMAIL= \
  -e INITIAL_ADMIN_PASSWORD= \
  -e INITIAL_ADMIN_USERNAME= \
  -e INITIAL_ADMIN_NAME= \
  -p 3000:3000 \
  luisfrm/gym-manager-backend:latest
```

### Frontend

```bash
docker run -d \
  --name gym-manager-frontend \
  --restart always \
  -e VITE_API_URL=http://localhost:3000/api \
  -p 8080:80 \
  luisfrm/gym-manager-frontend:latest
```

---

## 📊 Key Modules & Functionality

- **Dashboard:** Real-time widgets for total clients, new clients, active clients, and monthly income, with code-splitting for performance.
- **Clients:** Add, update, delete, and search clients. Track expiration and see detailed client profiles.
- **Payments:** Register and update payments, filter by status, and view payment statistics. Duplicate references are validated and errors are shown clearly.
- **Authentication:** Secure login, token expiration handling, and protected routes.
- **Modals & Forms:** All forms use robust validation (Zod), and modals are optimized for accessibility and cleanup.
- **Error Handling:** All backend validation errors are returned with field-level details, and the frontend displays them contextually (e.g., duplicate payment reference).

---

## 🧑‍💻 Development Notes

- **Code splitting** is implemented for all main pages using `React.lazy` and `Suspense`.
- **Optimistic UI** and cache invalidation are handled with TanStack Query.
- **Consistent error messages** are shown for all validation and server errors.
- **Responsive grid layouts** for widgets and tables.
- **Reusable UI components** for forms, modals, and widgets.

---

## 📦 Project Structure

```
/frontend
  /src
    /components
    /pages
    /api
    /lib
    /hooks
    /styles
/backend
  /src
    /controllers
    /models
    /routes
    /services
    /schemas
    /utils
```

---

## 📝 License

This project is licensed under the MIT License.

---

## 🔄 Versioning

This project follows [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Major version (breaking changes)
git commit -m "feat!: change authentication system"
# or
git commit -m "feat: new auth system

BREAKING CHANGE: Authentication flow has been completely redesigned"

# Minor version (new features)
git commit -m "feat: add user profile page"

# Patch version (bug fixes and minor changes)
git commit -m "fix: resolve login error"
git commit -m "docs: update API documentation"
git commit -m "perf: optimize database queries"
```

### Commit Types

> **Note:** All commit types must be lowercase. `feat:` is valid, but `Feat:` or `FEAT:` are not.

- `feat`: New feature (triggers minor version)
- `fix`: Bug fix (triggers patch version)
- `docs`: Documentation changes (triggers patch version)
- `style`: Code style changes (triggers patch version)
- `refactor`: Code refactoring (triggers patch version)
- `test`: Adding or updating tests (triggers patch version)
- `chore`: Maintenance tasks (triggers patch version)
- `perf`: Performance improvements (triggers patch version)
- `ci`: CI configuration changes (triggers patch version)

### Breaking Changes

To indicate a breaking change that triggers a major version:
- Add `!` after the type/scope: `feat!` or `fix!`
- Or add a `BREAKING CHANGE:` footer in the commit message

### Release Workflow

The project follows a structured release workflow:

1. **Development Branch (`develop`)**:
   - All new features and fixes are pushed to `develop`
   - Each push triggers an automatic check for version changes
   - If changes are detected, a Release PR is created automatically

2. **Release Process**:
   - When pushing to `develop`, a PR is automatically created to `master`
   - The PR is named `Release vX.Y.Z` with the next version number
   - The PR includes all changes since the last release
   - A developer must review and approve the PR

3. **Production Branch (`master`)**:
   - Protected branch with strict rules:
     - Requires all checks to pass before merging
     - Requires at least one approving review
     - Must be up to date with the base branch
     - Enforces rules for repository administrators
   - When merged, automatically:
     - Updates the version in `package.json`
     - Creates a GitHub release
     - Builds and pushes Docker images

### Branch Protection Rules

The `master` branch is protected with the following rules:

1. **Required Status Checks**:
   - All workflows must pass:
     - Version Management
     - Build and Push Docker Images
   - Branch must be up to date before merging

2. **Pull Request Reviews**:
   - Requires at least one approving review
   - Dismisses stale pull request approvals when new commits are pushed
   - No restrictions on who can review

3. **Administrator Rules**:
   - Rules apply to repository administrators
   - Cannot bypass required checks

### Examples of Valid and Invalid Commits

```bash
# Valid commits
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update readme"

# Invalid commits (will fail validation)
git commit -m "Feat: add new feature"    # Wrong case
git commit -m "FEAT: add new feature"    # Wrong case
git commit -m "new feature"              # Missing type
git commit -m "added new feature"        # Missing type
```

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📧 Contact

For questions or support, contact [luisfrm1610@gmail.com](mailto:luisfrm1610@gmail.com)