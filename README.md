# 🦴 PawHaven - Backend API Server

The robust, secure, and production-ready RESTful API engine powering the PawHaven Pet Adoption Platform. Built with Node.js, Express, and MongoDB, this backend handles secure authentication via JWT cookies, manages complex data pipelines, and enforces critical business logic.

---

## 📋 Project Purpose

This server manages user identity lifecycles, full relational CRUD pipelines for pet listings, and the operational workflows of adoption applications. It is strictly structured to block unauthorized actions (e.g., stopping pet owners from requesting adoptions on their own pets) and coordinates data integrity using specific MongoDB data queries.

---

## 🔗 Live Deployment & Links

- **Live API Server URL:** `[Insert your live Render / Vercel server deployment link here]`
- **Client-Side UI Repository:** `[Insert your GitHub Client repository link here]`

---

## ✨ Features (Assignment Core Requirements)

- **Secure JWT Authentication:** Implements JSON Web Tokens securely transmitted via `HTTPOnly` cookies to guard private database endpoints and preserve active user session instances during route reloads.
- **Advanced Engine Queries:** Handles dynamic client-side filtering and searching efficiently at the database level by employing MongoDB `$regex` (for name-matching queries) and `$in` (for broad multi-species categorization) operators.
- **Strict Operational Flow Logic:** Integrates a conditional validation block preventing owners from applying to adopt their own listed pets.
- **Atomic Adoption Lock:** Ensures that if multiple adoption queries exist for a single pet profile, approving one request automatically flips the pet's state to "Adopted" and prevents any further requests from proceeding.
- **Secure Route Middleware:** Enforces validation layers for JSON payloads and route verification, rendering clean JSON error codes instead of throwing native application crashes.

---

## 🛠️ Tech Stack & NPM Packages Used

- **Runtime Environment:** Node.js
- **Application Framework:** Express.js
- **Database Management:** MongoDB via Mongoose ODM
- **Authentication & Security:** `jsonwebtoken` (JWT), `cookie-parser`
- **Cross-Origin Configuration:** `cors`
- **Environment Management:** `dotenv`

---

## ⚙️ Environment Variables Setup

Secure your MongoDB credentials and configuration tokens. Create a `.env` file in the root directory of your backend folder:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/pawhaven
JWT_SECRET=your_super_secure_random_hex_long_jwt_secret_phrase
CLIENT_URL=http://localhost:3000
NODE_ENV=development
🚀 Local Installation & Set UpFollow these steps to spin up the local development database engine:1. Clone the repositoryBashgit clone [your-backend-repository-url]
cd [backend-folder-name]
2. Install dependenciesBashnpm install
3. Run the development serverBash# Runs the server with automatic hot reloading (nodemon)
npm run dev

# Runs the production entry script
npm start
The API server should now be live and accepting connections on http://localhost:5000.🛣️ API Endpoint ArchitectureMethodEndpointDescriptionToken ProtectedPOST/api/auth/jwtSigns token & issues HTTPOnly CookieNoPOST/api/auth/logoutClears local client authentication cookiesNoGET/api/petsRetrieves all listings (Supports search & species)NoPOST/api/petsStores new pet profile listing into DBYes (Private)PUT/api/pets/:idModifies dynamic attributes of a specific petYes (Owner Only)DELETE/api/pets/:idPermanently deletes a managed pet listingYes (Owner Only)POST/api/adoptionsSubmits a new "pending" adoption requestYes (Adopter)PATCH/api/adoptions/:idHandles approval/rejection state updatesYes (Owner Only)GET/api/requestsFetches adoption requests matching active userYes (Private)
```
