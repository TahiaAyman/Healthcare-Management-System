## Admin Credentials

Admin Email: admin@medicare.com
Admin Password: Admin@123

# MediCare Connect

MediCare Connect is a modern Hospital Appointment & Healthcare Management System. It connects patients, doctors, and administrators through a centralized online platform where patients can find doctors, book appointments, manage payments, and give reviews.

## Live Links

Live Site Link:
Client Repository:
Server Repository:

## Project Purpose

Traditional healthcare appointment systems often depend on manual booking, long waiting time, and poor communication. MediCare Connect was developed to digitize doctor appointment booking, improve doctor schedule management, manage patient records securely, and provide a better healthcare experience.

## Technology Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Framer Motion
* Recharts
* Lucide React Icons
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Stripe

### Authentication

* Email and password login
* Google login
* JWT authentication
* Role-based authorization

## User Roles

### Patient

* Create account
* Search doctors
* Book appointments
* Make payments
* View appointment history
* Review doctors

### Doctor

* Create professional profile
* Manage schedules
* Accept or reject appointments
* Update consultation status
* Manage prescriptions

### Admin

* Manage users
* Verify doctors
* Manage appointments
* Monitor payments
* View analytics and reports

## Main Features

* Responsive healthcare-themed UI
* Secure registration and login
* Strong password validation
* JWT-based authentication
* Protected private routes
* Role-based dashboard access
* Doctor search by name and specialization
* Doctor details page
* Appointment booking system
* Payment system with payment status stored in database
* Patient review system
* Prescription management
* Custom loading page
* Custom 404 error page
* Toast/SweetAlert notifications
* Dynamic page titles
* Dark/light theme toggle
* Dashboard charts using Recharts
* Framer Motion animations

## Pages

### Public Pages

* Home
* Find Doctors
* Doctor Details
* About Us
* Contact Us
* Login
* Register

### Private Pages

* Dashboard
* Profile
* Patient Dashboard
* Doctor Dashboard
* Admin Dashboard

## Dashboard Features

### Patient Dashboard

* Dashboard overview
* Upcoming appointments
* Appointment history
* Payment history
* My reviews
* Profile management

### Doctor Dashboard

* Dashboard overview
* Manage schedule
* Appointment requests
* Prescription management
* Profile management

### Admin Dashboard

* Dashboard overview
* Manage users
* Manage doctors
* Manage appointments
* Payment management
* Analytics

## Database Collections

### Users

* name
* email
* role
* photo
* phone
* gender
* createdAt
* status

### Doctors

* doctorName
* specialization
* qualifications
* experience
* consultationFee
* hospitalName
* profileImage
* availableDays
* availableSlots
* verificationStatus

### Appointments

* patientId
* doctorId
* appointmentDate
* appointmentTime
* appointmentStatus
* symptoms
* paymentStatus

### Reviews

* patientId
* doctorId
* rating
* reviewText
* createdAt

### Payments

* appointmentId
* patientId
* doctorId
* amount
* transactionId
* paymentDate

### Prescriptions

* doctorId
* patientId
* appointmentId
* diagnosis
* medications
* notes
* createdAt


## Challenge Features

* Advanced doctor search by name and specialization
* Sorting doctors by consultation fee, experience, and rating
* JWT token verification for private APIs
* Role-based authorization
* Pagination on Find Doctors page

## Run Locally

### Client

cd client
npm install
npm run dev


### Server

cd server
npm install
npm run dev


## Design Inspiration

* Apollo 24/7
* Novant Health
* US News Health

## Deployment Notes

The deployed project is configured to avoid CORS errors, 404 errors, and 504 errors. Private routes remain functional after page refresh, and logged-in users stay authenticated after reload.

## Conclusion

MediCare Connect is a full-stack healthcare management system built with Next.js, Express.js, MongoDB, JWT, and Stripe. It focuses on secure authentication, role-based dashboards, doctor appointment booking, payment handling, reviews, prescriptions, analytics, and responsive healthcare UI.
