# UX Specification: Personal Finance Tracker

## Overview
A clean, modern financial dashboard for tracking Fixed Deposits and Savings Accounts with emphasis on clarity, ease of use, and mobile responsiveness.

---

## Design Principles

1. **Financial Clarity**: Numbers are prominent, well-formatted, and easy to scan
2. **Visual Hierarchy**: Most important info (total portfolio value) at the top
3. **Progressive Disclosure**: Details revealed on interaction
4. **Mobile-First**: Touch-friendly, works great on phones
5. **Trust & Security**: Professional appearance for financial data

---

## Color Palette

```
Primary Colors:
- Primary Blue: #2563eb (buttons, links, accents)
- Success Green: #10b981 (positive values, maturity amounts)
- Warning Orange: #f59e0b (maturing soon alerts)
- Danger Red: #ef4444 (delete actions, matured items)
- Neutral Gray: #6b7280 (secondary text)

Background:
- Page Background: #f9fafb (light gray)
- Card Background: #ffffff (white)
- Border: #e5e7eb (light gray)

Text:
- Primary Text: #111827 (dark gray, almost black)
- Secondary Text: #6b7280 (medium gray)
- Muted Text: #9ca3af (light gray)
```

---

## Typography

```
Font Family: 'Inter', system-ui, sans-serif

Headings:
- H1 (Page Title): 32px, Bold, #111827
- H2 (Section): 24px, Semibold, #111827
- H3 (Card Title): 18px, Semibold, #111827

Body:
- Large: 16px, Regular, #111827
- Normal: 14px, Regular, #374151
- Small: 12px, Regular, #6b7280

Numbers (Currency):
- Large: 28px, Bold, #111827
- Medium: 20px, Semibold, #111827
- Small: 16px, Medium, #374151
```

---

## Main Dashboard Layout

### Desktop View (1024px+)

