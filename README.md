# QuickClick Admin Dashboard

React + TypeScript + Vite admin dashboard for the QuickClick hyperlocal delivery platform.

## Features
- Admin OTP login (JWT + refresh-token rotation)
- Dashboard metrics
- Users management (customers, retailers, delivery partners)
- Retailer approval & detail views
- Delivery partner approval & detail views with live location
- Order lifecycle management with manual delivery-partner assignment
- Category & coupon CRUD

## Setup

    npm install
    Copy-Item .env.example .env
    npm run dev

Dev server: http://localhost:5173

## Build

    npm run build
    npm run preview

## Environment variables
- `VITE_API_BASE_URL` — backend base, e.g. https://quickclick-backend-136h.onrender.com/api/v1
- `VITE_SOCKET_URL` — Socket.IO server URL

## Test accounts (seeded backend)
- Admin: +919888888888
- Customer: +919999999901
- Retailer: +918888888801
- Delivery: +917777777701

OTP appears in backend console (dev) or is sent via SMS (prod).