import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ProductService } from '../../services/product.service';
import { Product, Invoice } from '../../models/pos.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private dataService = inject(DataService);
  private productService = inject(ProductService);

  // --- Raw Data Signals ---
  invoices = signal<Invoice[]>([]);
  products = signal<Product[]>([]);

  // --- Computed Statistics ---
  totalRevenue = computed(() => 
    this.invoices().reduce((acc, inv) => acc + inv.payable, 0)
  );

  totalOrders = computed(() => this.invoices().length);
  
  productCount = computed(() => this.products().length);

  lowStockItems = computed(() => 
    this.products().filter(p => p.stock < 10)
  );

  recentInvoices = computed(() => 
    [...this.invoices()].sort((a, b) => b.created_at - a.created_at).slice(0, 5)
  );

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dataService.getInvoices().subscribe(data => this.invoices.set(data));
    this.productService.getProducts().subscribe(data => this.products.set(data));
  }
}