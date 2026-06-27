import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="privacy-container">
      <mat-card class="privacy-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="privacy-icon">privacy_tip</mat-icon>
            <h2>Privacy & Policy</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="privacy-section">
            <h3>Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
          </div>
          <div class="privacy-section">
            <h3>How We Use Your Information</h3>
            <p>We use the information we collect to provide, maintain, and improve our services, to process transactions, and to send you related information.</p>
          </div>
          <div class="privacy-section">
            <h3>Information Sharing</h3>
            <p>We do not sell or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our platform.</p>
          </div>
          <div class="privacy-section">
            <h3>Data Security</h3>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </div>
          <div class="privacy-section">
            <h3>Your Rights</h3>
            <p>You have the right to access, correct, or delete your personal information. You may also opt out of certain communications from us.</p>
          </div>
          <div class="privacy-section">
            <h3>Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:rishbhbhawsar24@gmail.com">
  rishbhbhawsar24@gmail.com
</a></p>
          </div>
          <div class="last-updated">
            <p><em>Last updated: January 1, 2024</em></p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .privacy-container { max-width: 80%; margin: 24px auto; padding: 0 16px; }
    .privacy-card { padding: 20px; }
    .privacy-card mat-card-header { justify-content: center; margin-bottom: 24px; }
    .privacy-card mat-card-title { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .privacy-icon { font-size: 48px; width: 48px; height: 48px; color: #3f51b5; }
    .privacy-section { margin-bottom: 24px; }
    .privacy-section h3 { color: #3f51b5; margin-bottom: 8px; }
    .privacy-section p { color: #666; line-height: 1.6; }
    .last-updated { text-align: center; color: #999; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
  `]
})
export class PrivacyComponent {}