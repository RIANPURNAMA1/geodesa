# DESIGN SYSTEM - SHIPMENT DASHBOARD

## Overview

Buat ulang dashboard shipment management dengan layout dan visual yang identik dengan referensi.

Fokus utama:

- Modern SaaS Dashboard
- Clean UI
- Soft gray background
- Dark teal sidebar
- White content area
- Shipment card list di sebelah kiri
- Interactive map di sebelah kanan
- Minimalist design
- Rounded corner
- Soft shadow
- Professional logistics management interface

---

# Layout Structure

Gunakan layout 3 bagian:

| Area | Width |
|--------|--------|
| Sidebar | 260px |
| Shipment Panel | 350px |
| Map Area | Flexible |

Layout menggunakan:

```css
display: flex;
height: 100vh;
```

---

# Color Palette

## Primary

Dark Teal

```css
#123B49
```

## Secondary

Green Active Menu

```css
#5AD67D
```

## Background

```css
#F6F7F9
```

## Card

```css
#FFFFFF
```

## Text

Primary

```css
#1F2937
```

Secondary

```css
#6B7280
```

Border

```css
#E5E7EB
```

---

# Typography

Font Family

```css
Inter
```

Fallback

```css
sans-serif
```

Sizes

| Element | Size |
|----------|----------|
| Heading | 24px |
| Section Title | 18px |
| Body | 14px |
| Small Text | 12px |

Font Weight

```css
400
500
600
700
```

---

# Sidebar

## Width

```css
260px
```

## Background

```css
#123B49
```

## Logo

Top left

```txt
Shippo.
```

White text.

Bold.

---

## Navigation Menu

Items:

- Dashboard
- Orders
- Shipment
- Customers
- Support

---

## Active Menu

Shipment

Style:

```css
background: #5AD67D;
color: white;
border-radius: 12px;
```

---

## Bottom Menu

- Notifications
- Settings
- Logout

Position:

```css
margin-top: auto;
```

---

# Header

Top horizontal bar.

Contains:

## Search Bar

Center aligned.

Style:

```css
height: 44px;
border-radius: 12px;
background: white;
```

Placeholder:

```txt
Search...
```

---

## User Profile

Right side.

Components:

- Avatar
- Name
- Role

Example:

```txt
Phillip Ponter
Admin
```

---

# Shipment Panel

Width:

```css
350px
```

Background:

```css
#FFFFFF
```

---

## Title

```txt
Shipment
```

Subtitle

```txt
Control & Track Shipping Orders
```

---

## Tabs

Two tabs:

```txt
Active
Completed
```

Active tab:

```css
background: #F3F4F6;
font-weight: 600;
```

---

# Shipment Card

Each shipment displayed as card.

Style:

```css
background: white;
border-radius: 16px;
padding: 16px;
box-shadow: 0 4px 12px rgba(0,0,0,0.05);
```

Spacing:

```css
margin-bottom: 16px;
```

---

## Card Content

Top:

Product Icon

Product Name

Shipment ID

Example:

```txt
Ladder back chair
#ABR203045
```

---

Middle:

Progress indicator

```txt
Shipping Progress
```

Status:

```txt
Out for delivery
```

or

```txt
In Transit
```

---

Bottom:

Delivery Manager

Example:

```txt
Brandon
```

---

# Map Area

Occupies remaining width.

Background:

Map component.

Use:

- Google Maps
- Leaflet
- Mapbox

---

# Map Controls

Position:

Top Right

Buttons:

- Filter
- Layer
- Settings

Style:

```css
width: 40px;
height: 40px;
border-radius: 10px;
background: white;
```

---

# Delivery Marker

Custom marker.

Color:

```css
#5AD67D
```

---

# Driver Popup

Floating card above map.

Style:

```css
background: black;
color: white;
border-radius: 16px;
padding: 12px 18px;
```

Content:

```txt
Martin Schleier
Delivery Agent
```

Include:

- Call icon
- Message icon

---

# Card Radius

Use globally:

```css
border-radius: 16px;
```

---

# Shadows

Use soft shadows only.

```css
box-shadow:
0 4px 12px rgba(0,0,0,0.05);
```

Avoid heavy shadows.

---

# Spacing System

```css
4px
8px
12px
16px
24px
32px
```

Use consistently.

---

# Responsive Behaviour

## Desktop

```css
>= 1200px
```

Layout:

Sidebar + Shipment Panel + Map

---

## Tablet

```css
768px - 1199px
```

Sidebar collapse.

Shipment panel width:

```css
300px
```

---

## Mobile

```css
<768px
```

Layout stack:

- Header
- Shipment List
- Map

Sidebar becomes drawer.

---

# UI Principles

AI Agent MUST follow:

- Modern SaaS Dashboard
- Minimalist
- Logistics Tracking Platform
- Clean White Cards
- Dark Teal Sidebar
- Green Active State
- Rounded UI
- Soft Shadow
- Spacious Layout
- Similar hierarchy and spacing as reference image
- Similar proportions as reference image
- No glassmorphism
- No neumorphism
- No gradient background
- No bright colors except active green
- Professional enterprise appearance

---

# Expected Result

Generate UI that visually matches the reference dashboard:

- Left dark sidebar
- Middle shipment management panel
- Right live tracking map
- White cards
- Green active navigation
- Clean logistics SaaS design
- Pixel-close similarity to the provided reference image