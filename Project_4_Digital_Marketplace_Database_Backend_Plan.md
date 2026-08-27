# Project 4 — Digital Products & Downloads Marketplace
## Production Database & Backend Implementation Plan

## 1. Project Overview

Digital marketplace for selling:
- Software licenses
- Design templates
- E-books
- Music
- Stock photos
- Video courses

Core complexity:
- DRM and license enforcement
- License activation limits
- File versioning
- Secure digital delivery
- Re-download limits
- Piracy protection
- Creator payouts
- Affiliate commissions
- Moderation and DMCA workflows

Roles:
- Super Admin
- Creator / Seller
- Buyer
- Affiliate
- Content Reviewer

---

# 2. Recommended Architecture

```text
Next.js Frontend
       |
       | REST API
       v
Node.js + Express
       |
       +-- Authentication
       +-- Authorization / RBAC
       +-- Validation
       +-- Controllers
       +-- Services
       +-- Repositories
       |
       v
PostgreSQL
       |
       +-- Users / RBAC
       +-- Creator / Storefront
       +-- Products / Files
       +-- Licenses / DRM
       +-- Orders / Payments
       +-- Downloads
       +-- Reviews / Moderation
       +-- Affiliates
       +-- Promotions
       +-- Payouts / Analytics
       +-- Activity / Audit
```

## Recommended database

PostgreSQL is the preferred database because this marketplace requires:
- Foreign keys
- Transactions
- Unique constraints
- Reliable financial data
- Complex relational queries
- Indexing
- Aggregation/reporting
- Concurrency control
- JSON support where flexible metadata is required

If the existing backend already uses an ORM/query builder such as Sequelize, TypeORM, Drizzle, or Knex, retain it instead of replacing it unnecessarily.

If no ORM exists, Prisma is recommended for the Node.js backend.

---

# 3. Database Domains

1. Identity & RBAC
2. Creator & Storefront
3. Products & Files
4. Licenses & DRM
5. Orders & Payments
6. Downloads
7. Reviews & Moderation
8. Affiliates
9. Coupons & Promotions
10. Creator Earnings & Payouts
11. Activity & Audit

---

# 4. Identity & RBAC

## users

Fields:
- id
- email
- password_hash
- first_name
- last_name
- avatar_url
- status
- email_verified_at
- last_login_at
- created_at
- updated_at
- deleted_at

Constraints:
- Unique email
- Indexed email
- Password stored as a secure hash
- Soft deletion where appropriate

## roles

Fields:
- id
- name
- slug
- description
- created_at
- updated_at

Seed roles:
- super_admin
- creator
- buyer
- affiliate
- content_reviewer

## permissions

Fields:
- id
- name
- slug
- description
- created_at

Examples:
- products.create
- products.update
- products.delete
- products.publish
- orders.view
- orders.manage
- licenses.create
- licenses.validate
- licenses.revoke
- reviews.moderate
- dmca.manage
- affiliates.manage
- payouts.view

## user_roles

Fields:
- user_id
- role_id

Unique:
- (user_id, role_id)

## role_permissions

Fields:
- role_id
- permission_id

Unique:
- (role_id, permission_id)

Authorization must be enforced on the backend. Hiding UI menu items is not sufficient security.

---

# 5. Creator & Storefront

## creator_profiles

Fields:
- id
- user_id
- display_name
- bio
- avatar_url
- website_url
- verification_status
- verified_at
- content_policy_accepted_at
- created_at
- updated_at

## creator_payout_accounts

Fields:
- id
- creator_id
- provider
- account_type
- account_reference
- account_holder_name
- currency
- is_default
- status
- created_at
- updated_at

Sensitive payout information must not be returned through normal public APIs.

## creator_verification_requests

Fields:
- id
- creator_id
- status
- submitted_at
- reviewed_at
- reviewed_by
- review_notes

Statuses:
- pending
- approved
- rejected

## storefronts

Fields:
- id
- creator_id
- name
- slug
- description
- logo_url
- banner_url
- theme
- status
- published_at
- created_at
- updated_at

Relationships:

```text
users
  |
  +-- creator_profiles
          |
          +-- creator_payout_accounts
          +-- creator_verification_requests
          +-- storefronts
```

---

# 6. Product & File Management

## products

Fields:
- id
- creator_id
- storefront_id
- title
- slug
- description
- short_description
- product_type
- status
- price
- currency
- is_featured
- published_at
- created_at
- updated_at
- deleted_at

Possible product types:
- software
- template
- ebook
- music
- stock_photo
- video_course
- other

Only use types actually supported by the existing application.

## product_files