```
┌─────────────────────────────────────────────────────────────────┐
│  Personal Finance Tracker                    [+ Add Asset ▼]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              PORTFOLIO SUMMARY                             │  │
│  │                                                            │  │
│  │  Total Portfolio Value                                    │  │
│  │  ₹ 15,45,000                                              │  │
│  │  ────────────────────────────────────────────────────────│  │
│  │  Fixed Deposits: ₹12,00,000  │  Savings: ₹3,45,000      │  │
│  │  Maturity Value: ₹13,50,000  │  3 maturing in 30 days   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  FILTERS                                                   │  │
│  │  [All Assets ▼]  [All Banks ▼]  [Clear Filters]          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │ FIXED DEPOSITS (5)      │  │ SAVINGS ACCOUNTS (2)        │  │
│  ├─────────────────────────┤  ├─────────────────────────────┤  │
│  │ ┌─────────────────────┐ │  │ ┌─────────────────────────┐ │  │
│  │ │ HDFC Bank           │ │  │ │ ICICI Bank              │ │  │
│  │ │ ₹5,00,000           │ │  │ │ ₹2,00,000               │ │  │
│  │ │ 7.5% • Matures in   │ │  │ │ 3.5% interest           │ │  │
│  │ │ 45 days             │ │  │ │ A/C: ****1234           │ │  │
│  │ │ Maturity: ₹5,31,250 │ │  │ │                         │ │  │
│  │ │ [Edit] [Delete]     │ │  │ │ [Edit] [Delete]         │ │  │
│  │ └─────────────────────┘ │  │ └─────────────────────────┘ │  │
│  │                         │  │                             │  │
│  │ ┌─────────────────────┐ │  │ ┌─────────────────────────┐ │  │
│  │ │ SBI Bank            │ │  │ │ Axis Bank               │ │  │
│  │ │ ₹3,00,000           │ │  │ │ ₹1,45,000               │ │  │
│  │ │ 7.0% • Matures in   │ │  │ │ 3.0% interest           │ │  │
│  │ │ 120 days            │ │  │ │ A/C: ****5678           │ │  │
│  │ │ Maturity: ₹3,21,000 │ │  │ │                         │ │  │
│  │ │ [Edit] [Delete]     │ │  │ │ [Edit] [Delete]         │ │  │
│  │ └─────────────────────┘ │  │ └─────────────────────────┘ │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile View (< 768px)

```
┌─────────────────────────────┐
│ ☰  Personal Finance         │
├─────────────────────────────┤
│                             │
│ Total Portfolio Value       │
│ ₹ 15,45,000                 │
│                             │
│ Fixed Deposits              │
│ ₹12,00,000 → ₹13,50,000    │
│                             │
│ Savings Accounts            │
│ ₹3,45,000                   │
│                             │
│ ⚠ 3 maturing in 30 days     │
│                             │
├─────────────────────────────┤
│ [All Assets ▼] [All Banks ▼]│
│ [Clear Filters]             │
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │ HDFC Bank FD            │ │
│ │ ₹5,00,000               │ │
│ │ 7.5% • 45 days left     │ │
│ │ Maturity: ₹5,31,250     │ │
│ │ [Edit] [Delete]         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ SBI Bank FD             │ │
│ │ ₹3,00,000               │ │
│ │ 7.0% • 120 days left    │ │
│ │ Maturity: ₹3,21,000     │ │
│ │ [Edit] [Delete]         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ICICI Savings           │ │
│ │ ₹2,00,000               │ │
│ │ 3.5% interest           │ │
│ │ [Edit] [Delete]         │ │
│ └─────────────────────────┘ │
│                             │
│         [+ Add Asset]       │
│                             │
└─────────────────────────────┘
```

---

## Component Details

### 1. Portfolio Summary Card

**Visual Design:**
- Large card with subtle shadow
- Gradient background (light blue to white)
- Prominent total value display
- Grid layout for breakdown stats

**Interactions:**
- Static display (no interactions)
- Auto-updates when data changes
- Smooth number transitions (animated)

**States:**
- Loading: Skeleton placeholders
- Empty: "No assets yet. Add your first asset!"
- Populated: Full stats display

---

### 2. Asset Card (Fixed Deposit)

```
┌─────────────────────────────────────┐
│ 🏦 HDFC Bank                        │
│                                     │
│ Principal Amount                    │
│ ₹ 5,00,000                          │
│                                     │
│ Interest Rate: 7.5% p.a.            │
│ Start Date: 15 Jan 2024             │
│ Maturity Date: 15 Mar 2024          │
│                                     │
│ ⏱ Matures in 45 days                │
│                                     │
│ Maturity Amount                     │
│ ₹ 5,31,250 (+₹31,250)               │
│                                     │
│ Account: FD-****1234                │
│                                     │
│ ┌──────────┐  ┌──────────┐         │
│ │   Edit   │  │  Delete  │         │
│ └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
```

**Visual States:**
- Normal: White background, gray border
- Maturing Soon (<30 days): Orange left border, warning icon
- Matured: Red left border, "MATURED" badge
- Hover: Slight shadow increase, border color change

---

### 3. Asset Card (Savings Account)

```
┌─────────────────────────────────────┐
│ 🏦 ICICI Bank                       │
│                                     │
│ Current Balance                     │
│ ₹ 2,00,000                          │
│                                     │
│ Interest Rate: 3.5% p.a.            │
│ Account: ****1234                   │
│                                     │
│ Last Updated: 10 Feb 2024           │
│                                     │
│ ┌──────────┐  ┌──────────┐         │
│ │   Edit   │  │  Delete  │         │
│ └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
```

---

### 4. Add/Edit Asset Form

**Modal Dialog (Desktop) / Full Screen (Mobile)**

```
┌─────────────────────────────────────────────┐
│  Add New Asset                          [×] │
├─────────────────────────────────────────────┤
│                                             │
│  Asset Type *                               │
│  ○ Fixed Deposit  ○ Savings Account         │
│                                             │
│  Bank Name *                                │
│  [HDFC Bank                            ▼]   │
│                                             │
│  Principal Amount *                         │
│  [₹ 5,00,000                            ]   │
│                                             │
│  Interest Rate (% p.a.) *                   │
│  [7.5                                   ]   │
│                                             │
│  Start Date *                               │
│  [15/01/2024                            📅] │
│                                             │
│  Maturity Date *                            │
│  [15/03/2024                            📅] │
│                                             │
│  Account Number (optional)                  │
│  [FD-1234                               ]   │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │    Cancel    │  │  Add Asset   │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
└─────────────────────────────────────────────┘
```

**Validation:**
- Real-time validation on blur
- Error messages below fields in red
- Disabled submit button until valid
- Success message on save

**Example Errors:**
```
Principal Amount *
[                                   ]
❌ Amount must be greater than 0

