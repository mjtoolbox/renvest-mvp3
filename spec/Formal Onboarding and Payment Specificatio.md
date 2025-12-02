# Renvest Formal Onboarding and Payment Specification

This document provides a detailed, formalized specification of the Renvest platform's user onboarding, authorization protocols, and multi-party payment execution workflow, utilizing the **Stripe Connect Express** architecture.

## I. Foundational Architecture Principles

The execution of financial transactions on the Renvest platform is governed by three foundational principles:

1. **Platform Authority:** Renvest operates as the central Platform Account, leveraging its primary Stripe API key to manage and control the movement of funds.

2. **Connected Account Structure:** All primary participants, specifically the Landlords and Tenants, are established as distinct **Express Connected Accounts** (identified by unique `acct_...` identifiers) within the Stripe ecosystem.

3. **Data Centrality:** The authoritative data regarding lease agreements, property addresses, and financial terms is maintained exclusively within the Renvest relational database.

## II. Onboarding and Authorization Protocol (Active Status Attainment)

The user enrollment process is initiated by the Landlord and culminates in the Tenant providing mandatory financial authorization, leading to the **Active** status of the Lease Agreement.

### Phase A: Landlord Initiation and Lease Creation (The Initiator)

| **Step** | **User Action / Component** | **Backend System Operation** | **Stripe Artifact Created** | 
| :---: | :---: | :---: | :---: |
| 1 | Landlord completes the user registration process. | The system stores the user profile and essential contact information within the database. | \- | 
| 2-3 | Landlord executes the "Connect to Stripe to Get Paid" directive. | The backend invokes the Stripe API to establish the Landlord's Connected Account and generates the requisite onboarding link. | `acct_LANDLORD` (Express Connected Account) | 
| 4 | Landlord submits the necessary Know Your Customer (KYC) and banking documentation via the Stripe interface. | Stripe validates the submitted information, and the platform updates the database to reflect the Landlord's status as **Enabled for Payouts**. | Landlord is **Enabled for Payouts**. | 
| 5 | **Landlord formalizes the Lease Agreement.** | The system captures the property address, rent valuation, and the Tenant's electronic mail address, creating a lease record with a **'Pending'** status. | \- | 

### Phase B: Tenant Authorization and Activation (The Payer's Consent)

| **Step** | **User Action / Component** | **Backend System Operation** | **Stripe Artifact Created** | 
| :---: | :---: | :---: | :---: |
| 6-7 | Tenant initiates sign-up via the provided invitation link and connects a banking institution. | The system associates the Tenant with the lease and establishes a corresponding Stripe Connected Account. | `acct_TENANT` (Express Connected Account) | 
| 8 | Tenant enters banking details for the purpose of reward disbursements. | Stripe performs necessary verification, confirming the Tenant's status as **Enabled for Payouts**. | Tenant is **Enabled for Payouts**. | 
| 9-10 | **Mandatory: Electronic Signature of Lease and PAD Mandate.** | The Tenant digitally executes the lease document, which formally includes the **Pre-Authorized Debit (PAD) Mandate**. This constitutes the legal consent for monthly debiting. | `cus_TENANT` (Customer Object) and saved `pm_TENANT_BANK` (Payment Method) | 
| 11 | All required authorizations are secured. | The system transitions the Lease status in the database from 'Pending' to **'Active,'** thereby enabling scheduled payment processing. | \- | 

## III. Scheduled Monthly Payment Execution

The monthly rent collection is executed via an automated backend process utilizing the **Stripe Destination Charge** mechanism, enabling a multi-party fund distribution from a single transaction.

**Scenario for Financial Distribution:** Rent of \$2,000.00

| **Participant Role** | **Net Amount** | **Transaction Impact** | 
| :---: | :---: | :---: |
| **Tenant** | \-\$2,000.00 | Debit applied to the authorized bank account. | 
| **Landlord** | +\$1,940.00 | Net rent is transferred directly to the Landlord's Connected Account (after all fees/rewards are deducted). | 
| **Renvest Platform** | +\$60.00 | The fee and reward pool is provisionally held in the Platform's balance. | 

### The Destination Charge Mechanism

The system initiates a unified API call that concurrently executes two primary actions:

1. **Charging the Source:** The Tenant's saved bank account (`pm_TENANT_BANK`) is debited for the full gross rent amount.

2. **Transferring the Destination Payout:** In the same atomic action, the Landlord's net payment (\$1,940.00) is transferred directly to their Connected Account (`acct_LANDLORD`).

The residual amount, which totals \$60.00 (comprising the $40.00 Tenant Reward and the $20.00 Renvest net fee), is subsequently retained within the Renvest Platform's balance. This mechanism effectively achieves the necessary funds split at the point of charge.

**Note on Reward Disbursement:** In a production environment, this initial process is immediately succeeded by a second, independent transfer API call designed to disburse the \$40.00 reward from the Platform's balance to the Tenant's Connected Account (`acct_TENANT`). The MVP 2 mock API environment simulates this two-step ledger process for validation purposes.


## Internal API (Data Management)
|

| Path | Method | Purpose | Notes (Updated) |
| /api/users/onboard/$$role$$

 | POST | Handles Renvest user creation and initial Mock Stripe Account creation. | Creates a Mock acct_ID in DB. |
| /api/contracts | POST | Landlord creates a new Contract (used by Landlord form). | Status is PENDING. Sends invite to Tenant. |
| /api/contracts/\$$id\\$$/accept | POST | Updates Contract.status to ACTIVE. | CRITICAL: Requires Tenant e-signature and PAD Mandate acceptance before activating. |
| /api/contact | POST | Accepts {name,email,role} from the site "Join" modal. | Unchanged. |

## External Mock Payment System (Goal: Rent Payment Simulation - Revised)

The following APIs are crucial for the PoC. They must simulate the Stripe Destination Charge process with two distinct calls.

| Path | Method | Purpose | Implementation Logic (Must adhere to this) |
| /api/mock-payment/charge | POST | Simulates the Tenant Debit and Landlord Payout (Destination Charge). | Input: { contractId, tenantAccountId, landlordAccountId, grossAmount, landlordPayoutAmount }. 1. Saves a single Transaction entry (e.g., $2000) with status: PENDING. 2. Randomly determines success (90%) or failure (10%). 3. If SUCCESS, immediately updates the Transaction status and records the $60.00 fee/reward pool as collected by Renvest. |
| /api/mock-payment/reward-transfer | POST | Simulates the Tenant Reward Transfer. | Input: { contractId, tenantAccountId, rewardAmount }. 1. Requires the successful completion of /api/mock-payment/charge. 2. Saves a second Transaction entry (e.g., $40.00) with status: PENDING/SUCCESS/FAILED. 3. Reduces the mock Renvest balance and increases the mock Tenant balance. |