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
import { Chip } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-create-position',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    Chip,
    ButtonModule,
    CardModule
  ],
  templateUrl: './create-position.component.html',
  styleUrl: './create-position.component.css'
})
export class CreatePositionComponent implements OnInit {
 

  postitionForm!: FormGroup;
  departmentId!: number;
  positionLevels = Object.values(PositionLevel);
  educationLevels = Object.values(EducationLevel);
  
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private positionService = inject(PositionService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.departmentId = Number(this.route.snapshot.paramMap.get('publicId'));
    this.initForm();
  }

  initForm() {
    this.postitionForm = this.fb.group({
      name: ['', Validators.required],
      requiredSkills: [[]],
      niceToHave: [[]],
      languages: [[]],
      certifications: [[]],
      responsibilities: [[]],
      minimumExperienceMonths: [0, [Validators.required, Validators.min(0)]],
      level: ['Intern', Validators.required],
      minimumEducationLevel: ['HighSchool', Validators.required]
    });
  }

  onSubmit() {
    if (this.postitionForm.invalid) {
      this.postitionForm.markAllAsTouched();
      return;
    }

    const dto: Position = this.postitionForm.value;

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

  onListInput(fieldName: keyof Position, event: FocusEvent) {
    const input = (event.target as HTMLInputElement).value;
    const values = input.split(',').map(item => item.trim()).filter(Boolean);
    this.postitionForm.get(fieldName)?.setValue(values);
  }
  

}
