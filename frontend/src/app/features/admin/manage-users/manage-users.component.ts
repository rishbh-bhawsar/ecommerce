import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models';
import Swal from 'sweetalert2';
import { TableSkeletonComponent } from '../../../shared/components/skeleton/table-skeleton.component';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, TableSkeletonComponent],
  template: `
    <div class="manage-container">
      <h1><mat-icon>people</mat-icon> Manage Users</h1>
      <mat-card class="table-card">
        <app-table-skeleton *ngIf="isLoading" [rows]="5" [columns]="displayedColumns.length"></app-table-skeleton>
        <table *ngIf="!isLoading" mat-table [dataSource]="users" class="full-width">
          <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let u">{{ u.name }}</td></ng-container>
          <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef>Email</th><td mat-cell *matCellDef="let u">{{ u.email }}</td></ng-container>
          <ng-container matColumnDef="role"><th mat-header-cell *matHeaderCellDef>Role</th><td mat-cell *matCellDef="let u"><span class="role-badge" [class]="'role-' + u.role">{{ u.role | titlecase }}</span></td></ng-container>
          <ng-container matColumnDef="createdAt"><th mat-header-cell *matHeaderCellDef>Joined</th><td mat-cell *matCellDef="let u">{{ u.createdAt | date:'mediumDate' }}</td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th><td mat-cell *matCellDef="let u"><button mat-icon-button color="warn" (click)="deleteUser(u)" [disabled]="u.role === 'admin'"><mat-icon>delete</mat-icon></button></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .manage-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .manage-container h1 { display: flex; align-items: center; gap: 8px; color: #333; margin-bottom: 24px; }
    .table-card { overflow-x: auto; }
    table { width: 100%; }
    .role-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .role-admin { background: #e8eaf6; color: #3f51b5; }
    .role-user { background: #e8f5e9; color: #2e7d32; }
  `]
})
export class ManageUsersComponent implements OnInit {
  users: User[] = []; displayedColumns = ['name', 'email', 'role', 'createdAt', 'actions']; isLoading = false;
  constructor(private userService: UserService) {}
  ngOnInit(): void { this.loadUsers(); }
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({ next: (users) => { this.users = users; this.isLoading = false; }, error: () => this.isLoading = false });
  }
  deleteUser(user: User): void {
    Swal.fire({
      title: 'Delete User?',
      text: `Are you sure you want to delete "${user.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => { Swal.fire('Deleted!', 'User has been deleted.', 'success'); this.loadUsers(); },
          error: () => Swal.fire('Error', 'Failed to delete user', 'error')
        });
      }
    });
  }
}
