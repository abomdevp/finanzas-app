import { getCurrentMonthKey } from './utils';

const STORAGE_KEY = 'guty_finanzas_data';

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Transporte', color: '#3b82f6', icon: 'bus' },
  { id: 'cat-2', name: 'Comida', color: '#f59e0b', icon: 'utensils' },
  { id: 'cat-3', name: 'Compras Super', color: '#10b981', icon: 'shopping-cart' },
  { id: 'cat-4', name: 'Regalos', color: '#ec4899', icon: 'gift' },
  { id: 'cat-5', name: 'Medicamentos', color: '#ef4444', icon: 'pill' },
  { id: 'cat-6', name: 'Personal', color: '#8b5cf6', icon: 'user' },
  { id: 'cat-7', name: 'Ropa', color: '#6366f1', icon: 'shirt' }
];

const INITIAL_DATA = {
  categories: DEFAULT_CATEGORIES,
  months: {}
};

const getInitialMonthData = () => ({
  ingresos: [],
  gastos: [],
  transporte: {
    semana1: createEmptyWeek(),
    semana2: createEmptyWeek(),
    semana3: createEmptyWeek(),
    semana4: createEmptyWeek(),
  },
  cuentas: {
    banco_personal_debito: 0,
    banco_personal_efectivo: 0,
    mach_ahorro: 0,
    bip_santiago_carga: 0,
    bip_santiago_saldo: 0,
    bipay_machali_carga: 0,
    bipay_machali_saldo: 0,
    saldo_mes_anterior: {
      personal_debito: 0,
      personal_efectivo: 0
    }
  }


});

const createEmptyWeek = () => ({
  bus: [0, 0, 0, 0, 0, 0, 0],
  metro: [0, 0, 0, 0, 0, 0, 0],
  micro_santiago: [0, 0, 0, 0, 0, 0, 0]
});


class Store {
  constructor() {
    this.data = this.load();
  }

  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  getMonthData(monthKey = getCurrentMonthKey()) {
    if (!this.data.months[monthKey]) {
      const initialData = getInitialMonthData();
      
      // Inherit accounts from the latest available month
      const existingMonths = Object.keys(this.data.months).sort();
      if (existingMonths.length > 0) {
        const lastMonthKey = existingMonths[existingMonths.length - 1];
        const lastMonthData = this.data.months[lastMonthKey];
        if (lastMonthData && lastMonthData.cuentas) {
          initialData.cuentas = JSON.parse(JSON.stringify(lastMonthData.cuentas));
          
          // Clean up "cargas" so they don't carry over
          initialData.cuentas.bip_santiago_carga = 0;
          initialData.cuentas.bipay_machali_carga = 0;
        }
      }
      
      this.data.months[monthKey] = initialData;
      this.save();
    }
    return this.data.months[monthKey];
  }

  addIngreso(monthKey, ingreso) {
    this.getMonthData(monthKey).ingresos.push(ingreso);
    this.save();
  }

  updateIngreso(monthKey, id, updates) {
    const data = this.getMonthData(monthKey);
    const index = data.ingresos.findIndex(ing => ing.id === id);
    if (index !== -1) {
      data.ingresos[index] = { ...data.ingresos[index], ...updates };
      this.save();
    }
  }

  deleteIngreso(monthKey, id) {
    const data = this.getMonthData(monthKey);
    data.ingresos = data.ingresos.filter(ing => ing.id !== id);
    this.save();
  }

  addGasto(monthKey, gasto) {
    this.getMonthData(monthKey).gastos.push(gasto);
    this.save();
  }

  updateGasto(monthKey, id, updates) {
    const data = this.getMonthData(monthKey);
    const index = data.gastos.findIndex(gas => gas.id === id);
    if (index !== -1) {
      data.gastos[index] = { ...data.gastos[index], ...updates };
      this.save();
    }
  }

  deleteGasto(monthKey, id) {
    const data = this.getMonthData(monthKey);
    data.gastos = data.gastos.filter(gas => gas.id !== id);
    this.save();
  }

  updateTransporte(monthKey, semana, tipo, valores) {
    this.getMonthData(monthKey).transporte[semana][tipo] = valores;
    this.save();
  }

  updateCuentas(monthKey, cuentas) {
    this.getMonthData(monthKey).cuentas = { ...this.getMonthData(monthKey).cuentas, ...cuentas };
    this.save();
  }


  getCategories() {
    return this.data.categories;
  }

  addCategory(category) {
    this.data.categories.push(category);
    this.save();
  }
}

export const store = new Store();
