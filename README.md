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
  
#### **CRUD** operations for users and companies

https://github.com/user-attachments/assets/f5d53534-e019-475d-9211-bb662a26808f

### Departments & Positions Panel
> Accessible only to users with `HRLeader` or `HRUser` roles
#### **CRUD operations for departmens** ( `HRLeader` role only)
  
https://github.com/user-attachments/assets/c652dbdd-1bbf-43c2-8bcb-0286a67b34f0

#### **CRUD operations for positions**

https://github.com/user-attachments/assets/c4117889-1a87-4599-849e-bace569adc68

- Adding a position involves going through a series of steps in which you provide details about the role, specify the characteristics of the ideal candidate, and (at your discretion) assign weights to the fields to be analyzed (technical skills, soft skills, certifications, etc.), which are then used to calculate the final score for each applicant. 
  
###  Main Panel
> Accessible only to users with `HRLeader` or `HRUser` roles

#### 🏠 Dashboard Tab

https://github.com/user-attachments/assets/468e112f-a3be-472a-811f-9b6a0cdaec9e

- This tab serves as a home page, and you also have the option to view statistics on applications. This tab displays statistics by position/department. If neither is selected, it shows company‑wide statistics.

#### 📤 Upload Tab

https://github.com/user-attachments/assets/88cbbab6-608c-4a95-a8ee-e5f4da160a0d

- On this tab, you can upload resumes either manually or automatically (via Gmail/Outlook integration). 
- Uploaded documents are sent to the evaluation service ( see this : [CVexplorer - Evaluation Service](https://github.com/Tudorr02/CVexplorer_EvaluationModel) ).
  
- Manual Upload
  - For manual uploads, you can add a single résumé as a PDF or multiple documents as an archive (.rar/.zip).
  - Once you select a document, you’ll also see its details along with the estimated evaluation time.

- Automatic Upload
  - For automatic uploads, once you’ve completed the integration steps, the following options become available:
   - Watch folder selection: Every email that arrives in the chosen folder will be processed automatically.
   - Create evaluation round: If you’d like to start a new round for applicants to the same position, choose this; otherwise, select an existing round to store the new applications.
   - Processed résumés: See how many résumés have been processed automatically to date.

- The Gmail/Outlook integrations also include:
  - Unsubscribe option: Stop the webhooks.
  - Disconnect option: Disable the integration.
  - Sync Connection option: Refresh the integration tokens’ expiration dates and display the résumés processed automatically.


#### 🌐 Explore Tab
> Accessible only to users with `HRLeader` or `HRUser` roles

https://github.com/user-attachments/assets/7de95fe5-4612-4b06-ac96-62b14f3c3983

- On this tab, you can view details for all uploaded documents—you can also search and filter them.
- You can view the candidate’s CV, as well as the similarity scores with a breakdown explaining how each field was scored.
- You can apply manual adjustments to the results returned by the automated evaluation service.
- Before saving any manual changes, you can preview the newly calculated score using the Recalculate button.
- The candidate’s final score is computed as: similarity score × position analysis field weight ( set on position creation , 3rd tab ).

#### 🔎 Evaluate Tab

https://github.com/user-attachments/assets/8a01f9de-a4c2-4112-bba4-7ceb7711fe32

- On this tab, you can view, filter, or delete evaluation rounds. An evaluation round is a collection of applications that will be further classified in the recruitment process.
- To delete a round, select the round you want and enter its last existing stage (to avoid accidentally removing the wrong round).
- Each round contains the applications awaiting evaluation.
- For each application you can: view its CV and score, and create notes about the candidate.
- Within any round, you can create custom evaluation stages—add as many stages as you like and name them as you wish.
- If you delete an evaluation stage, all applications in that stage are automatically moved to the last remaining stage.

### Other Features

https://github.com/user-attachments/assets/b7c77c4f-1208-4f1e-94a6-73ae42e41614

- **CRUD** operations for company users ( `HRLeader` role only)
- **Light/Dark** mode
- Account Details menu

## See also :

- **Backend Repo**: [CVexplorer - Backend](https://github.com/Tudorr02/CVexplorer_Backend)
- **Evaluation Service**: [CVexplorer - Evaluation Service](https://github.com/Tudorr02/CVexplorer_EvaluationModel)

