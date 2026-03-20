# Sebenza Accounts App – How to Use

This guide explains the main screens and the recommended workflow to record accounting data in **Sebenza Accounts**.

## 1) Before you start

1. Ensure your Supabase environment variables are set for the Accounts app.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. If you want to upload photos/attachments:
   - Create a Supabase Storage bucket (default expected: `accounting-attachments`)
   - Ensure the bucket is **public** (so the app can render public URLs).

## 2) Navigation (left menu / sections)

Use the sidebar sections to move between modules:

- **Dashboard**: overview + quick indicators
- **Material Purchases**: weighbridge tickets / material intake (+ photos)
- **Suppliers**: supplier master data
- **Pricing**: material pricing (base price, adjustments, effective dates)
- **Inventory (Bales & Lots)**: inventory lots created from processed materials
- **Invoices**: create and manage sales invoices
- **Bills**: create and manage payable bills
- **Payments**: record payments against invoices
- **Banking & Accounts**: track bank accounts and reconciliation settings
- **Reports**: generate financial reporting summaries

## 3) Suppliers (Master Data)

Use **Suppliers** first, because other screens reference suppliers.

1. Open **Suppliers**
2. Click **New Supplier**
3. Enter required details (e.g. `Name`, KYC status, payment method, credit limits)
4. Click **Save** (or update using the edit action from the table)

Tip: Keep `status` clean:
- `active` for suppliers you actively use
- `inactive` for suppliers you no longer want to select

## 4) Material Purchases (Weighbridge Tickets)

Use **Material Purchases** to record intake measurements and supporting evidence.

1. Open **Material Purchases**
2. Click **New Purchase**
3. Fill in ticket details:
   - Supplier
   - Material
   - Grade
   - Gross/Tare/Net weights and contamination
   - Date and vehicle/location details (where available)
4. Save actions:
   - **Save Draft** (keep it in draft state)
   - **Save & Send / Save & Process** (submit for processing)
5. Add **Photos** under the Attachments/Photos tab (if enabled)

Tip: Attachments are stored in Supabase Storage and saved as URLs to the record.

## 5) Material Pricing (Pricing Tiers)

Use **Pricing** to define how a material grade is priced and how adjustments are applied.

1. Open **Pricing / Material Pricing**
2. Click **New Pricing**
3. Use the tabs in the form:
   - **Details**: Material, Grade, Base Price, Price Tier
   - **Adjustments**: Moisture Adjustment (%) and Contamination Deduction (%)
   - **Price Tiers**:
     - Supplier Specific (optional)
     - Customer Specific (optional)
   - **Dates**:
     - Effective Date
     - Review Date
   - **Notes**: internal notes
4. Click:
   - **Save Draft** to create/update as draft
   - **Save & Activate** to make it active

Pricing rules in the UI:
- The app displays the **net price** calculation using base price + moisture and contamination adjustments.

## 6) Invoices

Use **Invoices** for customer billing.

1. Open **Invoices**
2. Click **New Invoice**
3. Fill in **Client & Billing Information**:
   - Client name (or select saved client)
   - Invoice number, dates, and invoice details
4. Go to **Items**:
   - Add invoice line items (quantity, unit price, description)
5. Go to **Notes**:
   - Add internal notes/terms if needed
6. Actions:
   - **Save Draft**
   - **Save & Send** (or Activate/Send depending on your UI labels)

Invoice actions:
- Edit using the pencil/edit icon
- Delete using the delete icon in the table Actions column
- Download PDF using the download icon

## 7) Bills

Use **Bills** to record payables.

1. Open **Bills**
2. Click **New Bill**
3. Enter:
   - Vendor
   - Amount
   - Due date
   - Optional description/category
4. Save

## 8) Payments

Use **Payments** to record payments against invoices.

1. Open **Payments**
2. Click **Record Payment**
3. Fill in:
   - Payment date
   - Amount
   - Reference number
   - Status (draft/completed/failed)
   - Payment method
4. Optionally link to an invoice (Invoice ID / Number)
5. Add:
   - **Bank Account** selection (optional)
   - **Internal Notes**
   - **Attachments** (upload files and save them to the record)
6. Actions:
   - **Save Draft**
   - **Save & Record**

## 9) Banking & Accounts

Use **Banking & Accounts** to track bank accounts and reconciliation settings.

1. Open **Banking & Accounts**
2. Click **Add Account**
3. Complete the tabs:
   - **Details**: Account name and type
   - **Banking**: Bank name, account number, branch code, SWIFT
   - **Balance**: Opening balance and “as of” date
   - **Reconciliation**: last reconciled date and frequency
   - **Notes**: internal notes
4. Actions:
   - **Save Draft**
   - **Save & Activate**

## 10) Reports

Use **Reports** to review summaries between dates (e.g. invoice totals, expense breakdowns).

General steps:
1. Select the date range
2. Review metrics in the report UI
3. Use Export options (CSV/PDF where enabled)

## 11) Troubleshooting

### Attachments don’t upload
1. Confirm the Storage bucket exists and is public
2. Confirm Vercel/Local env var `NEXT_PUBLIC_SUPABASE_ATTACHMENTS_BUCKET` (only if you used a non-default bucket name)
3. Check the browser console for upload errors

### Data not saving
1. Verify you clicked a **Save** button (Draft or Activate/Record)
2. Try **Refresh** in that module
3. Confirm Supabase tables exist and you ran the SQL migrations from `apps/accounts-app/sql/`

---

If you want, tell me which user role you’re writing this for (admin, finance clerk, manager) and I can rewrite the guide to match their exact workflow and reduce any “technical” details.

