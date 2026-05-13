import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  // Signal to manage the collapsed state
  isCollapsed = signal(false);

  // Toggle function
  toggleSidebar() {
    this.isCollapsed.update(val => !val);
  }
}