Maturity Date *
[15/01/2024                     📅]
❌ Maturity date must be after start date
```

---

### 5. Filter Panel

```
┌─────────────────────────────────────────────┐
│  Filter Assets                              │
├─────────────────────────────────────────────┤
│                                             │
│  Asset Type                                 │
│  [All Assets                            ▼]  │
│    • All Assets                             │
│    • Fixed Deposits                         │
│    • Savings Accounts                       │
│                                             │
│  Bank                                       │
│  [All Banks                             ▼]  │
│    • All Banks                              │
│    • HDFC Bank                              │
│    • ICICI Bank                             │
│    • SBI Bank                               │
│    • Axis Bank                              │
│                                             │
│  [Clear All Filters]                        │
│                                             │
└─────────────────────────────────────────────┘
```

**Active Filter Display:**
```
Active Filters: [Fixed Deposits ×] [HDFC Bank ×]
```

---

### 6. Delete Confirmation Dialog

```
┌─────────────────────────────────────┐
│  ⚠ Confirm Deletion                 │
├─────────────────────────────────────┤
│                                     │
│  Are you sure you want to delete    │
│  this asset?                        │
│                                     │
│  HDFC Bank Fixed Deposit            │
│  ₹5,00,000                          │
│                                     │
│  This action cannot be undone.      │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │  Cancel  │  │  Delete  │        │
│  └──────────┘  └──────────┘        │
│                                     │
└─────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Add Fixed Deposit

```
1. User clicks "+ Add Asset" button
   ↓
2. Modal opens with form
   ↓
3. User selects "Fixed Deposit" radio
   ↓
4. Form shows FD-specific fields
   ↓
5. User fills in:
   - Bank name (dropdown with autocomplete)
   - Principal amount
   - Interest rate
   - Start date (date picker)
   - Maturity date (date picker)
   - Account number (optional)
   ↓
6. Real-time validation on each field
   ↓
7. User clicks "Add Asset"
   ↓
8. Loading spinner on button
   ↓
9. Success: Modal closes, toast notification
   "Fixed Deposit added successfully!"
   ↓
10. Dashboard updates with new asset
    Portfolio summary recalculates
```

### Flow 2: Edit Savings Account

```
1. User clicks "Edit" on savings card
   ↓
2. Modal opens pre-filled with data
   ↓
3. User modifies balance
   ↓
4. User clicks "Save Changes"
   ↓
5. Loading state
   ↓
6. Success: Modal closes, toast notification
   "Savings account updated!"
   ↓
7. Card updates with new values
   Portfolio summary recalculates
```

### Flow 3: Filter by Bank

```
1. User clicks "All Banks" dropdown
   ↓
2. Dropdown shows list of banks
   ↓
3. User selects "HDFC Bank"
   ↓
4. Asset list filters instantly
   Shows only HDFC assets
   ↓
5. Active filter chip appears:
   "HDFC Bank ×"
   ↓
6. User clicks × on chip
   ↓
7. Filter clears, all assets shown
```

---

## Responsive Breakpoints

```
Mobile:     < 768px   (1 column, stacked layout)
Tablet:     768-1023px (2 columns for cards)
Desktop:    1024px+    (2-3 columns, side-by-side)
```

