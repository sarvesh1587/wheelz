# 🚗 Wheelz - AI-Powered Car & Bike Rental Platform

![Wheelz Banner](https://placehold.co/1200x400/1a1a2e/f59e0b?text=Wheelz+%7C+Rent+the+Perfect+Ride)

## 🌟 Live Demo

**Frontend:** [https://wheelz-sand.vercel.app](https://wheelz-sand.vercel.app)

**Backend API:** [https://wheelz-api.onrender.com/api/health](https://wheelz-api.onrender.com/api/health)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing Credentials](#testing-credentials)
- [Folder Structure](#folder-structure)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🎯 Overview

**Wheelz** is a full-stack vehicle rental platform that allows users to rent cars and bikes across multiple Indian cities. The platform features AI-powered search, dynamic pricing, fraud detection, and a complete booking management system.

### Key Highlights

- 🤖 **AI Chatbot** - Zara, your virtual rental assistant
- 🔍 **Smart Search** - Natural language vehicle search
- 💰 **Dynamic Pricing** - Demand-based price adjustment
- 🛡️ **Fraud Detection** - Automated fraud flagging system
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Toggle between light and dark themes

## ✨ Features

### 👤 User Features
- **Authentication** - Register/Login with JWT tokens
- **Browse Vehicles** - Filter by category, city, price, fuel type
- **Vehicle Details** - View specs, features, and reviews
- **Booking System** - Select dates, add extras (GPS, insurance, driver)
- **Wishlist** - Save favorite vehicles
- **User Dashboard** - View booking history and stats
- **Profile Management** - Update personal info and preferences
- **Reviews & Ratings** - Rate and review rented vehicles

### 🤖 AI Features
- **Chatbot Assistant** - Get help with bookings, pricing, and policies
- **Smart Search** - Natural language queries like "SUV under ₹2000 in Mumbai"
- **Personalized Recommendations** - AI-curated vehicle suggestions

### 👑 Admin Features
- **Dashboard Analytics** - Revenue charts, booking stats, user metrics
- **Vehicle Management** - Add, edit, or remove vehicles
- **User Management** - View and manage user accounts
- **Fraud Alerts** - Monitor flagged bookings and users
- **Revenue Tracking** - Category-wise revenue breakdown

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Tailwind CSS | Styling |
| React Router v6 | Navigation |
| Axios | API Calls |
| Recharts | Admin Charts |
| React Hot Toast | Notifications |
| Heroicons | Icons |
| Framer Motion | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Nodemailer | Emails |
| Express Rate Limit | Security |

### DevOps & Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| MongoDB Atlas | Database Hosting |
| GitHub | Version Control |

## 📸 Screenshots

### Homepage
![Homepage](https://placehold.co/600x400/1a1a2e/f59e0b?text=Homepage)

### Vehicle Listing
![Vehicles](https://placehold.co/600x400/1a1a2e/f59e0b?text=Vehicle+Listing)

### Booking Page
![Booking](https://placehold.co/600x400/1a1a2e/f59e0b?text=Booking+Page)

### Admin Dashboard
![Admin](https://placehold.co/600x400/1a1a2e/f59e0b?text=Admin+Dashboard)

### AI Chatbot
![Chatbot](https://placehold.co/600x400/1a1a2e/f59e0b?text=AI+Chatbot)

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Clone the Repository

```bash
git clone https://github.com/sarvesh1587/wheelz.git
cd wheelz
