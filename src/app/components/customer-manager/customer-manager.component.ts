import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-manager.component.html'
})
export class CustomerManagerComponent implements OnInit {
  private customerService = inject(CustomerService);

  customers = signal<Customer[]>([]);
  searchText = signal('');
  isModalOpen = signal(false);
  currentCustomer = signal<Customer>(this.getEmptyCustomer());

  filteredCustomers = computed(() => {
    const search = this.searchText().toLowerCase();
    return this.customers().filter(c => 
      c.name.toLowerCase().includes(search) || c.phone.includes(search)
    );
  });

  ngOnInit() { this.loadCustomers(); }

  loadCustomers() {
    this.customerService.getCustomers().subscribe(data => this.customers.set(data));
  }

  getEmptyCustomer(): Customer {
    return { id: 0, name: '', email: '', phone: '', total_spent: 0, created_at: 0 };
  }

  openModal(customer?: Customer) {
    this.currentCustomer.set(customer ? { ...customer } : this.getEmptyCustomer());
    this.isModalOpen.set(true);
  }

  saveCustomer() {
    if (!this.currentCustomer().name || !this.currentCustomer().phone) return;
    this.customerService.saveCustomer(this.currentCustomer()).subscribe(() => {
      this.loadCustomers();
      this.isModalOpen.set(false);
    });
  }

  deleteCustomer(id: number) {
    if (confirm('Are you sure?')) {
      this.customerService.deleteCustomer(id).subscribe(() => this.loadCustomers());
    }
  }
}