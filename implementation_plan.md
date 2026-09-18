# NIT Calicut (NITC) Hostel Management & Grievance System - Implementation Plan

Transform the application into the **NITC Hostel Management System** ([nitchostel.in](https://nitchostel.in/)) tailored specifically to the National Institute of Technology Calicut (NITC) campus ecosystem.

---

## 1. NIT Calicut (NITC) System Specifications

### 1.1 Specific NITC Hostels & Blocks
- **Men's Hostels**:
  - A Hostel, B Hostel, C Hostel, D Hostel, E Hostel, F Hostel, G Hostel
  - PG Hostel 1 (PG-1), PG Hostel 2 (PG-2)
  - Mega Hostel (Block 1, Block 2, Block 3)
  - MBA Hostel & International Hostel (IH)
- **Ladies Hostels (LH)**:
  - LH-A Block, LH-B Block, LH-C Block
  - Mega Ladies Hostel (MLH)

### 1.2 NITC Messes & Dining Halls
- Mess A (South Indian), Mess B (North Indian), Mess C (Veg Special), Mess D, Mess E, Mess F, Mess G, Mega Mess (MH), and LH Mess.

### 1.3 NITC Grievance Categories
- **Hostel Electrical** (Geysers, fans, tube lights, MCB tripping, room switchboard)
- **Hostel Plumbing & Sanitation** (Taps, flush tanks, washrooms, pipeline leakage, drainage)
- **Carpentry & Room Furniture** (Beds, study tables, chairs, door locks, cupboard latches, window panes)
- **Campus & Hostel Wi-Fi / LAN** (Room LAN ports, corridor access points, hostel switch connectivity)
- **Mess & Food Quality** (Meal hygiene, taste, drinking water coolers, dining hall sanitation)
- **Hostel Cleanliness & Housekeeping** (Room cleaning, corridor sweeping, washroom disinfection, waste disposal)
- **Hostel Civil Maintenance** (Wall seepage, ceiling plaster, painting, window mesh, balcony railing)
- **Pest Control & Safety** (Mosquito fogging, pest treatment, stray animal prevention)

---

## 2. Proposed Changes

### Component 1: Database & Backend Models (`/server`)

#### [MODIFY] [User.js](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/server/src/models/User.js)
- Add NITC specific fields:
  - `hostelBlock`: String (e.g. `Mega Hostel Block 1`, `A Hostel`, `LH-A`)
  - `roomNumber`: String (e.g. `MH-304`, `A-112`)
  - `messName`: String (e.g. `Mega Mess`, `Mess A`)
  - `role`: `student`, `admin` (Chief Warden / Hostel Office), `staff` (Hostel Caretaker / Warden / Maintenance Lead)

#### [MODIFY] [Complaint.js](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/server/src/models/Complaint.js)
- Add NITC Hostel fields:
  - `hostelBlock`: String, required for hostel issues
  - `roomNumber`: String
  - `messName`: String (for dining complaints)
  - Indexing by `hostelBlock` for fast caretaker and warden filtering

#### [MODIFY] [seed.js](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/server/src/seed.js)
- Seed authentic NITC data:
  - **Departments**: Hostel Electrical Maintenance, Hostel Plumbing Cell, Hostel Carpentry & Civil Works, Campus Network Centre (CNC - Wi-Fi), Hostel Mess & Catering Committee, Housekeeping & Sanitation Division, Chief Warden Office (CWO).
  - **Categories**: NITC Hostel specific categories with default department mappings.
  - **Users**:
    - Chief Warden (Admin): `chiefwarden@nitc.ac.in` / `Admin@123`
    - Caretaker (Mega Hostel): `caretaker.mh@nitc.ac.in` / `Staff@123`
    - Caretaker (LH): `caretaker.lh@nitc.ac.in` / `Staff@123`
    - Student 1: `rahul_b210456cs@nitc.ac.in` (Mega Hostel MH-304) / `Student@123`
    - Student 2: `anjali_b220123ee@nitc.ac.in` (Mega Ladies Hostel MLH-215) / `Student@123`
    - Student 3: `karthik_m230011me@nitc.ac.in` (PG Hostel PG-108) / `Student@123`
  - **Realistic Sample Complaints** in A Hostel, Mega Hostel, LH, MLH across all statuses with activity logs.

---

### Component 2: Frontend UI & NITC Branding (`/client`)

#### [MODIFY] [index.html](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/client/index.html)
- Brand as **NITC Hostel Management & Grievance System | National Institute of Technology Calicut**.
- Official NITC navy & amber theme styling.

#### [MODIFY] [Navbar.jsx](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/client/src/components/common/Navbar.jsx) & [DemoBanner.jsx](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/client/src/components/common/DemoBanner.jsx) & [Footer.jsx](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/client/src/components/common/Footer.jsx)
- Display official NIT Calicut (NITC) Hostel Office branding, NITC crest icon, Chief Warden Office details, and updated 1-click credentials for NITC accounts (`Chief Warden`, `Hostel Caretaker`, `NITC Student`).

#### [MODIFY] [SubmitComplaint.jsx](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/client/src/pages/student/SubmitComplaint.jsx)
- Add Hostel Block dropdown with all NITC Hostels (Mega Hostel 1/2/3, A, B, C, D, E, F, G, PG-1, PG-2, LH-A/B/C, MLH, MBA, IH).
- Add Room Number input and Mess selection.
- Auto-fill student's assigned hostel & room.

#### [MODIFY] [AllComplaints.jsx](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/client/src/pages/admin/AllComplaints.jsx) & [AdminDashboard.jsx](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/client/src/pages/admin/AdminDashboard.jsx)
- Add **Hostel Block Filter** (filter complaints by specific NITC Hostel e.g. Mega Hostel, LH, etc.).
- Hostel-wise analytics graph and load breakdown across NITC hostels.

#### [MODIFY] [Home.jsx](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/client/src/pages/Home.jsx)
- Showcase NIT Calicut Hostel ecosystem (15+ Hostels, 6000+ Resident Students, Mess Management, Maintenance Desks).

#### [MODIFY] [README.md](file:///c:/Users/keert/OneDrive/Documents/Desktop/complaint_mangement/README.md)
- Update with NITC specific documentation and instructions.

---

## 3. Verification Plan
- Re-run seed script with authentic NITC datasets.
- Test student ticket submission with specific NITC Hostel (e.g. Mega Hostel Block 2, Room MH-214) and verify it appears with hostel tagging.
- Test Admin filter by Hostel Block to isolate complaints for specific caretakers.
- Run automated E2E smoke tests with NITC credentials.
