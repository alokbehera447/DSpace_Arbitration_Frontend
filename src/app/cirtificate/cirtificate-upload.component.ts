// certificate-upload.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificateService, CertificateInfo } from './cirtificate.service';

@Component({
  selector: 'app-certificate-upload',
  templateUrl: './certificate-upload.component.html',
  styleUrls: ['./certificate-upload.component.scss']
})
export class CertificateUploadComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  uploadSuccess = false;
  uploadError: string | null = null;
  currentCertificate: CertificateInfo | null = null;
  hasCertificate = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService
  ) {
    this.uploadForm = this.fb.group({
      certificateFile: [null, Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentCertificate();
  }

  /**
   * Load user's current certificate if exists
   */
  loadCurrentCertificate(): void {
    this.certificateService.getCurrentCertificate().subscribe({
      next: (response) => {
        this.hasCertificate = response.hasCertificate;
        this.currentCertificate = response.certificate || null;
      },
      error: (error) => {
        console.error('Error loading certificate:', error);
      }
    });
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validExtensions = ['.pfx', '.p12'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        this.uploadError = 'Please select a valid certificate file (.pfx or .p12)';
        this.selectedFile = null;
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = 'Certificate file is too large (max 5MB)';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.uploadError = null;
      this.uploadForm.patchValue({ certificateFile: file });
    }
  }

  /**
   * Upload certificate
   */
  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      return;
    }

    this.isUploading = true;
    this.uploadError = null;
    this.uploadSuccess = false;

    const password = this.uploadForm.value.password;

    this.certificateService.uploadCertificate(this.selectedFile, password).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadSuccess = true;
        this.uploadError = null;
        this.currentCertificate = response.certificate;
        this.hasCertificate = true;
        
        // Reset form
        this.uploadForm.reset();
        this.selectedFile = null;

        // Clear success message after 5 seconds
        setTimeout(() => {
          this.uploadSuccess = false;
        }, 5000);
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadSuccess = false;
        this.uploadError = error.error?.message || 'Failed to upload certificate. Please check your file and password.';
      }
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Check if certificate is expiring soon (within 30 days)
   */
  isExpiringSoon(): boolean {
    if (!this.currentCertificate) return false;
    
    const validTo = new Date(this.currentCertificate.validTo);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return validTo <= thirtyDaysFromNow;
  }

  /**
   * Revoke current certificate
   */
  revokeCertificate(): void {
    if (!confirm('Are you sure you want to revoke your certificate? You will need to upload a new one to sign documents.')) {
      return;
    }

    const reason = prompt('Please enter a reason for revocation:');
    if (!reason) return;

    this.certificateService.revokeCertificate(reason).subscribe({
      next: () => {
        this.currentCertificate = null;
        this.hasCertificate = false;
        alert('Certificate revoked successfully');
      },
      error: (error) => {
        alert('Failed to revoke certificate: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
}
