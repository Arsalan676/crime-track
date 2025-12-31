# CrimeTrack 

CrimeTrack is a MERN-based crime reporting and management system that lets citizens submit incidents online (with location) and track case status, while giving police/admins a dashboard to verify and manage reports efficiently.  It reduces the need for physical station visits and improves transparency with real-time status tracking and SMS confirmations. 

## Why CrimeTrack?

Traditional crime reporting is often slow, manual, and lacks visibility for citizens after submission.  CrimeTrack digitizes the workflow with centralized storage, structured verification, and map-based reporting to help authorities respond faster and citizens stay informed. 

## Key Features

### Citizen (User) Portal
-	Secure registration/login as a citizen. 
-	Report a crime with type, description, and location selection via map/GPS/search. 
-	OTP-based mobile verification before reporting (security + authenticity). 
-	SMS confirmation on successful report submission (report ID included). 
- Real-time report status tracking from the user side. 
  
### Admin (Police) Portal
-	Admin dashboard to view and manage submitted reports. 
-	Verify reports and approve/reject them, with status updates. 
-	Map view + heatmap visualization to understand incident distribution and density.
  
## Tech Stack

### Frontend 
- React.js
- HTML5, Tailwind CSS

### Backend 
- Node.js
- Express (API)
- MongoDB with Mongoose ODM (schemas/validation/data operations). 
  
