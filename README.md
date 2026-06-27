# songstash

A private backlog system for audience-submitted song requests, organized into a manageable practice queue for creators.

This project uses the Neon Data API for storage. No separate backend server is required.

---

## Features

* Audience can submit song requests without login
* Admin dashboard for managing the request queue
* Authentication-based access control
* Minimal architecture using Neon as the data layer

---

## Setup

### 1. Create a Neon database

Create a new project in Neon and set up your database.

### 2. Enable authentication

* Enable authentication in your project
* Temporarily allow signups during setup

### 3. Configure environment variables

Create a `.env` file in the root directory that follows `.env.example`

---

### 4. Create the initial admin user

```bash
cd utils
./register-admin.sh
```

This script creates the first admin account in the system.

---

### 5. Disable public signups

After the admin user is created, disable public signups in your authentication settings.

---

### 6. Promote user to admin

Promote user to admin in your authentication settings.

---

### 7. Create database schema

Run the included SQL script to set up:

* Tables
* Indexes
* Row-level security policies

---

## Running the project

### Local or containerized setup

```bash
docker compose up
```

---

## Routes

* `/` – Public page for submitting song requests
* `/admin` – Admin dashboard for managing the queue (requires authentication)
