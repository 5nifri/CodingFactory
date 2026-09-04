import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {ContactService} from '../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  private contactService = inject(ContactService);

  name = '';
  email = '';
  subject = '';
  message = '';
  loading = false;
  success = false;
  error = false;

  onSubmit(): void {
    if (!this.name || !this.email || !this.subject || !this.message) {
      return;
    }

    this.loading = true;
    this.success = false;
    this.error = false;

    this.contactService.sendMessage({
      name: this.name,
      email: this.email,
      subject: this.subject,
      message: this.message
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        // Reset form
        this.name = '';
        this.email = '';
        this.subject = '';
        this.message = '';
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }
}
