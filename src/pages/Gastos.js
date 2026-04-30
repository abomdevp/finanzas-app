import { store } from '../store';
import { formatCLP, getCurrentMonthKey, generateId, formatDateWithDay } from '../utils';


export const Gastos = async () => {
  const container = document.createElement('div');
  container.className = 'animate-up';

  const monthKey = getCurrentMonthKey();
  let editingId = null;

  const refresh = async () => {
    const data = store.getMonthData(monthKey);
    const categories = store.getCategories();
    const total = data.gastos.reduce((acc, curr) => acc + curr.monto, 0);

    container.innerHTML = `
      <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Gastos</h1>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Total: ${formatCLP(total)}</p>
        </div>
        <a href="/categorias" data-link style="color: var(--text-main); text-decoration: none; font-size: 0.875rem; font-weight: 600;">Categorías</a>
      </header>
      <div class="info-text" style="margin-bottom: 1.5rem;">
        <i data-lucide="trending-down"></i>
        <span>Haz clic en un gasto para editarlo o borrarlo.</span>
      </div>

      <div class="premium-card">
        ${data.gastos.length === 0 ? `
          <p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No hay gastos registrados este mes.</p>
        ` : data.gastos.map(gas => {
      const cat = categories.find(c => c.id === gas.categoriaId) || { name: 'Sin categoría', icon: 'help-circle', color: '#ccc' };
      return `
            <div class="list-item edit-gasto" data-id="${gas.id}" style="cursor: pointer;">
              <div style="display: flex; gap: 1rem; align-items: center;">
                <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: #dbeafe; display: flex; align-items: center; justify-content: center; color: var(--text-main);">
                  <i data-lucide="${cat.icon}" style="width: 1.25rem; height: 1.25rem;"></i>
                </div>
                <div>
                  <p style="font-weight: 500;">${gas.descripcion}</p>
                  <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: capitalize;">${formatDateWithDay(gas.fecha)} ${cat.name} - ${gas.medio}</p>
                </div>


              </div>
              <p class="amount-negative" style="font-weight: 600; color: black;">- ${formatCLP(gas.monto)}</p>
            </div>
          `;
    }).join('')}
      </div>

      <button id="addGastoBtn" class="btn-fab">

        <i data-lucide="plus"></i>
      </button>

      <div id="gastoModal" class="modal-overlay">
        <div class="modal-content">
          <h2 id="modalTitle" style="margin-bottom: 0.5rem;">Nuevo Gasto</h2>
          <div class="info-text" style="margin-bottom: 1.5rem; margin-top: 0;">
            <i data-lucide="info"></i>
            <span>Categoriza tu gasto para tener mejores estadísticas.</span>
          </div>
          <form id="gastoForm">
            <div class="form-group">
              <label>Descripción</label>
              <input type="text" name="descripcion" class="form-control" placeholder="Ej: Almuerzo" required>
            </div>
            <div class="form-group">
              <label>Monto (CLP)</label>
              <input type="number" name="monto" class="form-control" placeholder="0" required>
            </div>
            <div class="form-group">
              <label>Categoría</label>
              <select name="categoriaId" class="form-control">
                ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
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
            <button type="submit" id="submitBtn" class="btn-primary">Guardar Gasto</button>

            <button type="button" id="deleteBtn" style="display: none; width: 100%; background: #fee2e2; color: #dc2626; border: none; border-radius: var(--radius-md); padding: 1rem; font-weight: 600; margin-top: 0.5rem; cursor: pointer;">Eliminar Gasto</button>
            <button type="button" id="closeModal" style="width: 100%; background: transparent; border: none; color: var(--text-muted); margin-top: 1rem; cursor: pointer;">Cancelar</button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const btn = container.querySelector('#addGastoBtn');
    const modal = container.querySelector('#gastoModal');
    const form = container.querySelector('#gastoForm');
    const closeBtn = container.querySelector('#closeModal');
    const deleteBtn = container.querySelector('#deleteBtn');
    const modalTitle = container.querySelector('#modalTitle');
    const submitBtn = container.querySelector('#submitBtn');

    const openModal = (id = null) => {
      editingId = id;
      if (id) {
        const gas = data.gastos.find(g => g.id === id);
        form.descripcion.value = gas.descripcion;
        form.monto.value = gas.monto;
        form.categoriaId.value = gas.categoriaId;
        form.medio.value = gas.medio;
        form.fecha.value = gas.fecha;
        modalTitle.innerText = 'Editar Gasto';
        submitBtn.innerText = 'Actualizar Gasto';
        deleteBtn.style.display = 'block';
      } else {
        form.reset();
        form.fecha.value = new Date().toISOString().split('T')[0];
        modalTitle.innerText = 'Nuevo Gasto';
        submitBtn.innerText = 'Guardar Gasto';
        deleteBtn.style.display = 'none';
      }
      modal.classList.add('active');
    };

    btn.onclick = () => openModal();
    closeBtn.onclick = () => modal.classList.remove('active');

    container.querySelectorAll('.edit-gasto').forEach(item => {
      item.onclick = () => openModal(item.dataset.id);
    });

    deleteBtn.onclick = () => {
      if (confirm('¿Estás seguro de eliminar este gasto?')) {
        store.deleteGasto(monthKey, editingId);
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
        categoriaId: formData.get('categoriaId'),
        medio: formData.get('medio'),
        fecha: formData.get('fecha')
      };

      if (editingId) {
        store.updateGasto(monthKey, editingId, entry);
      } else {
        store.addGasto(monthKey, { id: generateId(), ...entry });
      }

      modal.classList.remove('active');
      refresh();
    };
  };

  await refresh();
  return container;
};
