# 🗄️ Database Setup Guide for Budgee Backend

## Step 1: Install PostgreSQL

### **Windows Installation**

1. **Download PostgreSQL**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the latest version (14 or higher)
   - Or download directly: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Run the Installer**
   - Double-click the downloaded `.exe` file
   - Click "Next" through the setup wizard
   - **Important**: Remember the password you set for the `postgres` user!
   - Default port: `5432` (keep this)
   - Install all components (including pgAdmin)

3. **Verify Installation**
   ```powershell
   # Open PowerShell and check version
   psql --version
   ```

   If not found, add PostgreSQL to PATH:
   - Default location: `C:\Program Files\PostgreSQL\15\bin`
   - Add to System Environment Variables → PATH

---

## Step 2: Create the Database

### **Method A: Using pgAdmin (GUI - Easiest)**

1. **Open pgAdmin 4** (installed with PostgreSQL)
   - Start Menu → pgAdmin 4

2. **Connect to Server**
   - Expand "Servers" in left sidebar
   - Click "PostgreSQL 15" (or your version)
   - Enter the password you set during installation

3. **Create Database**
   - Right-click "Databases"
   - Click "Create" → "Database..."
   - Enter name: `budgee_dev`
   - Click "Save"

4. **Run Schema**
   - Right-click on `budgee_dev` database
   - Select "Query Tool"
   - Click "Open File" (folder icon)
   - Navigate to: `C:\Users\HP\Budgee\backend\database\schema.sql`
   - Click "Execute" (▶ play button) or press F5
   - You should see "Query returned successfully"

**✅ Done! Your database is ready.**

---

### **Method B: Using PowerShell (Command Line)**

1. **Open PowerShell as Administrator**

2. **Connect to PostgreSQL**
   ```powershell
   # Navigate to PostgreSQL bin directory
   cd "C:\Program Files\PostgreSQL\15\bin"
   
   # Connect to PostgreSQL
   .\psql -U postgres
   # Enter your password when prompted
   ```

3. **Create Database**
   ```sql
   -- Create the database
   CREATE DATABASE budgee_dev;
   
   -- List databases to verify
   \l
   
   -- Exit psql
   \q
   ```

4. **Run Schema File**
   ```powershell
   # Still in PostgreSQL bin directory
   .\psql -U postgres -d budgee_dev -f "C:\Users\HP\Budgee\backend\database\schema.sql"
   ```

**✅ Done! Your database is ready.**

---

### **Method C: Using SQL Shell (Alternative)**

1. **Open SQL Shell (psql)**
   - Start Menu → SQL Shell (psql)

2. **Press Enter for defaults** until prompted for password
   - Server: localhost (press Enter)
   - Database: postgres (press Enter)
   - Port: 5432 (press Enter)
   - Username: postgres (press Enter)
   - Password: [enter your password]

3. **Create Database**
   ```sql
   CREATE DATABASE budgee_dev;
   \c budgee_dev
   ```

4. **Run Schema**
   ```sql
   \i 'C:/Users/HP/Budgee/backend/database/schema.sql'
   ```
   Note: Use forward slashes (/) in path

**✅ Done! Your database is ready.**

---

## Step 3: Set Up Environment File

### **1. Copy the Example File**

In PowerShell (in your backend directory):
```powershell
cd C:\Users\HP\Budgee\backend
Copy-Item .env.example .env
```

Or manually:
- Copy `backend\.env.example`
- Paste in same folder
- Rename to `.env` (remove the .example)

---

### **2. Edit .env File**

Open `backend\.env` in your code editor and update these values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=budgee_dev
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE    # ⚠️ CHANGE THIS!

# JWT Secrets (generate new ones for production)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

---

### **3. Generate Secure JWT Secrets**

**Option A: Using Node.js** (Recommended)
```powershell
# In backend directory
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste as your `JWT_SECRET`

Run again for `JWT_REFRESH_SECRET`:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option B: Using PowerShell**
```powershell
# Generate random string
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

---

### **4. Final .env File Example**

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=budgee_dev
DB_USER=postgres
DB_PASSWORD=mySecurePassword123    # Your actual password

# JWT Secrets (example - generate your own!)
JWT_SECRET=a3f2b9e8c1d5a6f4e9b2c8d1a5f3e7b9c2d6a8f1e4b7c9d2a6f3e8b1c5d9a2f6
JWT_REFRESH_SECRET=b7c9d2a6f3e8b1c5d9a2f6e3a1d5b8c2f7a9d4e6b1c8a3f5d2e7b9c4a6d1f8
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**⚠️ Important**: Never commit `.env` file to Git! It's already in `.gitignore`.

---

## Step 4: Verify Database Setup

### **Check if database was created successfully**

