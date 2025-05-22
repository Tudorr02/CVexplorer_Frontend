import { Component, OnInit , ViewChild, inject } from '@angular/core';
import { PositionLevel } from '../../enums/position-level.enum';
import { EducationLevel } from '../../enums/education-level.enum';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Position , ScoreWeights } from '../../_models/position';
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
import { Observable } from 'rxjs';
import { Knob } from 'primeng/knob';
import { KnobModule } from 'primeng/knob';
import { TagModule } from 'primeng/tag';
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
    KnobModule    
  ],

  templateUrl: './create-edit-position.component.html',
  styleUrl: './create-edit-position.component.css'
})
export class CreateEditPositionComponent implements OnInit {
 
  
  
  positionForm!: FormGroup;
  isEditMode = false;
  private departmentId!: number;
  private positionId!: string;
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
  private treeService = inject(DepartmentTreeEventService);

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
    this.initForm();

    this.route.params.subscribe(params => {
      this.departmentId = params['id'] || undefined;
      this.positionId = params['publicId'] || undefined;
      if(this.positionId){
        this.isEditMode = true;
        this.loadPosition(this.positionId);
      }
    }); 
    this.loadLanguages();

    const weightsGroup = this.positionForm.get('weights') as FormGroup;
    weightsGroup.valueChanges.subscribe(vals => {
      const sum = Object
        .entries(vals)
        .filter(([key]) => key !== 'totalWeight')
        .reduce((acc, [, v]) => acc + Number(v), 0);
      // push into totalWeight _without_ retriggering valueChanges
      weightsGroup.get('totalWeight')!
                  .setValue(sum, { emitEvent: false });
    });

  }

  get sumWeights(): number {
    const w = (this.positionForm.get('weights')!.value as Record<string,number>);
    return Object.values(w).reduce((a,b) => a + b, 0);
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

  private initForm() {
    this.positionForm = this.fb.group({
      // Step 1
      name: ['', Validators.required],
      level: [PositionLevel.Intern],
      responsibilities: this.fb.array([this.fb.control('')]),

      // Step 2
      requiredSkills: [''],
      minimumExperienceMonths: [0, [Validators.required, Validators.min(0)]],
      minimumEducationLevel: [EducationLevel.HighSchool ],
      niceToHave: [''],
      languages: [[]],
      certifications: [''],

      // Step 3
      weights: this.fb.group({
        requiredSkills:   [40,  [Validators.min(0), Validators.max(100)]],
        niceToHave:       [10,  [Validators.min(0), Validators.max(100)]],
        languages:        [10,  [Validators.min(0), Validators.max(100)]],
        certifications:   [30,  [Validators.min(0), Validators.max(100)]],
        responsibilities: [10,  [Validators.min(0), Validators.max(100)]],
        experienceMonths: [0,   [Validators.min(0), Validators.max(100)]],
        level:            [0,   [Validators.min(0), Validators.max(100)]],
        minimumEducation: [0,   [Validators.min(0), Validators.max(100)]],
        totalWeight:      [{ value: 100, disabled: true }]
      }, {  validators: this.sumValidator })
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
    
    this.positionForm.markAllAsTouched();
    if (this.positionForm.invalid) {
      this.positionForm.markAllAsTouched();
      return;
    }

    const dto: Position = {
      ...this.positionForm.value,
      requiredSkills: this.splitByComma(this.positionForm.value.requiredSkills),
      niceToHave: this.splitByComma(this.positionForm.value.niceToHave),
      certifications: this.splitByComma(this.positionForm.value.certifications),
      weights:         this.positionForm.value.weights as ScoreWeights
    };

      const action$: Observable<Position> = this.isEditMode
      ? this.positionService.updatePosition(this.positionId, dto)
      : this.positionService.createPosition(this.departmentId, dto);

      action$.subscribe({
        next: (newPosition : Position) => {
          
          if(this.isEditMode) {
            this.notificationService.showSuccess('Position updated successfully');
          }else {
            this.treeService.addPositionToTree({
            departmentId: this.departmentId,
            position: {publicId : newPosition.publicId! , name : newPosition.name} as PositionTreeNode
            });
            this.notificationService.showSuccess('Position created successfully');
          }
          
          this.router.navigate(['/dashboard']); // sau oriunde vrei să redirecționezi
        },
        error: () => {
          this.notificationService.showError('Failed to create position');
        }
      });
  }

  splitByComma(value: string | null): string[] {
    if (Array.isArray(value)) {
      return value;
    }
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
        fields = [
        'requiredSkills',
        'minimumExperienceMonths',
        'minimumEducationLevel',
        'niceToHave',
        'languages',
        'certifications'];
      
        break;

      default:
        break;
    }
  
    // 2) Marchează fiecare control ca touched și recalculăm validarea
    fields.forEach(path => {
      const ctrl = this.positionForm.get(path);
      if (ctrl) {
        ctrl.markAsTouched();
        ctrl.updateValueAndValidity();
      }
    });

    const allValid = fields.every(path => this.positionForm.get(path)?.valid);

    if (allValid) {
      activate(step);
  }
  }
  
    loadPosition(publicId: string) {
      this.positionService.getPosition(publicId).subscribe({
        next: (position: Position) => {
          this.positionForm.patchValue({
            name: position.name,
            level: position.level,
            requiredSkills: position.requiredSkills ?? [],
            minimumExperienceMonths: position.minimumExperienceMonths,
            minimumEducationLevel: position.minimumEducationLevel,
            niceToHave: position.niceToHave ?? [],
            languages: position.languages ?? [],
            certifications: position.certifications ?? [],
            weights: {
              requiredSkills: position.weights.requiredSkills,
              niceToHave: position.weights.niceToHave,
              languages: position.weights.languages,
              certifications: position.weights.certifications,
              responsibilities: position.weights.responsibilities,
              experienceMonths: position.weights.experienceMonths,
              level: position.weights.level,
              minimumEducation: position.weights.minimumEducation
            }
          });

          this.responsibilities.clear();
          position.responsibilities.forEach(res => {
            this.responsibilities.push(this.fb.control(res));
          });
        },
        error: () => {
          this.notificationService.showError('Failed to load position data.');
        }
      });
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
