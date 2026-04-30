import './style.css';
import { initRouter } from './router';
import { Dashboard } from './pages/Dashboard';
import { Ingresos } from './pages/Ingresos';
import { Gastos } from './pages/Gastos';
import { Categorias } from './pages/Categorias';
import { Transporte } from './pages/Transporte';
import { Cuentas } from './pages/Cuentas';

// Placeholder pages for initial setup

const routes = {
  '/': Dashboard,
  '/ingresos': Ingresos,
  '/gastos': Gastos,
  '/transporte': Transporte,
  '/cuentas': Cuentas,
  '/categorias': Categorias
};

document.addEventListener('DOMContentLoaded', () => {
  initRouter(routes);
});
