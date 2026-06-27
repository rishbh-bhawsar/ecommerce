import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { UpdateProfileComponent } from './update-profile.component';
import { ResetPasswordComponent } from './reset-password.component';

const routes: Routes = [
  { path: '', component: ProfileComponent },
  { path: 'update', component: UpdateProfileComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}