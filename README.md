# Campus Commute

Create a modern, responsive web application called “College Bus Tracking & Information System” for a college.

Project Goal

The system should help students easily check college bus routes, bus timings, current bus status, and basic driver/bus information. The website should be simple enough for a college-level software project but should look professional.

User Roles

Create two types of users:

Student

Admin

Student Features

Create a student dashboard with:

View all available college buses

Search buses by bus number or route

View bus route and stops

View scheduled departure and arrival times

View current bus status:

On Time

Delayed

Not Started

Completed

View estimated arrival time

View driver name and contact number

View bus capacity/status

View important announcements

View today's bus schedule

View a simple map showing the selected bus route

Admin Features

Create an admin dashboard where the admin can:

Add new buses

Edit bus details

Delete buses

Add/edit/delete routes

Add and manage bus stops

Update bus status

Update estimated arrival time

Add driver details

Update bus schedules

Post announcements

View registered students

Pages Required

Landing Page

College Bus Tracking & Information System title

Short description

“Student Login” button

“Admin Login” button

Attractive college/bus-themed design

Student Login Page

Student ID/email

Password

Login button

Student Dashboard

Welcome message

Today's buses

Bus status cards

Search bar

Quick access to routes, schedules and announcements

Bus Details Page

Bus number

Route name

Driver name

Driver contact

Current status

Estimated arrival time

List of stops

Timings

Map

Routes Page

Display all routes

Route name

Bus number

Starting point

Destination

Stops

Schedule Page

Daily bus schedule

Morning and evening timings

Bus number

Route

Departure time

Arrival time

Announcements Page

Bus-related announcements

Delays

Route changes

Holiday notifications

Admin Dashboard

Total buses

Total routes

Total students

Active buses

Recent updates

Management sections

UI/UX Design

Use a clean modern college-style interface.

Make it fully responsive for mobile, tablet and desktop.

Use cards, tables, buttons and icons.

Add a sidebar navigation for dashboards.

Use smooth hover effects and subtle animations.

Keep the design simple and not overly complicated.

Use a professional blue/white theme.

Make status indicators visually clear.

Use readable fonts and proper spacing.

Map

Add a map section for bus tracking. For the prototype, use Leaflet + OpenStreetMap or a suitable free map solution. Display a sample college location, bus route, bus stops and a bus marker.

The map does not need real GPS tracking for the first version. Use mock/sample bus locations and allow the admin to update the bus location/status.

Technology

Use:

React

JavaScript

HTML/CSS

Tailwind CSS

Node.js if backend is required

MySQL or Supabase for database

Leaflet/OpenStreetMap for maps

Database

Create suitable database tables for:

Students

Admins

Buses

Drivers

Routes

Bus Stops

Schedules

Bus Status

Announcements

Important

Provide realistic sample data so the website works immediately.

Include at least 5 sample buses and multiple routes/stops.

Include sample student and admin login credentials for testing.

Add form validation.

Show success/error messages.

Make all navigation buttons functional.

Do not leave empty placeholder pages.

Keep the project suitable for a college-level mini project.

Organize the code into reusable components.

Make the final website polished and presentation-ready.

Project Name

College Bus Tracking & Information System

Short Problem Statement

“Students often face difficulty in knowing college bus timings, routes, delays and current bus status. The proposed system provides a centralized web platform to access bus schedules, routes, stop details and real-time-like bus status information, making college transportation information easier to access.”

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/382c53b3-99fd-479d-af50-ba251b51e0aa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
