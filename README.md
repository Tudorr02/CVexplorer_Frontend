# CVexplorer Frontend
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)

<img width="272" height="87" alt="CVexplorerDark" src="https://github.com/user-attachments/assets/053470d8-a8fd-4a8d-9a36-9ce057f47601" />

## Description
CVexplorer is a web platform that automates and simplifies the candidate selection process for job openings within companies. With this application, HR department employees can significantly reduce the time spent on manual CV evaluation and eliminate subjectivity from the selection process.

## Technologies Used
- **Angular** (v19.1.4) with TypeScript  
- **Tailwind CSS** for utility-first styling  
- **PrimeNG** for modern UI components and data visualization
- **Node.js** (v22.14.0) as runtime environment and package manager  


## Angular Features Used
- **Custom Directives**: implementing reusable UI behaviors via Angular directive classes.  
- **Signals**: leveraging Angular Signals for reactive state management in components.  
- **HTTP Interceptors**: centralizing request/response handling for auth tokens and error processing.  
- **Routing & Guards**: defining routes with `@angular/router` and protecting routes with `CanActivate` guards.  
- **Reactive Forms**: using `ReactiveFormsModule` for model-driven forms with dynamic validation.  
- **Template-driven Forms**: utilizing `FormsModule` for simpler two-way-bound forms.  
- **RxJS**: using reactive streams and operators for event handling, data transformation, and HTTP call management.

## Project Structure
    src/
    ├── app/
    │   ├── components/        # Reusable UI components
    │   ├── services/          # Business logic & HTTP services
    │   ├── models/            # Data interfaces & DTOs
    │   ├── guards/            # Route protection logic
    │   ├── directives/        # Custom DOM behaviors
    │   ├── interceptors/      # HTTP request/response handlers
    │   └── admin/             # Admin features ( components )
    └── assets/                # Fonts, PrimeNG custom preset
    public/                    # Application logos & icons

## Application Features

### Login
https://github.com/user-attachments/assets/39a85f95-1c14-4955-ade1-cda723a77a6b

- Users cannot self-register; only company moderators or HR leaders can create accounts.
- Upon logging in, a JWT token is issued to authorize all subsequent backend interactions.


### Admin Panel
> Accessible only to users with `Admin` or `Moderator` roles
  
- **CRUD** operations for users
- **CRUD** operations for companies

https://github.com/user-attachments/assets/f5d53534-e019-475d-9211-bb662a26808f

### Departments & Positions Panel
> Accessible only to users with `HRLeader` or `HRUser` roles
- **CRUD operations for departmens** ( `HRLeader` role only)
  
https://github.com/user-attachments/assets/c652dbdd-1bbf-43c2-8bcb-0286a67b34f0