Fields:
- id
- product_id
- name
- file_type
- storage_key
- mime_type
- file_size
- is_preview
- created_at
- updated_at

## product_versions

Fields:
- id
- product_id
- version
- release_notes
- created_at
- created_by

## product_file_versions

Fields:
- id
- product_file_id
- product_version_id
- storage_key
- checksum
- file_size
- mime_type
- created_at

Relationship:

```text
Product
 |
 +-- Version 1
 |     +-- File
 |
 +-- Version 2
 |     +-- File
 |
 +-- Version 3
       +-- File
```

This preserves file history and prevents a replacement from invalidating existing buyer licenses.

Do not simply store a single file_url on products.

---

# 7. License Type & DRM Management

## license_types

Fields:
- id
- name
- slug
- description
- activation_limit
- duration_days
- is_transferable
- status
- created_at
- updated_at

Typical license types:
- Personal
- Commercial
- Extended Commercial

## product_license_types

Fields:
- product_id
- license_type_id
- price

This allows each product to offer different license tiers.

Example:

```text
Product A
  Personal           $20
  Commercial         $50
  Extended           $100
```

## licenses

Fields:
- id
- order_item_id
- product_id
- license_type_id
- user_id
- license_key_hash
- status
- activation_limit
- activation_count
- issued_at
- expires_at
- revoked_at
- revocation_reason

Never store a recoverable raw license key unless the application specifically requires it. Prefer a displayable key plus secure hash where possible.

## license_activations

Fields:
- id
- license_id
- device_identifier
- device_name
- ip_address
- user_agent
- activated_at
- deactivated_at
- status

License validation must check:
- License exists
- License is active
- Product matches
- User is authorized
- License has not expired
- Activation limit has not been exceeded
- License has not been revoked

---

# 8. Orders & Instant Delivery

## orders

Fields:
- id
- order_number
- buyer_id
- status
- currency
- subtotal
- discount_amount
- affiliate_discount
- tax_amount
- platform_fee
- total_amount
- created_at
- updated_at
- completed_at
- cancelled_at

Never calculate historical orders from the current product price.

## order_items

Fields:
- id
- order_id
- product_id
- creator_id
- license_type_id
- quantity
- unit_price
- discount_amount
- subtotal
- creator_amount
- platform_fee

The purchased price must be stored on the order item.

## payments

Fields:
- id
- order_id
- provider
- provider_payment_id
- amount
- currency
- status
- payment_method
- paid_at
- failed_at
- failure_reason
- created_at
- updated_at

Possible payment states:
- pending
- authorized
- paid
- failed
- refunded
- partially_refunded
- cancelled

---

# 9. Secure Downloads

## download_entitlements

Fields:
- id
- order_item_id
- user_id
- product_id
- max_downloads
- download_count
- expires_at
- status
- created_at

## download_tokens

Fields:
- id
- entitlement_id
- token_hash
- expires_at
- used_at
- max_uses
- use_count
- created_at

## download_events

Fields:
- id
- user_id
- product_id
- order_item_id
- license_id
- file_id
- ip_address
- user_agent
- device_identifier
- success
- failure_reason
- created_at

Secure download flow:
1. Authenticate user
2. Verify purchase/license
3. Verify entitlement
4. Verify download limit
5. Create short-lived token
6. Generate signed/private storage URL
7. Record download event
8. Increment download counter
9. Expire token when appropriate

---

# 10. Reviews & Content Moderation

## reviews

Fields:
- id
- product_id
- buyer_id
- order_item_id
- rating
- title
- body
- status
- created_at
- updated_at
- deleted_at

Possible statuses:
- published
- hidden
- flagged
- removed

Recommended uniqueness:
- Prevent duplicate reviews according to the actual application business rule.

## review_responses

Fields:
- id
- review_id
- creator_id
- body
- created_at
- updated_at

---

# 11. Moderation & DMCA

## moderation_reports

Fields:
- id
- product_id
- reported_by
- assigned_to
- reason
- description
- status
- resolution
- created_at
- updated_at
- resolved_at

## dmca_reports

Fields:
- id
- product_id
- reporter_id
- copyright_owner
- description
- evidence_url
- status
- submitted_at
- reviewed_at
- resolved_at

Suggested states:
- submitted
- under_review
- takedown
- counter_notice
- restored
- rejected
- resolved

Workflow:

```text
Report
  |
  v
Under Review
  |
  +-- Rejected
  |
  +-- Takedown
          |
          v
     Counter Notice
          |
          +-- Restore
          |
          +-- Continue Takedown
```

---

# 12. Affiliate & Referral Program

## affiliate_profiles

