import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Category, Product } from '../../models/pos.models';

@Component({
  selector: 'app-product-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-manager.component.html'
})
export class ProductManagerComponent implements OnInit {
  private productService = inject(ProductService);
  // State
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  searchText = signal('');
  isModalOpen = signal(false);
  isLoading = signal(false);

  // Form State
  currentProduct = signal<Product>(this.getEmptyProduct());

  // Search filter
  filteredProducts = computed(() => {
    return this.products().filter(p =>
      p.name.toLowerCase().includes(this.searchText().toLowerCase())
    );
  });

  ngOnInit() {
    this.productService.getCategories().subscribe(res => this.categories.set(res));
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe(data => {
      this.products.set(data);
      this.isLoading.set(false);
    });
  }

  getEmptyProduct(): Product {
    return { id: 0, name: '', price: 0, stock: 0, category_id: 1 };
  }

  openModal(product?: Product) {
    if (product) {
      this.currentProduct.set({ ...product }); // Edit
    } else {
      this.currentProduct.set(this.getEmptyProduct()); // Create
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveProduct() {
    const prod = this.currentProduct();
    if (!prod.name || prod.price <= 0) return;

    this.isLoading.set(true);
    this.productService.saveProduct(prod).subscribe(() => {
      this.loadProducts();
      this.closeModal();
    });
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  // Handle Image Upload
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // We update the signal with the base64 string
        this.currentProduct.update(p => ({ ...p, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  // Helper to get category name for the table
  getCategoryName(id: number) {
    return this.categories().find(c => c.id === id)?.name || 'N/A';
  }
}