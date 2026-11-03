# Smart Expense Tracker

A modern, fast, and feature-rich Expense Tracker web application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Recharts**.

---

## Features

- **Detailed Expense Entry**:
  - **Amount**: Numerical with quick-add chips (+100, +500, +1000, etc.) and multi-currency support (`₹`, `$`, `€`, `£`, `¥`, etc.).
  - **What**: Item or service name (e.g., "Grocery Shopping", "Dinner with Team").
  - **Why**: Justification / reason (e.g., "Monthly pantry restock", "Project celebration").
  - **Category**: 12 categorized badges with custom icons and colors (Food, Groceries, Transport, Housing, Utilities, Entertainment, Shopping, Health, Education, Travel, Bills, Other).
  - **Where**: Merchant / Store / Location (e.g., "Amazon", "Starbucks", "Decathlon").
  - **How**: Payment method (UPI / QR, Credit Card, Debit Card, Cash, Net Banking, Wallet).
  - **Date & Time**: Exact timestamps, defaulting to current time.

- **Day-by-Day Timeline & Spending Trend**:
  - Chronological grouped view with daily totals and collapsible day cards.
  - Interactive Recharts bar chart showing daily spending trends across time.

- **Category-Wise Breakdown & Donut Chart**:
  - Interactive Recharts donut chart with category distribution share.
  - Ranked category cards with progress bars, transaction counts, and average spend per item.
  - Drill-down drawer/list to inspect all transactions under any selected category.

- **Where & How Insights**:
  - Breakdown of spending by top merchants and places.
  - Breakdown of spending by payment methods.

- **Universal Search & Filtering**:
  - Real-time search across what, why, where, and category.
  - Date presets: All Time, Today, This Week, This Month, Last 30 Days, or Custom Range.
  - Filter by category and payment method.
  - Sort by newest, oldest, highest amount, or lowest amount.

- **Data Portability & Offline Persistence**:
  - Stored locally in your browser's `localStorage` (private and secure).
  - 1-click **Export to CSV** for spreadsheet analysis.
  - 1-click **Backup to JSON** and **Import from JSON** to restore or transfer between devices.
  - **Sample Data** generator to test and preview all charts with realistic expenditures.

---

## Getting Started

### 1. Installation
```bash
cd expense-tracker
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
