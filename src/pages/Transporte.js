import { store } from '../store';
import { formatCLP, getCurrentMonthKey } from '../utils';

export const Transporte = async () => {
  const container = document.createElement('div');
  container.className = 'animate-up';

  const monthKey = getCurrentMonthKey();
  let currentWeek = 'semana1';

  // Get the real start date for a given week number (1-4) of the current month
  const getWeekDates = (weekNum) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    const firstMonday = new Date(year, month, 1 + (dayOfWeek <= 1 ? 0 : daysToMonday) - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  };

  const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const TRANSPORT_TYPES = [
    { key: 'bus', label: 'Bus', icon: 'bus' },
    { key: 'metro', label: 'Metro', icon: 'train-front' },
    { key: 'micro_santiago', label: 'Micro STGO', icon: 'truck' }
  ];

  const updateCalculations = () => {
    const data = store.getMonthData(monthKey);
    const weekData = data.transporte[currentWeek];
    const cuentas = data.cuentas;

    // Daily totals
    const dailyTotals = Array.from({ length: 7 }, (_, day) =>
      TRANSPORT_TYPES.reduce((sum, t) => sum + (weekData[t.key]?.[day] || 0), 0)
    );

    // Type totals
    const typeTotals = TRANSPORT_TYPES.reduce((acc, t) => {
      acc[t.key] = weekData[t.key]?.reduce((s, v) => s + v, 0) || 0;
      return acc;
    }, {});

    const totalSemanal = Object.values(typeTotals).reduce((s, v) => s + v, 0);
    const mostUsed = TRANSPORT_TYPES.reduce((best, t) =>
      typeTotals[t.key] > typeTotals[best.key] ? t : best
      , TRANSPORT_TYPES[0]);

    let totalMesGasto = 0;
    Object.values(data.transporte).forEach(week => {
      TRANSPORT_TYPES.forEach(t => {
        totalMesGasto += (week[t.key] || []).reduce((s, v) => s + v, 0);
      });
    });

    const bipGasto = totalMesGasto;
    const bipRestante = (cuentas.bip_santiago_saldo || 0) - bipGasto;

    // DOM Updates
    const elTotalSemanal = container.querySelector('#total-semanal');
    if (elTotalSemanal) elTotalSemanal.innerText = formatCLP(totalSemanal);

    const elMostUsedLabel = container.querySelector('#most-used-label');
    if (elMostUsedLabel) elMostUsedLabel.innerText = mostUsed.label;

    const elMostUsedIcon = container.querySelector('#most-used-icon');
    if (elMostUsedIcon) {
      elMostUsedIcon.setAttribute('data-lucide', mostUsed.icon);
      if (window.lucide) window.lucide.createIcons({ nameAttr: 'data-lucide', attrs: { class: 'lucide' } });
    }

    const elBipGasto = container.querySelector('#bip-gasto');
    if (elBipGasto) elBipGasto.innerText = `- ${formatCLP(bipGasto)}`;

    const elBipRestante = container.querySelector('#bip-restante');
    if (elBipRestante) {
      elBipRestante.innerText = formatCLP(bipRestante);
      elBipRestante.style.color = bipRestante >= 0 ? 'var(--accent-transport)' : '#dc2626';
    }

    // Daily DOM updates
    dailyTotals.forEach((total, idx) => {
      const elDayTotal = container.querySelector(`#day-total-${idx}`);
      if (elDayTotal) {
        elDayTotal.innerText = total > 0 ? formatCLP(total) : '—';
        elDayTotal.style.color = total > 0 ? 'var(--text-main)' : 'var(--text-muted)';
      }
    });

    // Type DOM updates
    TRANSPORT_TYPES.forEach(t => {
      const elTypeTotal = container.querySelector(`#type-total-${t.key}`);
      if (elTypeTotal) {
        elTypeTotal.innerText = formatCLP(typeTotals[t.key]);
      }
    });
  };

  const render = () => {
    const data = store.getMonthData(monthKey);
    const weekData = data.transporte[currentWeek];
    const cuentas = data.cuentas;
    const weekNum = parseInt(currentWeek.slice(-1));
    const weekDates = getWeekDates(weekNum);

    container.innerHTML = `
      <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Transporte Semanal</h1>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Gestiona tus saldos y registra tus viajes diarios.</p>
        </div>
        <button id="openManualBtn" style="background: var(--bg-input); color: var(--text-main); border: none; padding: 0.5rem 0.75rem; border-radius: var(--radius-md); font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
          <i data-lucide="book-open" style="width: 1rem; height: 1rem;"></i>
          Manual
        </button>
      </header>

      <!-- Saldos de Transporte -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div class="premium-card" style="margin-bottom: 0; padding: 1rem; border-left: 4px solid var(--accent-transport);">
          <h3 style="font-size: 0.8rem; color: var(--accent-transport); margin-bottom: 0.75rem;">Bip! Santiago</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div>
              <label style="font-size: 0.65rem; color: var(--text-muted);">Saldo Actual</label>
              <input type="number" id="input-saldo-bip_santiago" data-key="bip_santiago_saldo" class="form-control transport-cuenta-input" value="${cuentas.bip_santiago_saldo}" style="padding: 0.4rem; font-size: 0.8rem; font-weight: 700;">
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: flex-end;">
              <div style="flex: 1;">
                <label style="font-size: 0.65rem; color: var(--text-muted);">Monto a sumar/restar</label>
                <input type="number" id="input-carga-bip_santiago" data-key="bip_santiago_carga" class="form-control transport-cuenta-input" value="${cuentas.bip_santiago_carga}" placeholder="0" style="padding: 0.4rem; font-size: 0.8rem;">
              </div>
              <button class="btn-operar btn-sumar" data-target="bip_santiago" data-op="add" style="background: var(--accent-transport); color: white; border: none; border-radius: 0.3rem; padding: 0.4rem; cursor: pointer;">
                <i data-lucide="plus" style="width: 1rem; height: 1rem;"></i>
              </button>
              <button class="btn-operar btn-restar" data-target="bip_santiago" data-op="sub" style="background: #ef4444; color: white; border: none; border-radius: 0.3rem; padding: 0.4rem; cursor: pointer;">
                <i data-lucide="minus" style="width: 1rem; height: 1rem;"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="premium-card" style="margin-bottom: 0; padding: 1rem; border-left: 4px solid var(--accent-transport);">
          <h3 style="font-size: 0.8rem; color: var(--accent-transport); margin-bottom: 0.75rem;">TNE Machalí (por añadir)</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div>
              <label style="font-size: 0.65rem; color: var(--text-muted);">Saldo Actual</label>
              <input type="number" id="input-saldo-bipay_machali" data-key="bipay_machali_saldo" class="form-control transport-cuenta-input" value="${cuentas.bipay_machali_saldo}" style="padding: 0.4rem; font-size: 0.8rem; font-weight: 700;">
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: flex-end;">
              <div style="flex: 1;">
                <label style="font-size: 0.65rem; color: var(--text-muted);">Monto a sumar/restar</label>
                <input type="number" id="input-carga-bipay_machali" data-key="bipay_machali_carga" class="form-control transport-cuenta-input" value="${cuentas.bipay_machali_carga}" placeholder="0" style="padding: 0.4rem; font-size: 0.8rem;">
              </div>
              <button class="btn-operar btn-sumar" data-target="bipay_machali" data-op="add" style="background: var(--accent-transport); color: white; border: none; border-radius: 0.3rem; padding: 0.4rem; cursor: pointer;">
                <i data-lucide="plus" style="width: 1rem; height: 1rem;"></i>
              </button>
              <button class="btn-operar btn-restar" data-target="bipay_machali" data-op="sub" style="background: #ef4444; color: white; border: none; border-radius: 0.3rem; padding: 0.4rem; cursor: pointer;">
                <i data-lucide="minus" style="width: 1rem; height: 1rem;"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Selector de semana -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.25rem;">
        ${['semana1', 'semana2', 'semana3', 'semana4'].map(w => `
          <button class="week-btn" data-week="${w}" style="
            padding: 0.6rem 1.2rem;
            border-radius: 2rem;
            border: 1px solid ${currentWeek === w ? 'var(--text-main)' : 'rgba(0,0,0,0.08)'};
            background: ${currentWeek === w ? 'var(--text-main)' : 'white'};
            color: ${currentWeek === w ? 'white' : 'var(--text-muted)'};
            font-size: 0.75rem;
            font-weight: 600;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s;
          ">Semana ${w.slice(-1)}</button>
        `).join('')}
      </div>

      <!-- Resumen Semanal -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div class="premium-card" style="margin-bottom: 0; border-left: 4px solid var(--text-main);">
          <p style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">Gasto Total Semana</p>
          <p id="total-semanal" style="font-weight: 700; font-size: 1.1rem;">$0</p>
        </div>
        <div class="premium-card" style="margin-bottom: 0; border-left: 4px solid var(--accent-transport);">
          <p style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">Más usado</p>
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <i id="most-used-icon" data-lucide="bus" style="width: 1rem; height: 1rem; color: var(--accent-transport);"></i>
            <p id="most-used-label" style="font-weight: 700;">Bus</p>
          </div>
        </div>
      </div>

      <!-- Saldo estimado Bip! -->
      <div class="premium-card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--accent-transport);">
        <p style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Saldo Bip! Proyectado</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="font-size: 0.75rem; color: var(--text-muted);">Gastado este mes</p>
            <p id="bip-gasto" style="font-weight: 600;">$0</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 0.75rem; color: var(--text-muted);">Saldo restante</p>
            <p id="bip-restante" style="font-weight: 700; font-size: 1.1rem; color: var(--accent-transport);">$0</p>
          </div>
        </div>
        ${cuentas.bip_santiago_saldo === 0 ? `
          <div class="info-text" style="margin-top: 0.75rem;">
            <i data-lucide="alert-circle"></i>
            <span>Configura tu saldo actual arriba para ver la proyección.</span>
          </div>
        ` : ''}
      </div>

      <!-- Cards por día -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${DAY_NAMES.map((_, idx) => {
      const date = weekDates[idx];
      let fullDateStr = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
      fullDateStr = fullDateStr.charAt(0).toUpperCase() + fullDateStr.slice(1);

      return `
            <div class="premium-card" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="width: 2.25rem; height: 2.25rem; border-radius: 50%; background: var(--bg-input); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: var(--text-main);">${date.getDate()}</div>
                  <div>
                    <p style="font-weight: 600; font-size: 0.95rem;">${fullDateStr}</p>
                  </div>
                </div>
                <p id="day-total-${idx}" style="font-weight: 700; font-size: 0.95rem; color: var(--text-muted);">—</p>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
                ${TRANSPORT_TYPES.map(t => `
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.4rem;">
                      <i data-lucide="${t.icon}" style="width: 0.75rem; height: 0.75rem; color: var(--text-muted);"></i>
                      <label style="font-size: 0.65rem; color: var(--text-muted);">${t.label}</label>
                    </div>
                    <input
                      type="number"
                      class="transport-input form-control"
                      data-day="${idx}"
                      data-type="${t.key}"
                      value="${weekData[t.key]?.[idx] || ''}"
                      placeholder="0"
                      style="padding: 0.5rem; font-size: 0.875rem; text-align: center;"
                      min="0"
                    >
                  </div>
                `).join('')}
              </div>
            </div>
          `;
    }).join('')}
      </div>

      <!-- Totales por tipo -->
      <div class="premium-card" style="margin-top: 1.5rem; border-left: 4px solid var(--text-main);">
        <p style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">Total según método de transporte</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
          ${TRANSPORT_TYPES.map(t => `
            <div style="text-align: center;">
              <i data-lucide="${t.icon}" style="width: 1rem; height: 1rem; color: var(--accent-transport); margin-bottom: 0.25rem;"></i>
              <p style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 0.25rem;">${t.label}</p>
              <p id="type-total-${t.key}" style="font-weight: 700; font-size: 0.9rem;">$0</p>
            </div>
          `).join('')}
        </div>
        </div>
      </div>

      <!-- Manual Modal Transporte -->
      <div id="manualModal" class="modal-overlay">
        <div class="modal-content" style="max-height: 85vh; overflow-y: auto; text-align: left;">
          <h2 style="margin-bottom: 1rem; font-size: 1.25rem; color: var(--text-main);">Manual de Transporte</h2>
          <div style="font-size: 0.875rem; color: var(--text-main); line-height: 1.6;">
            <h3 style="font-size: 1rem; margin: 1rem 0 0.25rem 0;">1. Saldos y Cargas</h3>
            <p style="color: var(--text-muted);">Acá arriba va el saldo de tu Bip! o TNE. Si cargas dinero en el metro, simplemente pon el monto en la caja y presiona el botón azul <strong style="color: var(--accent-transport);">[+]</strong>. ¡Tu saldo subirá al instante!</p>
            <p style="color: var(--text-muted); margin-top: 0.5rem;"><em>Tip: Si gastaste un pasaje que se te olvidó anotar, puedes descontarlo rápidamente con el botón rojo <strong>[-]</strong>.</em></p>
            
            <h3 style="font-size: 1rem; margin: 1rem 0 0.25rem 0;">2. Registro Diario</h3>
            <p style="color: var(--text-muted);">Más abajo, anota día por día cuánto gastaste. <strong>Todo se guarda solo.</strong> Usa los botones de arriba para cambiar de semana.</p>

            <h3 style="font-size: 1rem; margin: 1rem 0 0.25rem 0;">3. Saldo Bip! Proyectado</h3>
            <p style="color: var(--text-muted);">Esta caja toma tu "Saldo Actual" y le resta automáticamente TODOS los viajes que hayas anotado en las cuatro semanas del mes. Así sabes exactamente cuánta plata tienes disponible en la tarjeta sin sacar cálculos matemáticos o usar excel.</p>
          </div>
          <button type="button" id="closeManualBtn" class="btn-primary" style="margin-top: 1.5rem; background: var(--accent-transport);">Entendido</button>
        </div>
      </div>

    `;

    if (window.lucide) window.lucide.createIcons();

    // Modal Logic
    container.querySelector('#openManualBtn').onclick = () => {
      container.querySelector('#manualModal').classList.add('active');
    };
    container.querySelector('#closeManualBtn').onclick = () => {
      container.querySelector('#manualModal').classList.remove('active');
    };

    updateCalculations();

    // Week switching
    container.querySelectorAll('.week-btn').forEach(btn => {
      btn.onclick = () => {
        currentWeek = btn.dataset.week;
        render(); // Full re-render when switching weeks
      };
    });

    // Auto-save on input WITHOUT full re-render
    container.querySelectorAll('.transport-input').forEach(input => {
      input.oninput = () => {
        const type = input.dataset.type;
        const day = parseInt(input.dataset.day);
        const newValue = parseInt(input.value) || 0;

        const currentData = [...(store.getMonthData(monthKey).transporte[currentWeek][type] || [])];
        currentData[day] = newValue;
        store.updateTransporte(monthKey, currentWeek, type, currentData);

        // Update ONLY text numbers, keeping focus and scroll position intact
        updateCalculations();
      };
    });

    // Auto-save for Transport Cuentas
    container.querySelectorAll('.transport-cuenta-input').forEach(input => {
      input.oninput = () => {
        const key = input.dataset.key;
        const newValue = parseInt(input.value) || 0;

        store.updateCuentas(monthKey, { [key]: newValue });

        // Update calculations so the Bip! remaining balance reflects the new Initial Balance immediately
        updateCalculations();
      };
    });

    // "Sumar/Restar" button logic
    container.querySelectorAll('.btn-operar').forEach(btn => {
      btn.onclick = () => {
        const target = btn.dataset.target; // 'bip_santiago' or 'bipay_machali'
        const op = btn.dataset.op; // 'add' or 'sub'
        const inputCarga = container.querySelector(`#input-carga-${target}`);
        const inputSaldo = container.querySelector(`#input-saldo-${target}`);

        const amountVal = parseInt(inputCarga.value) || 0;
        let saldoVal = parseInt(inputSaldo.value) || 0;

        if (amountVal > 0) {
          if (op === 'add') {
            saldoVal += amountVal;
          } else if (op === 'sub') {
            saldoVal -= amountVal;
          }

          // Update DOM Inputs
          inputSaldo.value = saldoVal;
          inputCarga.value = 0; // reset input

          // Save to store
          store.updateCuentas(monthKey, {
            [`${target}_saldo`]: saldoVal,
            [`${target}_carga`]: 0
          });

          // Trigger calculations
          updateCalculations();
        }
      };
    });
  };

  render();
  return container;
};
