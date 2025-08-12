import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [ReactiveFormsModule, NavBarComponent, CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css'],
})
export class ConfirmationComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;

  private http = inject(HttpClient);

  private SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbzaXs5E2IhAlREijut4HRvuK7Ogm6FIc5L-uKRwiMVNc2jVLUainwr_oG1PeC8S36Pd/exec';

  ngOnInit(): void {
    this.createform();
    this.formValueChanges();
  }

  createform() {
    this.form = new FormGroup({
      nombreCompleto: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      asistencia: new FormControl('', Validators.required), // Nueva pregunta
      acompanante: new FormControl(''),
      direccion: new FormControl('', Validators.required),
      alergias: new FormControl(''),
      busOption: new FormControl('No', Validators.required),
      busStop: new FormControl(''),
    });
  }

  formValueChanges() {
    this.form.get('busOption')?.valueChanges.subscribe((value) => {
      const stopControl = this.form.get('busStop');
      if (value === 'Sí') {
        stopControl?.setValidators(Validators.required);
      } else {
        stopControl?.clearValidators();
        stopControl?.setValue('');
      }
      stopControl?.updateValueAndValidity();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        switch (fieldName) {
          case 'nombreCompleto':
            return 'El nombre completo es obligatorio';
          case 'busOption':
            return 'Debes seleccionar una opción para el servicio de autobuses';
          case 'direccion':
            return 'La dirección es obligatoria';
          default:
            return 'Este campo es obligatorio';
        }
      }

      if (field.errors['minlength']) {
        return 'El nombre debe tener al menos 3 caracteres';
      }
    }
    return '';
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  onSubmit(): void {
    const asistenciaValue = this.form.get('asistencia')?.value;

    // Caso asistencia = NO → enviar solo nombre y asistencia
    if (asistenciaValue === 'No' && !this.isSubmitting) {
      if (this.form.get('nombreCompleto')?.invalid) {
        this.form.get('nombreCompleto')?.markAsTouched();
        return;
      }

      this.isSubmitting = true;
      const formData = new FormData();
      formData.append(
        'nombreCompleto',
        this.form.get('nombreCompleto')?.value || ''
      );
      formData.append('asistencia', 'No');

      this.http.post(this.SCRIPT_URL, formData).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          if (response.status === 'success') {
            this.successMessageNoAsiste();
            this.form.reset({ busOption: 'No' });
          } else {
            this.errorMessage();
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage();
        },
      });
      return;
    }

    // Caso asistencia = SÍ → enviar todo
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formData = new FormData();
      Object.keys(this.form.value).forEach((key) => {
        let value = this.form.value[key];
        if (key === 'alergias' && (!value || value.trim() === '')) {
          value = 'Ninguna';
        }
        if (key === 'acompanante' && (!value || value.trim() === '')) {
          value = 'Ninguno';
        }
        if (key === 'busStop' && this.form.get('busOption')?.value === 'No') {
          value = '';
        }
        formData.append(key, value || '');
      });

      this.http.post(this.SCRIPT_URL, formData).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          if (response.status === 'success') {
            this.successMessage();
            this.form.reset({ busOption: 'No' });
          } else {
            this.errorMessage();
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage();
        },
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  successMessage() {
    Swal.fire({
      icon: 'success',
      title: 'Confirmación enviada',
      text: '¡Tu asistencia ha sido confirmada con éxito! Gracias.',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  successMessageNoAsiste() {
    Swal.fire({
      icon: 'info',
      title: 'Confirmación registrada',
      text: 'Gracias por avisarnos, lamentamos que no puedas venir.',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  errorMessage() {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo enviar la confirmación. Intenta de nuevo más tarde.',
    });
  }
}
