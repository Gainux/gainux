# ERP Bugs Report

Generated: 2026-03-13

---

## Bug 1: Fire-and-forget profile update (no error handling)
**File:** `src/context/AuthContext.tsx:79`
**Category:** Missing error handling
**Description:** `supabase.from('profiles').update(...)` is called without `await` and without `.catch()`. Failures are silently swallowed, leading to inconsistent profile data with no indication to the user or logs.

---

## Bug 2: Invalid field passed to `createCompany()` in `convertLead()`
**File:** `src/modules/crm/services/crmService.ts:207`
**Category:** Wrong field / type mismatch
**Description:** `convertLead()` passes `source: lead.source` to `createCompany()`, but the `Company` type does not have a `source` field. The field is silently ignored or causes a type error.

---

## Bug 3: Null dereference — `userProfile` used without null check
**File:** `src/modules/crm/services/crmService.ts:352, 477, 514`
**Category:** Null/undefined dereference
**Description:** `userProfile?.org_id` is used in insert operations without first verifying `userProfile` is non-null. If the profile query returns null, `org_id` is inserted as `null`, violating RLS and FK constraints.

---

## Bug 4: Race condition — dialog closes before payslip generation completes
**File:** `src/modules/hrm/pages/PayrollPage.tsx:82-95`
**Category:** Race condition
**Description:** `toast.promise()` starts `generatePayslips()` but the dialog is closed and `loadRuns()` is called on line 95 immediately, before the promise resolves. The UI shows stale data and the run status is incorrect.

---

## Bug 5: Null dereference on invoice `org_id`
**File:** `src/modules/finance/services/invoiceService.ts:164`
**Category:** Null/undefined dereference
**Description:** `const orgId = inv?.org_id` is used in subsequent inserts without verifying `inv` is non-null. If the invoice query fails or returns nothing, `orgId` is `undefined` and the subsequent database operation fails silently.

---

## Bug 6: No validation of RPC return value used as `invoice_number`
**File:** `src/modules/finance/services/invoiceService.ts:97`
**Category:** Type mismatch / missing validation
**Description:** `invoiceNumberData` from an RPC call is used directly as `invoice_number` in an insert without validating it is a non-null string, risking a type or constraint error at the database level.

---

## Bug 7: Unreachable else-if branch — duplicate condition
**File:** `src/modules/finance/services/invoiceService.ts:288, 320`
**Category:** Logic error
**Description:** The condition `if (invoice.taxAmount > 0)` appears on line 288 and again in `else if (invoice.taxAmount > 0)` on line 320. The second branch is unreachable — if `taxAmount > 0` the first branch always executes.

---

## Bug 8: Null `org_id` silently inserted in `createDeal()`
**File:** `src/modules/crm/services/crmService.ts:286`
**Category:** Null/undefined dereference
**Description:** `userProfile?.org_id` is used in `createDeal()` without a null guard. If `userProfile` is null, `org_id` is inserted as `null`, violating database constraints.

---

## Bug 9: Payslip insert errors silently swallowed in loop
**File:** `src/modules/hrm/services/payrollService.ts:194-236`
**Category:** Missing error handling
**Description:** Inside `generatePayslips()`, a failed `supabase.from('payslips').insert(...)` for one employee does not throw — the loop continues and the function returns an incomplete array with no indication of partial failure.

---

## Bug 10: `loadRuns()` called before `generatePayslips()` resolves
**File:** `src/modules/hrm/pages/PayrollPage.tsx:71-95`
**Category:** Race condition
**Description:** `loadRuns()` is triggered immediately after initiating `generatePayslips()` via `toast.promise()`. Because the promise hasn't resolved yet, the fetched run still shows "draft" status instead of "completed".

---

## Bug 11: Non-null assertion on potentially undefined `orgId`
**File:** `src/modules/finance/pages/CreateInvoice.tsx:44-48`
**Category:** Null/undefined dereference
**Description:** `useEffect` calls `getTaxRates(orgId!)` but `orgId` can be `undefined` when the effect first runs. The non-null assertion suppresses TypeScript's error but does not prevent a runtime failure.

---

## Bug 12: Inconsistent `parseFloat()` usage on numeric fields
**File:** `src/modules/finance/services/invoiceService.ts:34-45`
**Category:** Type mismatch
**Description:** `parseFloat()` is applied to fields that the database already returns as numbers. While functionally harmless today, floating-point precision issues can arise and the inconsistency makes the code fragile.

---

## Bug 13: Wrong field name in expense date filter (`date` vs `expense_date`)
**File:** `src/modules/overview/services/dashboardService.ts:136`
**Category:** Logic error
**Description:** Analytics data filtering uses `exp.date`, but the database field is `expense_date`. The comparison always evaluates to `undefined`, causing expense data to be excluded from analytics results.

---

## Bug 14: `iframeDoc.open()` called without null guard
**File:** `src/modules/finance/pages/InvoiceDetails.tsx:79-88`
**Category:** Null/undefined dereference
**Description:** `iframeDoc` is assigned from `iframe.contentDocument || iframe.contentWindow?.document`. If both are null, `iframeDoc.open()` on line 88 throws a TypeError. The existing error check is insufficient.

---

## Bug 15: `setIsSubmitting(false)` called before async operation finishes
**File:** `src/modules/hrm/pages/PayrollPage.tsx:74`
**Category:** Race condition
**Description:** `setIsSubmitting(false)` is called before `toast.promise()` (and the underlying `generatePayslips()`) completes. This allows the user to submit the payroll form again while the first run is still in progress, causing duplicate requests.

---

## Summary

| # | File | Category |
|---|------|----------|
| 1 | `src/context/AuthContext.tsx` | Missing error handling |
| 2 | `src/modules/crm/services/crmService.ts` | Wrong field / type mismatch |
| 3 | `src/modules/crm/services/crmService.ts` | Null dereference |
| 4 | `src/modules/hrm/pages/PayrollPage.tsx` | Race condition |
| 5 | `src/modules/finance/services/invoiceService.ts` | Null dereference |
| 6 | `src/modules/finance/services/invoiceService.ts` | Type mismatch |
| 7 | `src/modules/finance/services/invoiceService.ts` | Logic error |
| 8 | `src/modules/crm/services/crmService.ts` | Null dereference |
| 9 | `src/modules/hrm/services/payrollService.ts` | Missing error handling |
| 10 | `src/modules/hrm/pages/PayrollPage.tsx` | Race condition |
| 11 | `src/modules/finance/pages/CreateInvoice.tsx` | Null dereference |
| 12 | `src/modules/finance/services/invoiceService.ts` | Type mismatch |
| 13 | `src/modules/overview/services/dashboardService.ts` | Logic error |
| 14 | `src/modules/finance/pages/InvoiceDetails.tsx` | Null dereference |
| 15 | `src/modules/hrm/pages/PayrollPage.tsx` | Race condition |