### Mobile Adaptations:
- Hamburger menu for navigation
- Full-screen modals instead of dialogs
- Larger touch targets (min 44px)
- Simplified card layouts
- Bottom sheet for filters
- Floating action button for "+ Add Asset"

---

## Loading States

### Initial Page Load:
```
┌─────────────────────────────────────┐
│  Personal Finance Tracker           │
├─────────────────────────────────────┤
│                                     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│                                     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                                     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│                                     │
└─────────────────────────────────────┘
```

### Saving Asset:
- Button shows spinner: "Saving..."
- Disabled state on form
- Semi-transparent overlay

---

## Empty States

### No Assets Yet:
```
┌─────────────────────────────────────┐
│                                     │
│           📊                        │
│                                     │
│     No assets yet                   │
│                                     │
│  Start tracking your finances by    │
│  adding your first asset            │
│                                     │
│     [+ Add Your First Asset]        │
│                                     │
└─────────────────────────────────────┘
```

### No Results from Filter:
```
┌─────────────────────────────────────┐
│                                     │
│           🔍                        │
│                                     │
│     No assets found                 │
│                                     │
│  Try adjusting your filters         │
│                                     │
│     [Clear Filters]                 │
│                                     │
└─────────────────────────────────────┘
```

---

## Error States

### API Error:
```
┌─────────────────────────────────────┐
│  ⚠ Unable to load assets            │
│                                     │
│  Please check your connection and   │
│  try again.                         │
│                                     │
│  [Retry]                            │
└─────────────────────────────────────┘
```

### Form Validation Error:
```
Toast Notification (top-right):
┌─────────────────────────────────────┐
│  ❌ Please fix the errors below     │
└─────────────────────────────────────┘
```

---

## Notifications (Toast Messages)

**Success:**
```
✅ Fixed Deposit added successfully!
✅ Savings account updated!
✅ Asset deleted
```

**Error:**
```
❌ Failed to save asset. Please try again.
❌ Connection error. Check your internet.
```

**Warning:**
```
⚠ 3 fixed deposits maturing in 30 days
```

**Position:** Top-right corner
**Duration:** 3 seconds
**Dismissible:** Yes (× button)

---

## Accessibility Features

1. **Keyboard Navigation:**
   - Tab through all interactive elements
   - Enter/Space to activate buttons
   - Escape to close modals
   - Arrow keys in dropdowns

2. **Screen Reader Support:**
   - ARIA labels on all inputs
   - Role attributes on custom components
   - Live regions for dynamic updates
   - Descriptive button text

3. **Visual:**
   - High contrast mode support
   - Focus indicators (blue outline)
   - Large text option
   - Color not sole indicator

4. **Touch:**
   - Minimum 44px touch targets
   - Swipe gestures for mobile
   - No hover-only interactions

---

## Animation & Transitions

**Subtle & Professional:**
- Card hover: 150ms ease-in-out
- Modal open/close: 200ms slide-up
- Number changes: 300ms count-up animation
- Filter apply: 150ms fade
- Toast notifications: 200ms slide-in

**No animations for:**
- Users with prefers-reduced-motion
- Critical financial data updates

---

## Currency Formatting

**Indian Rupee (₹):**
- Symbol: ₹ (before amount)
- Thousands separator: Comma
- Decimal: 2 places for paise, 0 for whole rupees

**Examples:**
- ₹5,00,000 (5 lakhs)
- ₹12,45,678 (12.45 lakhs)
- ₹1,00,00,000 (1 crore)

---

## Date Formatting

**Display Format:** DD MMM YYYY
**Examples:**
- 15 Jan 2024
- 01 Mar 2024

**Relative Dates:**
- "Matures in 45 days"
- "Matured 10 days ago"
- "Maturing today"

---

## Summary

This UX specification provides a complete blueprint for building the Personal Finance Tracker interface. The design emphasizes:

✅ Clear financial information hierarchy
✅ Mobile-first responsive design
✅ Intuitive interactions and flows
✅ Professional appearance for financial data
✅ Comprehensive error and empty states
✅ Full accessibility support

Ready to start implementation with these designs?
