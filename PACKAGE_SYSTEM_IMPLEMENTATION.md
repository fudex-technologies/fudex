# Package System Implementation Plan

## Overview
This document outlines the flexible, reusable package system for special occasions (Valentine, Christmas, etc.) integrated into the FUDEX food delivery app.

## Architecture

### Database Schema
The package system uses the following models:

1. **Package** - Main package entity (e.g., "Valentine Packages")
   - Fields: name, slug, description, coverImage, isActive, isPreorder, deliveryDate, orderCloseDate
   - Relations: categories, orders

2. **PackageCategory** - Categories within a package (e.g., "Love Spark", "Classic", "Premium")
   - Fields: name, slug, description, order (for sorting)
   - Relations: package, items

3. **PackageItem** - Individual items in a category
   - Fields: name, slug, description, price, images[], isActive, inStock, details (JSON for flexibility)
   - Relations: category, package, orderItems

4. **PackageOrder** - Orders for packages
   - Fields: recipient details, sender details, deliveryDate, timeSlot, cardType, customCardMessage
   - Relations: user, package, items, payment

5. **PackageOrderItem** - Items in a package order
   - Fields: quantity, unitPrice, totalPrice
   - Relations: packageOrder, packageItem

6. **PackagePayment** - Payment records for package orders
   - Similar structure to regular Payment model

### API Layer (tRPC)

#### Admin Procedures (`packages.admin.*`)
- `createPackage` - Create new package
- `updatePackage` - Update package details
- `deletePackage` - Delete package (with validation)
- `listPackages` - List all packages (admin view)
- `getPackageById` - Get package with all details
- `createCategory` - Create category within package
- `updateCategory` - Update category
- `deleteCategory` - Delete category
- `createPackageItem` - Create package item
- `updatePackageItem` - Update package item
- `deletePackageItem` - Delete package item

#### Public Procedures (`packages.public.*`)
- `listActivePackages` - List active packages
- `getPackageBySlug` - Get package by slug with categories and items
- `getPackageCategory` - Get category with items
- `getPackageItemById` - Get package item details
- `createPackageOrder` - Create package order
- `getMyPackageOrders` - Get user's package orders
- `getPackageOrderById` - Get package order details

### React Hooks

#### `usePackageActions()` - Public package operations
- `useListActivePackages()` - Query active packages
- `useGetPackageBySlug()` - Query package by slug
- `useGetPackageCategory()` - Query category
- `useGetPackageItemById()` - Query package item
- `useGetMyPackageOrders()` - Query user's orders
- `useGetPackageOrderById()` - Query order details
- `createPackageOrder()` - Mutation to create order

#### `usePackageAdminActions()` - Admin operations
- Package CRUD operations
- Category CRUD operations
- Package item CRUD operations

## User Flow

### 1. Package Discovery
- User navigates to `/packages/[packageSlug]`
- Sees package cover image and description
- Views categories with preview items

### 2. Category Browsing
- User clicks on a category
- Navigates to `/packages/[packageSlug]/[categorySlug]`
- Sees all items in that category
- Can add items to cart

### 3. Checkout Flow

#### Step 1: Order Summary (`/packages/[packageSlug]/order-summary`)
- Shows selected package items
- Displays total price
- User proceeds to checkout

#### Step 2: Recipient Details (`/packages/[packageSlug]/checkout/recipient`)
- User enters:
  - Sender name
  - Recipient name
  - Recipient phone
  - Recipient address (with area selection)
- Similar to existing address flow

#### Step 3: Delivery Details (`/packages/[packageSlug]/checkout/delivery`)
- If preorder package:
  - Shows delivery date (from package)
  - Time slot picker (2-hour slots from 8am-10pm)
- User selects time slot

#### Step 4: Card Customization (`/packages/[packageSlug]/checkout/card`)
- User chooses:
  - "Let us create a custom card for you" (ADMIN_CREATED)
  - "Customize it yourself" (CUSTOM)
- If CUSTOM: Drawer opens with textarea for custom message

#### Step 5: Checkout Review (`/packages/[packageSlug]/checkout`)
- Shows preview of all details:
  - Package items
  - Recipient details
  - Delivery date and time slot
  - Card type and message (if custom)
  - Fees breakdown:
    - Product amount
    - Delivery fee
    - Service fee
    - Total
- User proceeds to payment

#### Step 6: Payment
- Integrates with existing payment system
- Creates PackageOrder and PackagePayment
- Redirects to success page

## Key Components

### Time Slot Picker
- Generates 2-hour slots from 8am to 10pm
- Radio button selection
- Shows available slots (can be extended for availability checking)

### Card Customization Drawer
- Drawer component with textarea
- Character limit (optional)
- Preview of message

### Package Order Summary
- Shows all checkout details
- Similar to regular order summary but with package-specific fields

### Package Checkout Page
- Preview of all details
- Fees breakdown
- Payment integration

## Integration Points

### With Existing System
1. **Address System** - Reuses Area model for recipient addresses
2. **Payment System** - Uses same payment provider (Paystack)
3. **Delivery Fee Calculator** - Uses existing `calculateDeliveryFee` function
4. **Service Fee** - Uses existing `getServiceFee` function
5. **User System** - Links to existing User model

### Separation from Vendor System
- Packages are admin-created, not vendor-created
- Package orders are separate from regular orders
- Package items are not linked to ProductItems
- This ensures no interference with existing vendor marketplace

## Future Enhancements

1. **Availability Management** - Track available time slots
2. **Inventory Management** - Track stock for package items
3. **Package Variants** - Support for different sizes/options
4. **Bulk Orders** - Allow ordering multiple packages
5. **Gift Messages** - Enhanced card customization
6. **Package Analytics** - Track popular packages and items

## Migration Steps

1. Run Prisma migration to create package tables
2. Deploy tRPC procedures
3. Deploy React hooks
4. Build UI components
5. Test checkout flow
6. Create admin UI for package management

## Notes

- Package system is completely separate from vendor system
- Package orders use PackageOrder model, not Order model
- Can be extended for any special occasion
- Flexible JSON field in PackageItem allows for custom data
- Time slots are hardcoded but can be made configurable

