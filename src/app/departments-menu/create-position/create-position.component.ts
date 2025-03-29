import { Component, OnInit , inject } from '@angular/core';
import { PositionLevel } from '../../enums/position-level.enum';
import { EducationLevel } from '../../enums/education-level.enum';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  ],
  templateUrl: './create-position.component.html',
  styleUrl: './create-position.component.css'
})
export class CreatePositionComponent implements OnInit {
 

  positionForm!: FormGroup;
  departmentId!: number;
  positionLevels = this.mapEnumToOptions(PositionLevel);
  educationLevels =  this.mapEnumToOptions(EducationLevel);

  step = 1;
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private positionService = inject(PositionService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.departmentId = Number(this.route.snapshot.paramMap.get('publicId'));
    this.initForm();
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
      level: ['Intern'],
      responsibilities: this.fb.array([this.fb.control('')]),

      // Step 2
      requiredSkills: [[]],
      minimumExperienceMonths: [0, [Validators.required, Validators.min(0)]],
      minimumEducationLevel: ['High School'],
      // Step 3
      niceToHave: [[]],
      languages: [[]],
      certifications: [[]],
    });
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

    const dto: Position = this.positionForm.value;

    this.positionService.createPosition(this.departmentId, dto).subscribe({
      next: () => {
        this.notificationService.showSuccess('Position created successfully');
        this.router.navigate(['/dashboard']); // sau oriunde vrei să redirecționezi
      },
      error: () => {
        this.notificationService.showError('Failed to create position');
      }
    });
  }


  goToStep(step: number, activate: (step: number) => void) {
    const fields = ['name', 'level', 'responsibilities'];
    fields.forEach(f => this.positionForm.get(f)?.markAsTouched());
  
    const isValid = fields.every(f => this.positionForm.get(f)?.valid);
    if (isValid) {
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
