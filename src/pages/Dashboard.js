import Chart from 'chart.js/auto';
import { store } from '../store';
import { formatCLP, getCurrentMonthKey } from '../utils';

export const Dashboard = async () => {
  const container = document.createElement('div');
  container.className = 'animate-up';

  const monthKey = getCurrentMonthKey();
  const data = store.getMonthData(monthKey);

  const totalIngresos = data.ingresos.reduce((acc, curr) => acc + curr.monto, 0);
  const totalGastos = data.gastos.reduce((acc, curr) => acc + curr.monto, 0);
  const balance = totalIngresos - totalGastos;

  const today = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  let dateString = new Intl.DateTimeFormat('es-CL', options).format(today);
  dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
  const displayDate = `Hoy es ${dateString}`;

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Bienvenido Hermano</h1>
      <p style="color: var(--text-muted); font-size: 0.875rem;">${displayDate}</p>
    </header>

    <div class="premium-card" style="border-left: 4px solid var(--text-main);">
      <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Balance Total</p>
      <h2 class="amount-display ${balance >= 0 ? 'amount-positive' : 'amount-negative'}" style="font-size: 2rem;">${formatCLP(balance)}</h2>
      <div style="display: flex; gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
        <div>
          <p style="color: var(--text-muted); font-size: 0.7rem;">Ingresos</p>
          <p class="amount-positive" style="font-weight: 600;">${formatCLP(totalIngresos)}</p>
        </div>
        <div>
          <p style="color: var(--text-muted); font-size: 0.7rem;">Gastos</p>
          <p class="amount-negative" style="font-weight: 600;">${formatCLP(totalGastos)}</p>
        </div>
      </div>
      <div class="info-text">
        <i data-lucide="info"></i>
        <span>Tu balance actual considera todos tus ingresos y gastos del mes.</span>
      </div>
    </div>

    <div class="premium-card">
      <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">Gastos por Categoría</h3>
      <div class="info-text" style="margin-bottom: 1.5rem; margin-top: 0;">
        <i data-lucide="pie-chart"></i>
        <span>Visualiza en qué estás gastando más dinero este mes.</span>
      </div>
      <canvas id="categoryChart" style="max-height: 200px; margin-bottom: 1.5rem;"></canvas>
      <div id="chartLegend" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.75rem;"></div>
    </div>


    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <div class="premium-card" style="margin-bottom: 0; border-left: 4px solid #1e3a8a;">
        <h3 style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Banco Chile</h3>
        <p style="font-weight: 600; color: #1e3a8a;">${formatCLP(data.cuentas.banco_personal_debito)}</p>
      </div>
      <div class="premium-card" style="margin-bottom: 0; border-left: 4px solid #1e3a8a;">
        <h3 style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Efectivo Físico</h3>
        <p style="font-weight: 600; color: #1e3a8a;">${formatCLP(data.cuentas.banco_personal_efectivo)}</p>
      </div>
      <div class="premium-card" style="margin-bottom: 0; border-left: 4px solid #1e3a8a;">
        <h3 style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Ahorro MACH</h3>
        <p style="font-weight: 600; color: #1e3a8a;">${formatCLP(data.cuentas.mach_ahorro)}</p>
      </div>
      <div class="premium-card" style="margin-bottom: 0; border-left: 4px solid #1e3a8a;">
        <h3 style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Saldo Bip!</h3>
        <p style="font-weight: 600; color: #1e3a8a;">${formatCLP(data.cuentas.bip_santiago_saldo)}</p>
      </div>
      <div class="premium-card" style="margin-bottom: 0; grid-column: span 2; border-left: 4px solid #1e3a8a;">
        <h3 style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Saldo TNE</h3>
        <p style="font-weight: 600; color: #1e3a8a;">${formatCLP(data.cuentas.bipay_machali_saldo)}</p>
      </div>
    </div>




  `;

  // Render chart after appending to DOM
  setTimeout(() => {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const categories = store.getCategories();
    const chartData = categories.map(cat => {
      return data.gastos
        .filter(g => g.categoriaId === cat.id)
        .reduce((acc, curr) => acc + curr.monto, 0);
    });

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories.map(c => c.name),
        datasets: [{
          data: chartData,
          backgroundColor: categories.map(c => c.color),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 10
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false // Hide default legend
          }
        },
        cutout: '75%'
      }
    });

    // Custom Legend
    const legendDiv = document.getElementById('chartLegend');
    legendDiv.innerHTML = categories.map(cat => `
      <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
        <div style="width: 1.25rem; height: 1.25rem; display: flex; align-items: center; justify-content: center; color: ${cat.color};">
          <i data-lucide="${cat.icon}" style="width: 1rem; height: 1rem;"></i>
        </div>
        <span style="font-weight: 500;">${cat.name}</span>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

  }, 0);

  return container;
};