Fields:
- id
- user_id
- status
- commission_rate
- minimum_payout
- created_at
- updated_at

## affiliate_links

Fields:
- id
- affiliate_id
- creator_id
- product_id
- code
- commission_rate
- status
- created_at
- expires_at

## affiliate_clicks

Fields:
- id
- affiliate_link_id
- visitor_id
- ip_address
- user_agent
- referrer
- created_at

## affiliate_conversions

Fields:
- id
- affiliate_link_id
- order_id
- order_item_id
- affiliate_id
- commission_rate
- commission_amount
- status
- created_at

## affiliate_payouts

Fields:
- id
- affiliate_id
- amount
- currency
- status
- period_start
- period_end
- paid_at
- created_at

Fraud detection should consider:
- Self-referral
- Same buyer/affiliate account
- Suspicious repeated IPs
- Excessive click volume
- Abnormally high conversion rates
- Repeated short-lived clicks

---

# 13. Coupons, Bundles & Promotions

## coupons

Fields:
- id
- creator_id
- code
- discount_type
- discount_value
- max_uses
- used_count
- minimum_order_amount
- starts_at
- expires_at
- status
- created_at
- updated_at

## coupon_products

Fields:
- coupon_id
- product_id

## coupon_usages

Fields:
- id
- coupon_id
- user_id
- order_id
- discount_amount
- used_at

## bundles

Fields:
- id
- creator_id
- name
- slug
- description
- price
- currency
- status
- starts_at
- ends_at
- created_at
- updated_at

## bundle_items

Fields:
- bundle_id
- product_id

For flash sales and pre-launch pricing, use a pricing/promotion structure if the existing application needs multiple pricing periods rather than overwriting the product's base price.

---

# 14. Creator Earnings & Payouts

## creator_earnings

Fields:
- id
- creator_id
- order_id
- order_item_id
- gross_amount
- platform_fee
- refund_amount
- affiliate_commission
- net_amount
- currency
- status
- created_at

## creator_payouts

Fields:
- id
- creator_id
- payout_account_id
- amount
- currency
- period_start
- period_end
- status
- provider_reference
- paid_at
- created_at

Creator earnings must only be accessible to:
- The owning creator
- Super Admin

Buyer, reviewer, and unrelated creator accounts must not access earnings data.

---

# 15. Activity & Audit Logs

## activity_logs

Fields:
- id
- user_id
- action
- entity_type
- entity_id
- description
- ip_address
- user_agent
- device_identifier
- metadata
- created_at

Examples:
- PRODUCT_CREATED
- PRODUCT_UPDATED
- PRODUCT_VERSION_CREATED
- LICENSE_GENERATED
- LICENSE_ACTIVATED
- LICENSE_REVOKED
- DOWNLOAD_REQUESTED
- DOWNLOAD_COMPLETED
- DOWNLOAD_FAILED
- REFUND_REQUESTED
- REFUND_COMPLETED
- DMCA_REPORTED
- DMCA_TAKEDOWN
- DMCA_RESTORED
- PAYOUT_CREATED
- PAYOUT_COMPLETED

Audit records should generally be append-only.

---

# 16. Important Relationships

```text
User
 |
 +-- Roles
 |
 +-- Creator Profile
 |      |
 |      +-- Storefront
 |      +-- Products
 |      +-- Payout Accounts
 |      +-- Earnings
 |      +-- Payouts
 |
 +-- Orders
 |      |
 |      +-- Order Items
 |             |
 |             +-- Product
 |             +-- License
 |             +-- Download Entitlement
 |
 +-- Affiliate Profile
 |      |
 |      +-- Affiliate Links
 |      +-- Clicks
 |      +-- Conversions
 |      +-- Payouts
 |
 +-- Reviews
 |
 +-- Activity Logs
```

Product:

```text
Product
 |
 +-- Files
 |     |
 |     +-- File Versions
 |
 +-- Product Versions
 |
 +-- License Types
 |
 +-- Reviews
 |
 +-- Moderation Reports
 |
 +-- DMCA Reports
 |
 +-- Affiliate Links
 |
 +-- Coupons
 |
 +-- Bundles
```

---

# 17. Critical Database Indexes

At minimum:

```text
users.email
users.status

products.slug
products.creator_id
products.status
products.created_at

storefronts.slug
storefronts.creator_id

orders.order_number
orders.buyer_id
orders.status
orders.created_at

order_items.order_id
order_items.product_id
order_items.creator_id

licenses.license_key_hash
licenses.user_id
licenses.product_id
licenses.status

license_activations.license_id

download_tokens.token_hash
download_tokens.expires_at

download_events.user_id
download_events.product_id
download_events.created_at

reviews.product_id
reviews.buyer_id

affiliate_links.code
affiliate_links.affiliate_id

affiliate_conversions.order_id
affiliate_conversions.affiliate_id

coupons.code
coupons.creator_id

activity_logs.user_id
activity_logs.action
activity_logs.created_at
```

