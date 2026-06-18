# Van Sales PWA - App Flow & Features

## Overview
The **Van Sales PWA** is a Progressive Web Application designed for delivery drivers and field sales representatives. It provides a mobile-first interface to manage daily delivery routes, track van inventory, handle direct sales, and submit operational expenses on the go. The app is built with Next.js, styled with UI5 Web Components, and syncs with a backend ERP system (simulated via a local mock server).

---

## Key Functionalities & User Stories

### 1. Dashboard & Navigation
**User Story**: As a driver, I want to see a summary of my day and easily navigate to different modules so that I can manage my tasks efficiently.
* **Flow**: Upon login, the user lands on the Dashboard.
* **Features**:
  * Quick metrics (e.g., total sales, pending deliveries).
  * Quick links to primary modules: Deliveries, Sales, Collections, and Expenses.
  * Mobile-optimized bottom navigation and desktop top navigation bar.

### 2. Deliveries Management
**User Story**: As a driver, I want to see a list of my assigned deliveries for the day and collect Proof of Delivery (POD) from customers.
* **Flow**: User navigates to the **Deliveries** tab.
* **Features**:
  * View a list of assigned orders with customer names, locations, and statuses (Pending, Delivered).
  * Tap on a specific delivery to view order contents and item quantities.
  * **Proof of Delivery (POD)**: Click "Start Delivery", hand the device to the customer, and capture their signature using the digital **Signature Pad**.
  * Auto-update the delivery status to "Delivered" and sync with the backend.

### 3. Expense Tracking (Log Expense / Advance)
**User Story**: As a driver, I need to log trip-related expenses (like fuel or tolls) and attach receipts so that I can be reimbursed by the company.
* **Flow**: User navigates to the **Expenses** tab.
* **Features**:
  * View a history of "All Claims" with their current status (Pending, Reimbursed).
  * Open a popup dialog to log a new expense.
  * Select the **Expense Type** (Fuel, Toll/Salik, Parking, Maintenance, Advance Request).
  * Input the Amount, optional Trip ID, and Notes.
  * **Receipt Upload**: Tap the camera icon to take a photo of the physical receipt.
  * Submit the claim, which syncs to the backend and updates the list instantly.

### 4. Van Inventory & Direct Sales (Van Sales)
**User Story**: As a sales representative, I want to view what stock is currently in my van and generate new sales invoices on the spot for walk-in customers.
* **Flow**: User navigates to the **Van Sales** module.
* **Features**:
  * Browse available inventory loaded onto the van.
  * Add items to a cart and review the checkout.
  * Submit the sale to generate a live invoice and deduct from the van's inventory.

### 5. Collections & Payment Handover
**User Story**: As a driver, I need to collect payments (cash or cheque) from customers at the time of delivery or direct sales, and properly hand these over at the end of the shift.
* **Flow**: User navigates to the **Collections** or records payments during **Deliveries/Sales**.
* **Features**:
  * Record cash payments received.
  * **Cheque Collection**: Record cheque details (Cheque Number, Bank, Date, Amount) securely.
  * Generate a digital receipt for the collected amount.

### 6. End of Day / Weekly Closing (Handover)
**User Story**: As a driver, I need to close my daily or weekly ledger, reconcile collections (cash and cheques), and verify remaining inventory before handing over to the depot.
* **Flow**: User navigates to the **Weekly Closing** module.
* **Features**:
  * **Handover Summary**: Review total collections separated by Cash, Cheques, and Credit.
  * Submit the handover report to the warehouse/finance managers for approval.
  * Finalize the shift/week and reset the van's inventory ledger.

---

## Technical Flow & Offline Capabilities
* **API Integration**: The application communicates with the backend via REST endpoints (e.g., `/api/expenses`, `/b1s/v1/orders`) designed to mirror SAP B1 Service Layer schemas.
* **State Management**: Powered by `@tanstack/react-query` to cache data locally and ensure smooth transitions.
* **Progressive Web App (PWA)**: Designed to be installable on mobile devices. Data entries (like logging expenses in areas with poor cellular reception) can be queued and automatically synced when the network connection is restored.
