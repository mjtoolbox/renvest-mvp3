-- Renvest MVP 2 PostgreSQL Database Schema
-- Convention: PascalCase for table names, camelCase for column names.

-- 1. Enum for User Roles
-- Used in the User table to enforce role-based access control.
CREATE TYPE UserRole AS ENUM ('LANDLORD', 'TENANT', 'PROPERTYMANAGER');

-- 2. User Table (Authentication and Profile)
-- Stores core user identity and links to their Stripe Connected Account.
CREATE TABLE "User" (
    -- Primary Key and Identity
    userId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL, -- Stored securely

    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    
    -- Role and Status
    role UserRole NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,

    -- Stripe Integration (Connected Account)
    stripeAccountId VARCHAR(255), -- acct_... ID for Payouts (Landlord) or Rewards (Tenant)
    
    -- Audit Timestamps
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Lease Table (The Contract)
-- Stores the details of the rental agreement and links the two parties.
CREATE TYPE LeaseStatus AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELED');
CREATE TABLE "Lease" (
    -- Primary Key and Contract Details
    leaseId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys to User Table (Mandatory for the flow)
    landlordId UUID NOT NULL REFERENCES "User"(userId),
    tenantId UUID REFERENCES "User"(userId), -- Null until the tenant accepts the invitation
    
    -- Financial Details
    rentAmount DECIMAL(10, 2) NOT NULL, -- e.g., 2000.00
    rewardPercent DECIMAL(4, 2) NOT NULL DEFAULT 2.00, -- e.g., 2.00%
    platformFeePercent DECIMAL(4, 2) NOT NULL DEFAULT 1.00, -- e.g., 1.00%
    
    -- Contract Terms
    startDate DATE NOT NULL,
    endDate DATE,
    paymentDay INT NOT NULL DEFAULT 1, -- Day of the month rent is due (1-28)
    
    -- Compliance and Authorization
    status LeaseStatus NOT NULL DEFAULT 'PENDING',
    isPadMandateSigned BOOLEAN NOT NULL DEFAULT FALSE, -- CRITICAL: Confirms Tenant PAD Authorization
    
    -- Stripe Integration (Tenant Customer and Payment Method)
    stripeCustomerId VARCHAR(255), -- cus_... ID for the Tenant Payer
    stripePaymentMethodId VARCHAR(255), -- pm_... ID (e.g., Bank Account)
    
    -- Audit Timestamps
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Property Table (Address details)
-- Stores the physical property details. Linked to the lease contract.
CREATE TABLE "Property" (
    propertyId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlordId UUID NOT NULL REFERENCES "User"(userId),
    leaseId UUID UNIQUE REFERENCES "Lease"(leaseId),
    
    addressLine1 VARCHAR(255) NOT NULL,
    addressLine2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(50) NOT NULL, -- e.g., 'BC', 'ON'
    country VARCHAR(50) NOT NULL DEFAULT 'CA',
    postalCode VARCHAR(10) NOT NULL,
    
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Transaction Table (Ledger for Payments and Transfers)
-- Tracks every financial movement, including charges, payouts, fees, and rewards.
CREATE TYPE TransactionType AS ENUM ('CHARGE', 'PAYOUT', 'REWARD', 'FEE');
CREATE TYPE TransactionStatus AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TABLE "Transaction" (
    transactionId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    leaseId UUID NOT NULL REFERENCES "Lease"(leaseId),
    sourceUserId UUID REFERENCES "User"(userId), -- Payer (Tenant for CHARGE)
    destinationUserId UUID REFERENCES "User"(userId), -- Recipient (Landlord for PAYOUT, Tenant for REWARD)
    
    -- Financial Details
    amount DECIMAL(10, 2) NOT NULL,
    transactionType TransactionType NOT NULL,
    status TransactionStatus NOT NULL,
    
    -- Stripe Reference
    stripeChargeId VARCHAR(255), -- Reference to the main Stripe Charge ID (for CHARGE/PAYOUT)
    stripeTransferId VARCHAR(255), -- Reference for the Tenant Reward Transfer (for REWARD)
    
    -- Audit Timestamps
    transactionDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: In a production environment, you would add indexes for foreign keys (e.g., ON "Lease" (landlordId), ON "Transaction" (leaseId)) and more robust `updatedAt` triggers.