Composite indexes should be added based on actual API query patterns after inspecting the project.

---

# 18. Important Constraints

Examples:

```text
users.email UNIQUE

products.slug UNIQUE

storefronts.slug UNIQUE

license_types.slug UNIQUE

affiliate_links.code UNIQUE

coupons.code UNIQUE

orders.order_number UNIQUE

role_permissions(role_id, permission_id) UNIQUE

user_roles(user_id, role_id) UNIQUE
```

Foreign keys should use appropriate ON DELETE behavior.

Do not cascade-delete financial records such as:
- Payments
- Completed orders
- Licenses
- Creator earnings
- Payouts
- Audit records

Use soft deletion or restricted deletion where appropriate.

---

# 19. Purchase Transaction

A successful purchase should be handled atomically.

```text
BEGIN TRANSACTION

1. Validate product
2. Validate license type
3. Validate coupon
4. Validate affiliate attribution
5. Calculate totals
6. Create order
7. Create order items
8. Create payment record
9. Mark payment successful
10. Generate license
11. Create download entitlement
12. Create creator earning record
13. Create affiliate commission
14. Write activity log

COMMIT
```

On failure:

```text
ROLLBACK
```

The system must avoid:

```text
Payment = successful
License = missing
Download = missing
Creator earnings = missing
```

---

# 20. API Architecture

Recommended backend structure:

```text
backend/src/
├── config/
│   ├── env.ts
│   └── database.ts
│
├── middleware/
│   ├── auth.ts
│   ├── authorize.ts
│   ├── validate.ts
│   └── errorHandler.ts
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── creators/
│   ├── storefronts/
│   ├── products/
│   ├── licenses/
│   ├── orders/
│   ├── payments/
│   ├── downloads/
│   ├── reviews/
│   ├── moderation/
│   ├── affiliates/
│   ├── promotions/
│   ├── payouts/
│   └── analytics/
│
├── routes/
├── lib/
└── app.ts
```

Recommended module structure:

```text
products/
├── product.controller.ts
├── product.service.ts
├── product.repository.ts
├── product.schema.ts
└── product.routes.ts
```

Controllers should remain thin:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

---

# 21. Authentication & Authorization

Backend authorization should be based on permissions.

Example:

```text
Buyer:
- Own orders
- Own licenses
- Own downloads
- Own reviews

Creator:
- Own products
- Own storefront
- Own earnings
- Own payouts

Affiliate:
- Own links
- Own conversions
- Own commissions

Content Reviewer:
- Moderation
- DMCA workflows

Super Admin:
- Platform-wide management
```

Never rely on frontend menu visibility for security.

---

# 22. Validation

Use the project's existing validation library if present.

Otherwise, a schema validator such as Zod is recommended.

Validate:
- Request body
- Query parameters
- Route parameters
- Pagination
- Sorting
- IDs
- Prices
- Discount values
- License limits
- Coupon dates
- File metadata

Example:

```text
price >= 0
discount >= 0
rating between 1 and 5
activation_limit >= 1
max_downloads >= 1
```

---

# 23. Error Handling

Use centralized Express error handling.

Recommended error categories:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Rate Limited
500 Internal Server Error
```

Do not expose:
- Database errors
- SQL details
- Password hashes
- Payment provider secrets
- Internal stack traces in production

---

# 24. Environment Configuration

Example:

```env
NODE_ENV=development

PORT=5000

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/marketplace"

JWT_SECRET="change-me"
JWT_EXPIRES_IN="..."

FRONTEND_URL="http://localhost:3000"

STORAGE_PROVIDER="..."
STORAGE_BUCKET="..."

