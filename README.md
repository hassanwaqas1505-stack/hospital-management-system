# Hospital Management System

A modern, responsive, front-end Hospital Management System built with React and Vite. It provides role-based dashboards and tools to manage patients, doctors, appointments, and billing.

## Features

### 1. Role-Based Login
- Admin, Doctor, and Receptionist roles.
- Role-based page access and permissions.
- Login and logout functionality.

### 2. Dashboard
- Hospital statistics and summary cards.
- Appointment and patient information.
- Charts and visual reports.
- Role-specific dashboard information.

### 3. Patient Management
- Add, view, edit, and delete patient records.
- Search patients.
- Manage patient status.
- View patient information.

### 4. Doctor Management
- Add, view, edit, and delete doctor records (Admin).
- Search and filter doctors by specialization.
- Manage doctor availability.
- Receptionist can view doctor information.

### 5. Appointment Management
- Book and manage appointments.
- Assign doctors to appointments.
- Update appointment status.
- Search and view appointment records.
- Doctors can manage the status of their own appointments.

### 6. Billing Management
- Create and manage invoices.
- Track paid and unpaid invoices.
- Update payment status.
- View and print invoices.
- Admin has full billing management permissions; Receptionist has operational billing access.

## Technologies Used

- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Lucide React
- Recharts
- Local Storage

## Installation and Setup

Follow these steps to run the project locally.

**1. Clone the repository**

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

**2. Open the project folder**

```bash
cd "Hospital Management System"
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the local URL**

Open the URL shown in your terminal, usually:

```text
http://localhost:5173
```

## Demo Login Credentials

**Admin**
- Email: `admin@medicare.com`
- Password: `Admin@123`

**Receptionist**
- Email: `reception@medicare.com`
- Password: `Reception@123`

**Doctor:** Create a doctor account through the Admin's Doctors section.

*These are demo credentials for this project only.*

## Screenshots

Add your project screenshots in the `public/screenshots/` folder.

### Dashboard
![Dashboard](public/screenshots/dashboard.png)

### Patients Management
![Patients](public/screenshots/patients.png)

### Doctors Management
![Doctors](public/screenshots/doctors.png)

### Appointments Management
![Appointments](public/screenshots/appointments.png)

### Billing Management
![Billing](public/screenshots/billing.png)

## Data Storage

This project uses browser Local Storage to store demo data, including patients, doctors, appointments, invoices, and login information.

No backend server or external database is connected.

**Note:** This is an internship/demo front-end project. Local Storage authentication is not suitable for production use. A production system would require a secure backend, database, password hashing, and server-side authorization.

## Future Improvements

- Backend API integration.
- Database integration.
- Secure authentication and authorization.
- Advanced reporting and analytics.
- CSV/PDF export.
- Additional hospital modules.

## Project Purpose

Developed as an internship project to demonstrate front-end development skills, React component architecture, routing, role-based interfaces, CRUD operations, and browser-based data management.

---

**Developed by:** Hassan Mughal  
**Project:** Hospital Management System