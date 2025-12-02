-- Renvest MVP 2 PostgreSQL Database Schema
-- 'user' table is renamed to 'renvestuser' to avoid conflicts.

-- 1. Enum for User Roles
CREATE TYPE UserRole AS ENUM ('LANDLORD', 'TENANT', 'PROPERTYMANAGER');

-- 2. RenvestUser Table (Authentication and Profile)
-- Stored as 'renvestuser' in PostgreSQL.
CREATE TABLE renvestuser (
    -- Primary Key and Identity
    userId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,

    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    
    -- Role and Status
    role UserRole NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,

    -- Stripe Integration (Connected Account)
    stripeAccountId VARCHAR(255),
    
    -- Audit Timestamps
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Lease Table (The Contract)
-- Stored as 'lease' in PostgreSQL.
CREATE TYPE LeaseStatus AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELED');
CREATE TABLE lease (
    -- Primary Key and Contract Details
    leaseId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys to 'renvestuser' table
    landlordId UUID NOT NULL REFERENCES renvestuser(userId),
    tenantId UUID REFERENCES renvestuser(userId),
    
    -- Financial Details
    rentAmount DECIMAL(10, 2) NOT NULL,
    rewardPercent DECIMAL(4, 2) NOT NULL DEFAULT 2.00,
    platformFeePercent DECIMAL(4, 2) NOT NULL DEFAULT 1.00,
    
    -- Contract Terms
    startDate DATE NOT NULL,
    endDate DATE,
    paymentDay INT NOT NULL DEFAULT 1,
    
    -- Compliance and Authorization
    status LeaseStatus NOT NULL DEFAULT 'PENDING',
    isPadMandateSigned BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Stripe Integration
    stripeCustomerId VARCHAR(255),
    stripePaymentMethodId VARCHAR(255),
    
    -- Audit Timestamps
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Property Table (Address details)
-- Stored as 'property' in PostgreSQL.
CREATE TABLE property (
    propertyId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Foreign Key to 'renvestuser' table
    landlordId UUID NOT NULL REFERENCES renvestuser(userId),
    -- Foreign Key to 'lease' table
    leaseId UUID UNIQUE REFERENCES lease(leaseId),
    
    addressLine1 VARCHAR(255) NOT NULL,
    addressLine2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'CA',
    postalCode VARCHAR(10) NOT NULL,
    
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PaymentLedger Table (Ledger for Payments and Transfers)
-- Stored as 'paymentledger' in PostgreSQL.
CREATE TYPE TransactionType AS ENUM ('CHARGE', 'PAYOUT', 'REWARD', 'FEE');
CREATE TYPE TransactionStatus AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TABLE paymentledger (
    transactionId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys to 'lease' and 'renvestuser' tables
    leaseId UUID NOT NULL REFERENCES lease(leaseId),
    sourceUserId UUID REFERENCES renvestuser(userId),
    destinationUserId UUID REFERENCES renvestuser(userId),
    
    -- Financial Details
    amount DECIMAL(10, 2) NOT NULL,
    transactionType TransactionType NOT NULL,
    status TransactionStatus NOT NULL,
    
    -- Stripe Reference
    stripeChargeId VARCHAR(255),
    stripeTransferId VARCHAR(255),
    
    -- Audit Timestamps
    transactionDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);