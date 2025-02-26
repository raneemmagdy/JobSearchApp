# 📌 Job Search Platform

A comprehensive job search and hiring platform that connects job seekers with recruiters. This application allows users to apply for jobs, HRs to manage applications, and supports real-time messaging between HRs and candidates.

## 🚀 Features

-  **User Authentication** (JWT-based login for users and admins, Google OAuth signup/login)
-  **Job Posting & Management**
-  **Application Submission & Tracking**
-  **Real-time Messaging** (via Socket.IO)
-  **File Uploads** (using Multer & Cloudinary)
-  **Excel Report Generation** (ExcelJS + Cloudinary)
-  **Admin Dashboard for Job Management**
-  **Automated Cleanup** (Mongoose hooks to delete related data)
-  **GraphQL API Support** (for fetching users and companies)

---

## ⚙️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB 🍃 (Mongoose ODM)
- **Real-time Communication:** Socket.IO
- **File Storage:** Cloudinary ☁️+ Multer
- **Security:** JWT Authentication, Bcrypt for password hashing
- **Excel Handling:** ExcelJS
- **GraphQL:** Apollo Server + Express

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/raneemmagdy/JobSearchApp.git
   cd JobSearchApp
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Create a `.env` file** and add the following environment variables:
   ```sh
   PORT=3000
   MONGO_DB_URI=your_mongodb_connection_string
   PREFIX_FOR_USER=Bearer
   PREFIX_FOR_ADMIN=Admin
   ACCESS_JWT_SECRET_USER=your_secret_key
   ACCESS_JWT_SECRET_ADMIN=your_secret_key
   REFRESH_JWT_SECRET_USER=your_refresh_secret
   REFRESH_JWT_SECRET_ADMIN=your_refresh_secret
   SALT_ROUND=12
   PASSWORD_FOR_EMAIL_SENDER=your_email_password
   EMAIL_SENDER=your_email@example.com
   CLIENT_ID=your_google_client_id
   SECRET_KEY_PHONE=your_phone_secret_key
   CLOUD_NAME=your_cloudinary_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   ```
4. **Start the server:**
   ```sh
   npm run dev
   ```

---

## 📌 API Endpoints

### 🔑 Authentication
- `POST /users/signup` - Register a new user
- `POST /users/signin` - Login and get a JWT token
- `POST /users/signUpWithGmail` - Register with Google
- `POST /users/signInWithGmail` - Login with Google

### 👤 Users
- `PATCH /users/updateProfile` - Update user profile
- `POST /users/uploadProfilePic` - Upload a profile picture
- `POST /users/uploadCoverPic` - Upload a cover picture
- `DELETE /users/deleteProfilePic` - Delete profile picture
- `DELETE /users/deleteCoverPic` - Delete cover picture
- `DELETE /users/softDelete` - Soft delete user account

### 🏢 Companies
- `POST /companies/add` - Create a new company 
- `DELETE /companies/delete/:companyId` - Delete a company (Admin & Owner only)
- `PATCH /companies/update/:companyId` - Update company details (Owner only)
- `POST /companies/logo/:companyId` - Upload company logo
- `POST /companies/cover/:companyId` - Upload company cover picture
- `DELETE /companies/logo/:companyId` - Delete company logo
- `DELETE /companies/cover/:companyId` - Delete company cover
- `POST /companies/:companyId/HR/:userId` - Add HR to company (Only the company owner can add HRs)
- `DELETE /companies/:companyId/HR/:userId` - Remove HR from company (Only the company owner can remove HRs)

### 💼 Job Opportunities
- `POST /companies/:companyId/jobs` - Create a job post (Only the company owner or HRs can add jobs)
- `PUT /companies/:companyId/jobs/:jobId` - update a job post (Owner Only)
- `DELETE /companies/:companyId/jobs/:jobId` - Delete a job post (any HR in company only)

### 📩 Applications
- `POST /applications/:jobId` - Apply for a job (User Only)
- `PATCH /applications/:applicationId` - Process a job application (HR who Create Job Post)


### 📊 Reports
- `GET /applications/:companyId/:date` - Generate an Excel sheet for job applications

### 🔧 Admin Routes
- `PATCH /admin/user/banOrUnban/:userId` - Ban or unban a user
- `PATCH /admin/company/banOrUnban/:companyId` - Ban or unban a company
- `PATCH /admin/company/approve/:companyId` - Approve a company

### 💬 Real-time Chat
- `GET /chats/:userId` - HRs fetch a chat
- **WebSockets:** Messages are sent and received via Socket.IO events (HR Can start Chat only)

---

##  GraphQL API

GraphQL is available at:
**`http://localhost:3000/graphql`**

### Queries:
- `getAllUsers` - Fetch all users
- `getUserById(userId: ID!)` - Fetch a specific user
- `getAllCompanies` - Fetch all companies
- `getCompanyById(CompanyId: ID!)` - Fetch a specific company
- 
⚡ _For a full list of endpoints and usage examples, check out the [Postman API Documentation](https://documenter.getpostman.com/view/26311189/2sAYdeMs9o)._ 


---

## 🌐 Live Deployment
[Job Search Platform](https://job-search-app-six.vercel.app/)

---


## 👩‍💻 Author
Developed by [Raneem Elmahdy](https://github.com/raneemmagdy).

