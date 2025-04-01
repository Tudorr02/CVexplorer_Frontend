import { Component, OnInit, inject} from '@angular/core';
import { FormBuilder, FormArray, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PositionService } from '../../_services/position.service';
import { Position } from '../../_models/position';
import { PositionLevel} from '../../enums/position-level.enum';
import { EducationLevel } from '../../enums/education-level.enum';
import { NotificationService } from '../../_services/notification.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectButton } from 'primeng/selectbutton';
import { FormControl } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { LanguageService } from '../../_services/language.service';

@Component({
  selector: 'app-edit-position',
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
      MultiSelectModule
    ],
  templateUrl: './edit-position.component.html',
  styleUrl: './edit-position.component.css'
})
export class EditPositionComponent implements OnInit{

  positionForm!: FormGroup;
  publicId!: string;
  positionLevels = this.mapEnumToOptions(PositionLevel);
  educationLevels = this.mapEnumToOptions(EducationLevel);
  languages: { label: string; value: string }[] = [];

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private positionService = inject(PositionService);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);

  ngOnInit(): void {
    this.publicId = this.route.snapshot.paramMap.get('publicId')!;
    this.initForm();
    this.loadLanguages();
    this.loadPosition();
  }

  initForm() {
    this.positionForm = this.fb.group({
      name: ['', Validators.required],
      level: [PositionLevel.Intern],
      responsibilities: this.fb.array([this.fb.control('')]),
      requiredSkills: [[]],
      minimumExperienceMonths: [0, [Validators.required, Validators.min(0)]],
      minimumEducationLevel: [EducationLevel.HighSchool],
      niceToHave: [[]],
      languages: [[]],
      certifications: [[]]
    });
  }

  get responsibilities(): FormArray {
    return this.positionForm.get('responsibilities') as FormArray;
  }

  loadLanguages() {
    this.languageService.getLanguages().subscribe({
      next: (languages) => {
        this.languages = languages;
      },
      error: () => {
        this.notificationService.showError('Failed to load languages');
      }
    });
  }

  loadPosition() {
    this.positionService.getPosition(this.publicId).subscribe({
      next: (position: Position) => {
        this.positionForm.patchValue({
          name: position.name,
          level: position.level,
          requiredSkills: position.requiredSkills ?? [],
          minimumExperienceMonths: position.minimumExperienceMonths,
          minimumEducationLevel: position.minimumEducationLevel,
          niceToHave: position.niceToHave ?? [],
          languages: position.languages ?? [],
          certifications: position.certifications ?? []
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

  onSubmit() {
    if (this.positionForm.invalid) {
      this.positionForm.markAllAsTouched();
      return;
    }

    const dto: Position = this.positionForm.getRawValue();

    this.positionService.updatePosition(this.publicId, dto).subscribe({
      next: () => {
        this.notificationService.showSuccess('Position updated successfully');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.notificationService.showError('Failed to update position');
      }
    });
  }

  addResponsibility() {
    this.responsibilities.push(this.fb.control(''));
  }

  removeResponsibility() {
    const total = this.responsibilities.length;
    if (total > 1) {
      this.responsibilities.removeAt(total - 1);
    } else {
      this.notificationService.showWarning('At least one responsibility is required');
    }
  }

  goToStep(step: number, activate: (step: number) => void) {
    let fields: string[] = [];
    switch (step) {
      case 2:
        fields = ['name', 'level', 'responsibilities'];
        break;
      case 3:
        fields = ['requiredSkills', 'minimumExperienceMonths', 'minimumEducationLevel'];
        break;
    }

    fields.forEach(f => this.positionForm.get(f)?.markAsTouched());
    const isValid = fields.every(f => this.positionForm.get(f)?.valid);
    if (isValid) {
      activate(step);
    }
  }

  onListInput(fieldName: keyof Position, event: FocusEvent) {
    const input = (event.target as HTMLInputElement).value;
    const values = input.split(',').map(item => item.trim()).filter(item => item.length > 0);
    this.positionForm.get(fieldName)?.setValue(values);
  }

  mapEnumToOptions(enumObj: any): { label: string; value: string }[] {
    return Object.values(enumObj).map(value => ({
      label: value as string,
      value: value as string
    }));
  }

}
