# 📚 Assignment Submission Portal

A role-based web application built with **Next.js**, designed to manage student assignment submissions and instructor feedback, including a live submission status chart.

---

## Github and Live Link


1. **Github Repo Link**:
    ```bash
    https://github.com/fardin072/Final-PH-Assignment-Portal.git
    ```


---

## 👥 User Roles & Capabilities

### 🧑‍🏫 Instructor
- Create assignments (title, description, deadline)
- View all student submissions
- Provide feedback and update status: ✅ Accepted, ❌ Rejected, ⏳ Pending
- View a dynamic pie chart showing submission statuses

### 🧑‍🎓 Student
- View available assignments
- Submit assignments (submission URL + note)
- View submitted assignments with status and feedback

---

## 🔐 Authentication & Access
- Auth handled with **NextAuth.js**
- Email & password registration/login
- Role-based access (Instructor / Student)
- Protected routes for different user types

---

## 🧩 Features
- 📝 Assignment creation (Instructors only)
- 📃 Assignment list (for all users)
- 📤 Student submission form
- 🧾 Instructor review & feedback panel
- 📊 Pie chart showing assignment status breakdown (Pending, Accepted, Rejected)

---

## 🛠️ Tech Stack

| Technology     | Purpose                           |
|----------------|-----------------------------------|
| Next.js (App Router) | Framework                   |
| Tailwind CSS   | UI Styling                        |
| NextAuth.js    | Authentication                    |
| MongoDB        | Database (assumed if backend used) |
| Recharts / Chart.js | Data Visualization (Pie Chart) |

---