PAYMENT_PROVIDER="..."
PAYMENT_SECRET_KEY="..."
```

Actual names must follow the existing project's conventions.

Never commit real secrets.

---

# 25. Migration Plan

If using Prisma, migrations would be created in dependency order:

```text
001_create_users
002_create_roles_permissions
003_create_creator_profiles
004_create_storefronts
005_create_products
006_create_product_files
007_create_product_versions
008_create_license_types
009_create_licenses
010_create_orders
011_create_order_items
012_create_payments
013_create_downloads
014_create_reviews
015_create_moderation
016_create_affiliates
017_create_promotions
018_create_earnings
019_create_payouts
020_create_activity_logs
```

Do not destroy or reset an existing production database.

Destructive schema changes require explicit approval.

---

# 26. Seed Data

Seed roles:

```text
Super Admin
Creator
Buyer
Affiliate
Content Reviewer
```

Seed license types:

```text
Personal
Commercial
Extended Commercial
```

Seed permissions for:
- Products
- Orders
- Licenses
- Reviews
- Moderation
- DMCA
- Affiliates
- Promotions
- Payouts
- Analytics
- Users
- Roles

Demo users may be created for development/testing only.

Do not seed fake successful production payments.

---

# 27. Testing Plan

Critical database tests:

```text
Create user
Assign role
Assign permission
Create creator
Create storefront
Create product
Create product version
Create license type
Create order
Create order item
Create payment
Generate license
Activate license
Reject activation over limit
Create download entitlement
Generate download token
Reject expired token
Create review
Create DMCA report
Create affiliate conversion
Apply coupon
Create creator earning
Create payout
Write activity log
```

Critical API workflows:

```text
Authentication
RBAC
Product creation
Product publishing
Storefront management
Purchase
License generation
License validation
License activation
Secure download
Review creation
DMCA moderation
Affiliate attribution
Coupon application
Creator payout
```

---

# 28. Verification Commands

The actual commands must follow the project's package manager and existing scripts.

Typical Prisma commands:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Production migration:

```bash
npx prisma migrate deploy
```

Typical verification:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

If the project uses pnpm or yarn, use its existing package manager instead.

---

# 29. Implementation Workflow

## Phase 1 — Read-only project audit

Before changing anything:

1. Inspect frontend structure
2. Inspect all frontend pages
3. Inspect components
4. Inspect API clients
5. Inspect backend structure
6. Inspect Express routes
7. Inspect controllers
8. Inspect services
9. Inspect existing repositories/models
10. Inspect authentication
11. Inspect role checks
12. Inspect mock/temporary data
13. Inspect package manager
14. Inspect environment files
15. Inspect tests
16. Build an entity/field/relationship map
17. Produce affected-file list

No destructive changes.

## Phase 2 — Database

1. Add database connection
2. Add schema
3. Add migrations
4. Add indexes
5. Add constraints
6. Add seed data
7. Add environment variables

## Phase 3 — Backend

1. Models
2. Repositories
3. Services
4. Validation
5. Authentication
6. Authorization
7. Transactions
8. Error handling

## Phase 4 — API Integration

Replace mock data with database access.

Preserve existing frontend response shapes whenever possible.

Only update frontend API calls where required.

## Phase 5 — Tests

Run database and API workflow tests.

## Phase 6 — Verification

Run:
- Migration
- Seed
- Tests
- Lint
- Type checking
- Build

## Phase 7 — Documentation

Update README with:
- Requirements
- PostgreSQL setup
- Environment variables
- Installation
- Migration
- Seed
- Development server
- Tests
- Lint
- Type checking
- Production deployment

---

# 30. Important Implementation Constraint

The database design above is based on the supplied Project 4 specification.

It does NOT claim that every table or field is already present in the current Next.js/Express source.

Before implementing it against an existing project, inspect the actual source tree and preserve existing user changes.

Do not:
- Delete existing features
- Replace the frontend unnecessarily
- Replace an existing ORM without justification
- Reset a database
- Drop tables
- Remove existing user data
- Invent unsupported application features

Destructive schema changes require explicit approval.

---

# 31. Final Target Architecture

```text
                         ┌───────────────────┐
                         │   Next.js Client  │
                         └─────────┬─────────┘
                                   │
                              REST / JSON
                                   │
                         ┌─────────▼─────────┐
                         │ Express Backend   │
                         ├───────────────────┤
                         │ Authentication    │
                         │ Authorization     │
                         │ Validation        │
                         │ Controllers       │
                         │ Services          │
                         │ Repositories      │
                         └─────────┬─────────┘
                                   │
                         ┌─────────▼─────────┐
                         │    PostgreSQL     │
                         ├───────────────────┤
                         │ Users / RBAC      │
                         │ Creators           │
                         │ Storefronts        │
                         │ Products           │
                         │ Files / Versions   │
                         │ Licenses / DRM     │
                         │ Orders             │
                         │ Payments           │
                         │ Downloads          │
                         │ Reviews            │
                         │ Moderation         │
                         │ Affiliates         │
                         │ Promotions         │
                         │ Earnings / Payouts │
                         │ Audit Logs         │
                         └───────────────────┘
```

This is the target production architecture for Project 4. The actual implementation should be reconciled with the existing source code before migrations or API changes are made.
