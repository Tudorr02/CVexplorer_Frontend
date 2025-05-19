import { Component, OnInit , ViewChild, inject } from '@angular/core';
import { PositionLevel } from '../../enums/position-level.enum';
import { EducationLevel } from '../../enums/education-level.enum';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Position } from '../../_models/position';
import { ActivatedRoute, Router } from '@angular/router';
import { PositionService } from '../../_services/position.service';
import { NotificationService } from '../../_services/notification.service';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectButton } from 'primeng/selectbutton';
import { FormArray, FormControl } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { LanguageService } from '../../_services/language.service';
import { DepartmentTreeEventService } from '../../_services/department-tree-event.service';
import { PositionTreeNode } from '../../_models/positionTreeNode';
import { Slider } from 'primeng/slider';
import { SliderModule } from 'primeng/slider';
@Component({
  selector: 'app-create-position',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    StepperModule,
    ButtonModule,
    CardModule,
    SelectButton,
    TextareaModule,
    MultiSelectModule,
    Slider,SliderModule,
    
  ],
  templateUrl: './create-position.component.html',
  styleUrl: './create-position.component.css'
})
export class CreatePositionComponent implements OnInit {
 
  
  
  positionForm!: FormGroup;
  departmentId!: number;
  positionLevels = this.mapEnumToOptions(PositionLevel);
  educationLevels =  this.mapEnumToOptions(EducationLevel);
  languages: { label: string; value: string }[] = [];

  step = 1;
  private languageService = inject(LanguageService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private positionService = inject(PositionService);
  private notificationService = inject(NotificationService);
  private tree = inject(DepartmentTreeEventService);

  weightFields: { key: keyof Position['weights']; label: string }[] = [
    { key: 'requiredSkills',   label: 'Required Skills' },
    { key: 'niceToHave',       label: 'Nice to Have' },
    { key: 'languages',        label: 'Languages' },
    { key: 'certifications',    label: 'Certifications' },
    { key: 'responsibilities', label: 'Responsibilities' },
    { key: 'experienceMonths', label: 'Experience (months)' },
    { key: 'level',            label: 'Position Level' },
    { key: 'minimumEducation', label: 'Minimum Education' },
  ];

  ngOnInit(): void {
    this.departmentId = Number(this.route.snapshot.paramMap.get('id'));
    console.log(this.departmentId);
    this.initForm();
    this.loadLanguages();
  }

  loadLanguages() {
    this.languageService.getLanguages().subscribe({
      next: (languages) => {
        this.languages = languages;
      },
      error: () => {
        this.notificationService.showError('Failed to load languages');
        console.error('Failed to load languages');
      }
    });
  }
  mapEnumToOptions(enumObj: any): { label: string, value: string }[] {
    return Object.values(enumObj).map(value => ({
      label: value as string,
      value: value as string
    }));
  }

  initForm() {
    this.positionForm = this.fb.group({
          // Step 1
      name: ['', Validators.required],
      level: [PositionLevel.Intern],
      responsibilities: this.fb.array([this.fb.control('')]),

      // Step 2
      requiredSkills: [''],
      minimumExperienceMonths: [0, [Validators.required, Validators.min(0)]],
      minimumEducationLevel: [EducationLevel.HighSchool],
      // Step 3
      niceToHave: [''],
      languages: [[]],
      certifications: [''],
      weights: this.fb.group({
        requiredSkills:   [40,  [Validators.min(0), Validators.max(100)]],
        niceToHave:       [10,  [Validators.min(0), Validators.max(100)]],
        languages:        [10,  [Validators.min(0), Validators.max(100)]],
        certifications:    [30,  [Validators.min(0), Validators.max(100)]],
        responsibilities: [10,  [Validators.min(0), Validators.max(100)]],
        experienceMonths: [0,   [Validators.min(0), Validators.max(100)]],
        level:            [0,   [Validators.min(0), Validators.max(100)]],
        minimumEducation: [0,   [Validators.min(0), Validators.max(100)]],
      }, {
        validators: this.sumValidator
      })
    });
  }

  private sumValidator(group: FormGroup) {
    const total = Object.values(group.value)
                       .reduce((acc: number, v) => acc + Number(v), 0);
    return total === 100
      ? null
      : { sumNotOne: true };
  }
  get responsibilities(): FormArray {
    return this.positionForm.get('responsibilities') as FormArray;
  }
  addResponsibility() {
    this.responsibilities.push(this.fb.control(''));
  }

  onSubmit() {
    if (this.positionForm.invalid) {
      this.positionForm.markAllAsTouched();
      return;
    }

    const dto: Position = {
      ...this.positionForm.value,
      requiredSkills: this.splitByComma(this.positionForm.value.requiredSkills),
      niceToHave: this.splitByComma(this.positionForm.value.niceToHave),
      certifications: this.splitByComma(this.positionForm.value.certifications),
      weights:         this.positionForm.value.weights
    };

    this.positionService.createPosition(this.departmentId, dto).subscribe({
      next: (newPosition : Position) => {
        
        this.tree.addPositionToTree({
          departmentId: this.departmentId,
          position: {publicId : newPosition.publicId! , name : newPosition.name} as PositionTreeNode
        });
        this.notificationService.showSuccess('Position created successfully');
        this.router.navigate(['/dashboard']); // sau oriunde vrei să redirecționezi
      },
      error: () => {
        this.notificationService.showError('Failed to create position');
      }
    });
  }

  splitByComma(value: string | null): string[] {
    return value ? value.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  }

  goToStep(step: number, activate: (step: number) => void) {
    let fields: string[] = [];
    
    switch (step) {
      case 2:
        // Venim din step 1
        fields = ['name', 'level', 'responsibilities'];
        break;
      case 3:
        // Venim din step 2
        //fields = ['requiredSkills', 'minimumExperienceMonths', 'minimumEducationLevel'];
        //fields = this.weightFields.map(f => `weights.${f.key}`);

        break;
      // case 4:
      //   // validate each weight control
      //   fields = this.weightFields.map(f => `weights.${f.key}`);
      //   break;
      default:
        break;
    }
  
    fields.forEach(f => this.positionForm.get(f)?.markAsTouched());
    // const weightsValid = step !== 4 || this.positionForm.get('weights')?.valid;
    const weightsValid = true; // this.positionForm.get('weights')?.valid;
    const isValid = fields.every(f => this.positionForm.get(f)?.valid);
    if (isValid && weightsValid) {
      activate(step);
    }
  }
  


  onListInput(fieldName: keyof Position, event: FocusEvent) {
    const input = (event.target as HTMLInputElement).value;
  
    // Split by comma, trim each item, and remove empty values
    const values = input
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  
    // Set the array back to the form control
    this.positionForm.get(fieldName)?.setValue(values);
  }
  
  removeResponsibility() {
    const total = this.responsibilities.length;
  
    if (total > 1) {
      this.responsibilities.removeAt(total - 1); // removes the last one
    } else {
      this.notificationService.showWarning('At least one responsibility is required');
    }
  }
  

}
