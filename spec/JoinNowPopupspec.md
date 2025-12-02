# Lead Capture & Role Segmentation (Join Now Pop-up) Specification

This specification defines the requirements for the initial **"Join Now"** lead capture screen, which is designed to segment users by their intended role (Landlord, Tenant, or Property Manager) and correctly route them into the Renvest onboarding workflow.

## 1. Screen Function and Scenario

**Primary Function:** To collect essential contact information and determine the user's role to initiate the appropriate sign-up or contact sequence.

**Scenario Constraint:** The system operates on a Landlord-first model. Tenants are onboarded via an **invitation** from an existing Landlord/Property Manager.

## 2. Required Data Collection Fields

Users will click "Join Now" button. The pop-up form is to send newsletter, different from sign up. It must be concise and collect the following mandatory fields:

| Field Name | Type | Purpose | Validation | 
 | ----- | ----- | ----- | ----- | 
| **Full Name** | Text | Lead identification and personalization. | Required, Minimum 3 characters. | 
| **Email Address** | Email | Primary identifier and communication channel. | Required, Must be a valid email format. | 
| **Intended Role** | Radio/Select | Crucial for routing logic. | Required, Must select one option. | 

**Intended Role Options:**

* Landlord (Owns/Manages property)

* Tenant (Pays rent, receives rewards)

* Property Manager (Manages units for multiple owners)

## 3. Post-Submission Routing Logic

Upon clicking the "Sign Up" button, the system must process the collected data and execute routing logic based on the selected role.

| Selected Role | Routing Action | Required System Response / Message | 
 | ----- | ----- | ----- | 
| **Landlord** | Route to **Account Creation**. | Direct the user to the full registration form (`/signup?role=landlord`). This immediately begins the formal onboarding process (Step 1 of the Landlord Flow). | 
| **Property Manager** | Route to **Account Creation**. | Direct the user to the full registration form (`/signup?role=pm`). PMs follow the Landlord's account creation flow. | 
| **Tenant** | Route to **Information/Blocker** screen. | Display a message clearly stating: "Tenants must be invited by their landlord to join Renvest. Please wait for an invitation email from your property manager or ask them to sign up first." | 

## 4. Backend Action (`/api/contact` Endpoint)

Regardless of the routing outcome, the system must perform the following actions via a dedicated API route (e.g., `/api/contact`):

1. **Duplicate Check:** Check if the email already exists in the `User` table or a `Leads` table. If so, return a success message but do not create a new lead entry.

2. **Lead Capture:** If the email is new, insert the `{name, email, role}` data into a dedicated `Leads` table (or log the request) for follow-up marketing purposes.

## 5. UI/UX Considerations

* The pop-up should be visually clean, centered, and fully responsive.

* The title must be clear: e.g., "Join Renvest: Let's Get Started"

* The submission button text should dynamically change based on the role selected: e.g., 'Start Onboarding' for Landlord/PM and 'Continue' for Tenant (before the blocker message displays).

* Error messages (e.g., "Invalid Email") must appear inline and be user-friendly.

**End of Specification**
