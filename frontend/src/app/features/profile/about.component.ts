import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="about-container">
      <mat-card class="about-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="about-icon">info</mat-icon>
            <h2>About E-Shop</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="about-section">
            <h3>Welcome to E-Shop</h3>
            <p>Your one-stop destination for all your shopping needs. We offer a wide range of products with the best quality and competitive prices.</p>
          </div>
          <div class="about-section">
            <h3>Our Mission</h3>
            <p>To provide a seamless and enjoyable shopping experience while ensuring customer satisfaction through quality products and excellent service.</p>
          </div>
          <div class="about-section">
            <h3>Contact Us</h3>
            <div class="contact-info">
              <div class="contact-item">
                <mat-icon>email</mat-icon>
                <span>rishbhbhawsar24@gmail.com</span>
              </div>
              <div class="contact-item">
                <mat-icon>phone</mat-icon>
                <span>+91 6263775999</span>
              </div>
              <div class="contact-item">
                <mat-icon>location_on</mat-icon>
                <span>123 Commerce St, Shopping City</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .about-container { max-width: 80%; margin: 24px auto; padding: 0 16px; }
    .about-card { padding: 20px; }
    .about-card mat-card-header { justify-content: center; margin-bottom: 24px; }
    .about-card mat-card-title { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .about-icon { font-size: 48px; width: 48px; height: 48px; color: #3f51b5; }
    .about-section { margin-bottom: 24px; }
    .about-section h3 { color: #3f51b5; margin-bottom: 8px; }
    .about-section p { color: #666; line-height: 1.6; }
    .contact-info { display: flex; flex-direction: column; gap: 12px; }
    .contact-item { display: flex; align-items: center; gap: 12px; color: #555; }
    .contact-item mat-icon { color: #3f51b5; }
  `]
})
export class AboutComponent {}