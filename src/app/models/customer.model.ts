export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  total_spent: number; // Para analítica en el dashboard
  created_at: number;
}