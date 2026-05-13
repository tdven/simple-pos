import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Customer } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly STORAGE_KEY = 'pos_customers';

  getCustomers(): Observable<Customer[]> {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    return of(data).pipe(delay(300));
  }

  saveCustomer(customer: Customer): Observable<Customer> {
    const customers = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    
    if (customer.id) {
      const index = customers.findIndex((c: Customer) => c.id === customer.id);
      customers[index] = customer;
    } else {
      customer.id = Date.now();
      customer.created_at = Date.now();
      customer.total_spent = 0;
      customers.push(customer);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customers));
    return of(customer).pipe(delay(300));
  }

  deleteCustomer(id: number): Observable<boolean> {
    let customers = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    customers = customers.filter((c: Customer) => c.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customers));
    return of(true);
  }
}