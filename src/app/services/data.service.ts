import { Injectable } from '@angular/core';
import { Observable, from, of, delay, switchMap, map } from 'rxjs';
import { Product, Category, Invoice } from '../models/pos.models';
import * as localforage from 'localforage';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly STORAGE_KEYS = {
    PRODUCTS: 'pos_products',
    CATEGORIES: 'pos_categories',
    INVOICES: 'pos_invoices'
  };

  constructor() {
    this.initializeSeedData();
  }

  private async initializeSeedData() {
    const products = await localforage.getItem(this.STORAGE_KEYS.PRODUCTS);
    if (!products) {
      const initialProducts: Product[] = [
        { id: 1, name: 'Espresso', price: 2.5, category_id: 1, stock: 100 },
        { id: 2, name: 'Cappuccino', price: 3.5, category_id: 1, stock: 50 },
        { id: 3, name: 'Chocolate Cake', price: 4.0, category_id: 2, stock: 20 },
        { id: 4, name: 'Green Tea', price: 2.0, category_id: 1, stock: 80 },
        { id: 5, name: 'Expensive Chocolate Cake', price: 14.0, category_id: 2, stock: 20 },
        { id: 6, name: 'Expensice Green Tea', price: 12.0, category_id: 1, stock: 80 }
      ];
      const initialCategories: Category[] = [
        { id: 1, name: 'Beverages', color: 'blue', icon: '' },
        { id: 2, name: 'Desserts', color: 'pink', icon: '' }
      ];
      await localforage.setItem(this.STORAGE_KEYS.PRODUCTS, initialProducts);
      await localforage.setItem(this.STORAGE_KEYS.CATEGORIES, initialCategories);
      await localforage.setItem(this.STORAGE_KEYS.INVOICES, []);
    }
  }

  getInvoices(): Observable<Invoice[]> {
    return from(localforage.getItem<Invoice[]>(this.STORAGE_KEYS.INVOICES)).pipe(
      map(data => data || [])
    );
  }

  getProducts(): Observable<Product[]> {
    return from(localforage.getItem<Product[]>(this.STORAGE_KEYS.PRODUCTS)).pipe(
      map(data => data || []),
      delay(300) // Simulate network lag
    );
  }

  getCategories(): Observable<Category[]> {
    return from(localforage.getItem<Category[]>(this.STORAGE_KEYS.CATEGORIES)).pipe(
      map(data => data || [])
    );
  }

  saveInvoice(invoice: Invoice): Observable<boolean> {
    if (invoice.customer_id) {
      this.updateCustomerStats(invoice.customer_id, invoice.payable);
    }

    return from(localforage.getItem<Invoice[]>(this.STORAGE_KEYS.INVOICES)).pipe(
      map(data => data || []),
      switchMap(invoices => {
        invoices.push(invoice);
        return from(localforage.setItem(this.STORAGE_KEYS.INVOICES, invoices));
      }),
      map(() => true),
 //     delay(500)
    );

  }


  private updateCustomerStats(customerId: number, amount: number) {
    const customers = JSON.parse(localStorage.getItem('pos_customers') || '[]');
    const index = customers.findIndex((c: any) => c.id === customerId);
    
    if (index !== -1) {
      customers[index].total_spent += amount;
      localStorage.setItem('pos_customers', JSON.stringify(customers));
    }
  }
}