```powershell
# Connect to PostgreSQL
cd "C:\Program Files\PostgreSQL\15\bin"
.\psql -U postgres -d budgee_dev

# Inside psql, run:
\dt        # List all tables
\q         # Exit
```

**Expected Output**:
```
List of relations
 Schema |     Name       | Type  |  Owner
--------+----------------+-------+----------
 public | accounts       | table | postgres
 public | activity_logs  | table | postgres
 public | categories     | table | postgres
 public | otps          | table | postgres
 public | plans         | table | postgres
 public | transactions  | table | postgres
 public | users         | table | postgres
```

### **Check if plans were seeded**

```powershell
.\psql -U postgres -d budgee_dev -c "SELECT * FROM plans;"
```

**Expected Output**:
```
 id |  name   | price | max_wallets | max_accounts | ai_enabled | ads_enabled
----+---------+-------+-------------+--------------+------------+-------------
  1 | Free    |  0.00 |           1 |            1 | f          | t
  2 | Basic   |299.00 |           3 |            3 | f          | f
  3 | Premium |499.00 |           5 |            8 | t          | f
```

**✅ If you see this, your database is perfectly set up!**

---

## Step 5: Start the Backend

```powershell
cd C:\Users\HP\Budgee\backend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

**Expected Output**:
```
==================================================
🚀 Budgee Backend Server Started
==================================================
📍 Environment: development
🌐 Server URL: http://localhost:5000
📡 API Endpoint: http://localhost:5000/api
❤️  Health Check: http://localhost:5000/api/health
==================================================
✅ Database connection has been established successfully.
```

---

## 🧪 Test Your Setup

### **1. Health Check**
Open browser: http://localhost:5000/api/health

**Expected**:
```json
{
  "success": true,
  "message": "Budgee API is running",
  "timestamp": "2025-10-13T..."
}
```

### **2. Test Signup (PowerShell)**
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

**Expected**: User created with token

---

## ⚠️ Common Issues & Solutions

### **Issue 1: "psql: command not found"**

**Solution**: Add PostgreSQL to PATH
1. Open System Environment Variables
2. Edit PATH variable
3. Add: `C:\Program Files\PostgreSQL\15\bin`
4. Restart PowerShell

---

### **Issue 2: "password authentication failed"**

**Solution**: Check your password
- Make sure `.env` has the correct password
- The password is the one you set during PostgreSQL installation
- Try resetting password:
  ```powershell
  # As Administrator
  cd "C:\Program Files\PostgreSQL\15\bin"
  .\psql -U postgres
  ALTER USER postgres WITH PASSWORD 'newpassword';
  ```

---

### **Issue 3: "database budgee_dev does not exist"**

**Solution**: Create the database
```powershell
cd "C:\Program Files\PostgreSQL\15\bin"
.\psql -U postgres -c "CREATE DATABASE budgee_dev;"
```

---

### **Issue 4: "Unable to connect to database"**

**Solution**: Check if PostgreSQL is running
1. Open Services (services.msc)
2. Find "postgresql-x64-15" (or your version)
3. Make sure it's "Running"
4. If not, right-click → Start

---

### **Issue 5: "Port 5000 already in use"**

**Solution**: Change port in `.env`
```env
PORT=5001
```

---

## 📝 Quick Reference

### **Important File Locations**

```
PostgreSQL:
- Program: C:\Program Files\PostgreSQL\15\
- Data: C:\Program Files\PostgreSQL\15\data\

Budgee Backend:
- Backend: C:\Users\HP\Budgee\backend\
- Schema: C:\Users\HP\Budgee\backend\database\schema.sql
- .env: C:\Users\HP\Budgee\backend\.env
```

### **Important Credentials**

```
Database:
- Host: localhost
- Port: 5432
- Database: budgee_dev
- User: postgres
- Password: [the one you set during installation]

API:
- URL: http://localhost:5000/api
- Health: http://localhost:5000/api/health
```

---

## ✅ Setup Checklist

- [ ] PostgreSQL installed
- [ ] Database `budgee_dev` created
- [ ] Schema file executed successfully
- [ ] 7 tables created
- [ ] 3 plans seeded
- [ ] `.env` file created
- [ ] Database credentials updated in `.env`
- [ ] JWT secrets generated
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts successfully
- [ ] Health check works
- [ ] Can signup test user

---

## 🎉 Success!

If you completed all steps and see:
- ✅ 7 tables in database
- ✅ 3 plans seeded
- ✅ Server running on port 5000
- ✅ Health check returns success

**Your Budgee backend is ready to use!** 🚀

---

## 📞 Need More Help?

1. Check PostgreSQL is running: Services → postgresql-x64-15
2. Verify credentials: Try connecting with pgAdmin
3. Check logs: Look at terminal output for errors
4. Review main README.md for detailed troubleshooting

---

**Happy Coding! 💰✨**
