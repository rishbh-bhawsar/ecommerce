import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { UpdateProfileComponent } from './update-profile.component';
import { ResetPasswordComponent } from './reset-password.component';

@NgModule({
  imports: [CommonModule, ProfileRoutingModule, ProfileComponent, UpdateProfileComponent, ResetPasswordComponent]
})
export class ProfileModule {}