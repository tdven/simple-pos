import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Product, Category, Invoice, InvoiceItem } from '../../models/pos.models';
import { ProductService } from '../../services/product.service';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';

type PaymentType = 'Cash' | 'Card' | 'Transfer';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html'
})
export class PosComponent implements OnInit {
  private dataService = inject(DataService);
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);
  paymentMethodsList: PaymentType[] = ['Cash', 'Card', 'Transfer'];
  // --- UI & Data State ---
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  cart = signal<InvoiceItem[]>([]);
  searchText = signal('');
  selectedCategoryId = signal<number | null>(null);

  isReceiptModalOpen = signal(false);
  lastInvoice = signal<Invoice | null>(null);

  // --- Modal & Payment State ---
  isPaymentModalOpen = signal(false);
  paymentMethod = signal<PaymentType>('Cash');
  amountReceived = signal<number>(0);


  // Estados para Clientes
  allCustomers = signal<Customer[]>([]);
  selectedCustomer = signal<Customer | null>(null); // null = Walk-in Customer
  isCustomerModalOpen = signal(false);
  customerSearchText = signal('');

  // Filtrado de clientes dentro del modal
  filteredCustomers = computed(() => {
    const search = this.customerSearchText().toLowerCase();
    return this.allCustomers().filter(c =>
      c.name.toLowerCase().includes(search) || c.phone.includes(search)
    );
  });


  // --- Computed Properties ---
  filteredProducts = computed(() => {
    return this.products().filter(p =>
      (this.selectedCategoryId() === null || p.category_id === this.selectedCategoryId()) &&
      p.name.toLowerCase().includes(this.searchText().toLowerCase())
    );
  });

  totals = computed(() => {
    const subtotal = this.cart().reduce((acc, item) => acc + item.subtotal, 0);
    const vat = subtotal * 0.15;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  });

  // Calculate change only if payment is Cash
  changeDue = computed(() => {
    if (this.paymentMethod() !== 'Cash') return 0;
    const diff = this.amountReceived() - this.totals().total;
    return diff > 0 ? diff : 0;
  });

  ngOnInit() {
    this.dataService.getProducts().subscribe(res => this.products.set(res));
    this.productService.getCategories().subscribe(res => this.categories.set(res));
    this.customerService.getCustomers().subscribe(data => this.allCustomers.set(data));
  }

  addToCart(product: Product) {
    this.cart.update(items => {
      const existing = items.find(i => i.product_id === product.id);
      if (existing) {
        return items.map(i => i.product_id === product.id
          ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.price }
          : i
        );
      }
      return [...items, {
        product_id: product.id,
        name: product.name,
        qty: 1,
        price: product.price,
        subtotal: product.price,
        vat: product.price * 0.15
      }];
    });
  }

  removeFromCart(productId: number) {
    this.cart.update(items => items.filter(i => i.product_id !== productId));
  }

  // --- Payment Workflow ---

  openPaymentModal() {
    if (this.cart().length === 0) return;
    // Set default amount to total
    this.amountReceived.set(this.totals().total);
    this.isPaymentModalOpen.set(true);
  }

  closePaymentModal() {
    this.isPaymentModalOpen.set(false);
  }

  confirmFinalPayment() {
    // Validate if enough money was received for cash payments
    if (this.paymentMethod() === 'Cash' && this.amountReceived() < this.totals().total) {
      alert('Amount received is less than total price');
      return;
    }
    const customer = this.selectedCustomer();
    const newInvoice: Invoice = {
      uuid: crypto.randomUUID(),
      items: this.cart(),
      subtotal: this.totals().subtotal,
      vat: this.totals().vat,
      payable: this.totals().total,
      paid: this.amountReceived(),
      change: this.changeDue(),
      payment_method: this.paymentMethod(),
      created_at: Date.now(),
      status: 'completed',
      customer_id: customer ? customer.id : undefined,
      info_name: customer ? customer.name : 'Walk-in Customer',
      info_phone: customer ? customer.phone : '',
      info_email: customer ? customer.email : '',
      info_address: customer ? (customer.address || '') : '',
    };

    this.dataService.saveInvoice(newInvoice).subscribe(() => {
      this.lastInvoice.set(newInvoice); // Guardamos la factura para el ticket
      this.isReceiptModalOpen.set(true); // Abrimos el modal del ticket

      //clear states
      this.selectedCustomer.set(null); // Reset to Walk-in 
      //alert('Transaction successful!');
      this.cart.set([]);
      this.closePaymentModal();
    });
  }
  openCustomerModal() {
    this.isCustomerModalOpen.set(true);
    this.customerSearchText.set(''); // Limpiar búsqueda al abrir
  }

  selectCustomer(customer: Customer | null) {
    this.selectedCustomer.set(customer);
    this.isCustomerModalOpen.set(false);
  }

printReceipt() {
  const printContents = document.getElementById('printable-receipt')?.innerHTML;
  if (!printContents) return;

  // 1. Crear una ventana nueva (Popup)
  const printWindow = window.open('', '_blank', 'width=600,height=600');

  if (printWindow) {
    // 2. Escribir el contenido del ticket y los estilos necesarios dentro de esa ventana
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Ticket</title>
          <style>
            body { 
              font-family: 'Courier New', Courier, monospace; 
              padding: 20px; 
              color: black;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .text-xl { font-size: 20px; }
            .text-xs { font-size: 12px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .border-b { border-bottom: 1px solid #000; }
            .border-dashed { border-bottom: 1px dashed #000; }
            .my-4 { margin-top: 16px; margin-bottom: 16px; }
            .w-full { width: 100%; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 4px 0; }
            .text-right { text-align: right; }
            @page { margin: 0; }
          </style>
        </head>
        <body>
          ${printContents}
          <script>
            // 3. Ejecutar la impresión y cerrar la ventana automáticamente
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    this.closeReceiptModal()
  }
}

  closeReceiptModal() {
    this.isReceiptModalOpen.set(false);
    this.lastInvoice.set(null);
  }
}