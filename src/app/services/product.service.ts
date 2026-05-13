import { Injectable } from '@angular/core';
import { Observable, from, of, delay, map, switchMap } from 'rxjs';
import { Category, Product } from '../models/pos.models';
import * as localforage from 'localforage';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly STORAGE_KEY = 'pos_products';

  // Fixed Categories List
  private categories: Category[] = [
    { id: 1, name: 'Beverages', icon: '☕' },
    { id: 2, name: 'Food', icon: '🍔' },
    { id: 3, name: 'Desserts', icon: '🍰' },
    { id: 4, name: 'Others', icon: '📦' }
  ];

  constructor() {
    this.initData();
  }

  // Initialize with seed data if empty
  private async initData() {
    const products = await localforage.getItem(this.STORAGE_KEY);
    if (!products) {
      const seed: Product[] = [
        { id: 1, name: 'Espresso', price: 2.5, stock: 100, category_id: 1 },
        { id: 2, name: 'Cappuccino', price: 3.5, stock: 50, category_id: 1 }
      ];
      await localforage.setItem(this.STORAGE_KEY, seed);
    }
  }

  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  getProducts(): Observable<Product[]> {
    return from(localforage.getItem<Product[]>(this.STORAGE_KEY)).pipe(
      map(data => data || []),
      delay(400)
    );
  }

  saveProduct(product: Product): Observable<Product> {
    return from(localforage.getItem<Product[]>(this.STORAGE_KEY)).pipe(
      map(data => data || []),
      switchMap(products => {
        if (product.id) {
          // Update
          const index = products.findIndex((p: Product) => p.id === product.id);
          if (index !== -1) products[index] = product;
        } else {
          // Create
          product.id = Date.now(); // Simple ID generation
          products.push(product);
        }
        return from(localforage.setItem(this.STORAGE_KEY, products));
      }),
      map(() => product),
      delay(400)
    );
  }

  deleteProduct(id: number): Observable<boolean> {
    return from(localforage.getItem<Product[]>(this.STORAGE_KEY)).pipe(
      map(data => data || []),
      switchMap(products => {
        const filteredProducts = products.filter((p: Product) => p.id !== id);
        return from(localforage.setItem(this.STORAGE_KEY, filteredProducts));
      }),
      map(() => true),
      delay(300)
    );
  }
}
