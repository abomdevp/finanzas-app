import { store } from '../store';
import { formatCLP, getCurrentMonthKey } from '../utils';

export const Cuentas = async () => {
  const container = document.createElement('div');
  container.className = 'animate-up';

  const monthKey = getCurrentMonthKey();

  const refresh = async () => {
    const data = store.getMonthData(monthKey);
    const cuentas = data.cuentas;

    container.innerHTML = `
      <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Estado de Cuentas</h1>
          <div class="info-text" style="margin-bottom: 0; margin-top: 0;">
            <i data-lucide="wallet"></i>
            <span>Gestiona tu saldo disponible.</span>
          </div>
        </div>
        <button id="openManualBtn" style="background: var(--bg-input); color: var(--text-main); border: none; padding: 0.5rem 0.75rem; border-radius: var(--radius-md); font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
          <i data-lucide="book-open" style="width: 1rem; height: 1rem;"></i>
          Manual
        </button>
      </header>


      <div class="premium-card" style="border-left: 4px solid var(--accent-accounts);">
        <h3 style="font-size: 0.875rem; color: var(--accent-accounts); margin-bottom: 1rem;">Banco Chile - Débito</h3>
        <input type="number" data-key="banco_personal_debito" class="form-control account-input" value="${cuentas.banco_personal_debito}">
      </div>

      <div class="premium-card" style="border-left: 4px solid var(--accent-mach);">
        <h3 style="font-size: 0.875rem; color: var(--accent-mach); margin-bottom: 1rem;">MACH - Cuenta de Ahorro</h3>
        <input type="number" data-key="mach_ahorro" class="form-control account-input" value="${cuentas.mach_ahorro}">
      </div>

      <div class="premium-card" style="border-left: 4px solid #10b981;">
        <h3 style="font-size: 0.875rem; color: #10b981; margin-bottom: 1rem;">Efectivo</h3>
        <input type="number" data-key="banco_personal_efectivo" class="form-control account-input" value="${cuentas.banco_personal_efectivo}">
      </div>

      <button id="saveCuentas" class="btn-primary" style="background: var(--accent-transport); color: white; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39); margin-top: 1rem;">
        Guardar Cambios
      </button>


      <div id="manualModal" class="modal-overlay">
        <div class="modal-content" style="max-height: 85vh; overflow-y: auto; text-align: left;">
          <h2 style="margin-bottom: 1rem; font-size: 1.25rem; color: var(--text-main);">Manual de Uso</h2>
          <div style="font-size: 0.875rem; color: var(--text-main); line-height: 1.6;">
            <h3 style="font-size: 1rem; margin: 1rem 0 0.25rem 0;">1. Resumen</h3>
            <p style="color: var(--text-muted);">Muestra tu balance, el gráfico de gastos y los saldos reales de tus tarjetas.</p>
            
            <h3 style="font-size: 1rem; margin: 1rem 0 0.25rem 0;">2. Ingresos y Gastos</h3>
            <p style="color: var(--text-muted);">Usa el botón circular <strong>+</strong> para anotar dineros. <br><em>Tip: Toca un registro en la lista para editarlo o borrarlo.</em></p>

            <h3 style="font-size: 1rem; margin: 1rem 0 0.25rem 0;">3. Transporte Semanal</h3>
            <p style="color: var(--text-muted);">Anota tus viajes por día. <strong>Se guarda solo.</strong><br>Calcula automáticamente cuánto saldo Bip! te va quedando según lo que anotas.</p>

            <h3 style="font-size: 1rem; margin: 1rem 0 0.25rem 0;">4. Cuentas</h3>
            <p style="color: var(--text-muted);">Aquí pones lo que tienes en los bancos y en efectivo.<br><strong>OJO: Aquí debes presionar "Guardar Cambios".</strong></p>
          </div>
          <button type="button" id="closeManualBtn" class="btn-primary" style="margin-top: 1.5rem;">Entendido</button>
        </div>
      </div>

    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#openManualBtn').onclick = () => {
      container.querySelector('#manualModal').classList.add('active');
    };
    container.querySelector('#closeManualBtn').onclick = () => {
      container.querySelector('#manualModal').classList.remove('active');
    };

    container.querySelector('#saveCuentas').onclick = () => {
      const updates = {};

      container.querySelectorAll('.account-input').forEach(input => {
        updates[input.dataset.key] = parseInt(input.value) || 0;
      });

      store.updateCuentas(monthKey, updates);
      alert('Saldos actualizados');
      refresh();
    };

  };

  await refresh();
  return container;
};
