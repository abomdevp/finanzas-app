import { store } from '../store';
import { formatCLP, getCurrentMonthKey, generateId, formatDateWithDay } from '../utils';


export const Ingresos = async () => {
  const container = document.createElement('div');
  container.className = 'animate-up';

  const monthKey = getCurrentMonthKey();
  let editingId = null;

  const refresh = async () => {
    const data = store.getMonthData(monthKey);
    const total = data.ingresos.reduce((acc, curr) => acc + curr.monto, 0);

    container.innerHTML = `
      <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Ingresos</h1>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Total: ${formatCLP(total)}</p>
        </div>
      </header>
      <div class="info-text" style="margin-bottom: 1.5rem;">
        <i data-lucide="trending-up"></i>
        <span>Haz clic en un registro para editarlo o borrarlo.</span>
      </div>

      <div class="premium-card">
        ${data.ingresos.length === 0 ? `
          <p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No hay ingresos registrados este mes.</p>
        ` : data.ingresos.map(ing => `
          <div class="list-item edit-ingreso" data-id="${ing.id}" style="cursor: pointer;">
            <div>
              <p style="font-weight: 500;">${ing.descripcion}</p>
              <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: capitalize;">${formatDateWithDay(ing.fecha)} - ${ing.medio.replace('_', ' ')}</p>
            </div>

            <p class="amount-positive" style="font-weight: 600;">+ ${formatCLP(ing.monto)}</p>
          </div>
        `).join('')}
      </div>

      <button id="addIngresoBtn" class="btn-fab">
        <i data-lucide="plus"></i>
      </button>

      <div id="ingresoModal" class="modal-overlay">
        <div class="modal-content">
          <h2 id="modalTitle" style="margin-bottom: 0.5rem;">Nuevo Ingreso</h2>
          <div class="info-text" style="margin-bottom: 1.5rem; margin-top: 0;">
            <i data-lucide="info"></i>
            <span>Ingresa el detalle del dinero que recibiste.</span>
          </div>
          <form id="ingresoForm">
            <input type="hidden" name="id">
            <div class="form-group">
              <label>Descripción</label>
              <input type="text" name="descripcion" class="form-control" placeholder="Ej: Mesada" required>
            </div>
            <div class="form-group">
              <label>Monto (CLP)</label>
              <input type="number" name="monto" class="form-control" placeholder="0" required>
            </div>
            <div class="form-group">
              <label>Medio de Pago</label>
              <select name="medio" class="form-control">
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fecha</label>
              <input type="date" name="fecha" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <button type="submit" id="submitBtn" class="btn-primary">Guardar Ingreso</button>
            <button type="button" id="deleteBtn" style="display: none; width: 100%; background: #fee2e2; color: #dc2626; border: none; border-radius: var(--radius-md); padding: 1rem; font-weight: 600; margin-top: 0.5rem; cursor: pointer;">Eliminar Registro</button>
            <button type="button" id="closeModal" style="width: 100%; background: transparent; border: none; color: var(--text-muted); margin-top: 1rem; cursor: pointer;">Cancelar</button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const btn = container.querySelector('#addIngresoBtn');
    const modal = container.querySelector('#ingresoModal');
    const form = container.querySelector('#ingresoForm');
    const closeBtn = container.querySelector('#closeModal');
    const deleteBtn = container.querySelector('#deleteBtn');
    const modalTitle = container.querySelector('#modalTitle');
    const submitBtn = container.querySelector('#submitBtn');

    const openModal = (id = null) => {
      editingId = id;
      if (id) {
        const ing = data.ingresos.find(i => i.id === id);
        form.descripcion.value = ing.descripcion;
        form.monto.value = ing.monto;
        form.medio.value = ing.medio;
        form.fecha.value = ing.fecha;
        modalTitle.innerText = 'Editar Ingreso';
        submitBtn.innerText = 'Actualizar Ingreso';
        deleteBtn.style.display = 'block';
      } else {
        form.reset();
        form.fecha.value = new Date().toISOString().split('T')[0];
        modalTitle.innerText = 'Nuevo Ingreso';
        submitBtn.innerText = 'Guardar Ingreso';
        deleteBtn.style.display = 'none';
      }
      modal.classList.add('active');
    };

    btn.onclick = () => openModal();
    closeBtn.onclick = () => modal.classList.remove('active');

    container.querySelectorAll('.edit-ingreso').forEach(item => {
      item.onclick = () => openModal(item.dataset.id);
    });

    deleteBtn.onclick = () => {
      if (confirm('¿Estás seguro de eliminar este registro?')) {
        store.deleteIngreso(monthKey, editingId);
        modal.classList.remove('active');
        refresh();
      }
    };

    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const entry = {
        descripcion: formData.get('descripcion'),
        monto: parseInt(formData.get('monto')),
        medio: formData.get('medio'),
        fecha: formData.get('fecha')
      };

      if (editingId) {
        store.updateIngreso(monthKey, editingId, entry);
      } else {
        store.addIngreso(monthKey, { id: generateId(), ...entry });
      }

      modal.classList.remove('active');
      refresh();
    };
  };

  await refresh();
  return container;
};
