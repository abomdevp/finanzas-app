import { store } from '../store';
import { generateId } from '../utils';

const ICON_PRESETS = ['bus', 'utensils', 'shopping-cart', 'gift', 'pill', 'user', 'shirt', 'home', 'coffee', 'book', 'zap', 'car'];

export const Categorias = async () => {
  const container = document.createElement('div');
  container.className = 'animate-up';
  
  const refresh = async () => {
    const categories = store.getCategories();

    container.innerHTML = `
      <header style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Categorías</h1>
        <div class="info-text" style="margin-bottom: 1.5rem;">
          <i data-lucide="settings"></i>
          <span>Personaliza tus categorías para organizar mejor tus gastos.</span>
        </div>
      </header>


      <div class="premium-card">
        ${categories.map(cat => `
          <div class="list-item">
            <div style="display: flex; gap: 1rem; align-items: center;">
              <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: #dbeafe; display: flex; align-items: center; justify-content: center; color: var(--text-main);">
                <i data-lucide="${cat.icon}" style="width: 1.25rem; height: 1.25rem;"></i>
              </div>

              <p style="font-weight: 500;">${cat.name}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="premium-card" style="margin-top: 2rem;">
        <h3 style="margin-bottom: 1.5rem;">Nueva Categoría</h3>
        <form id="categoryForm">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" name="name" class="form-control" placeholder="Ej: Universidad" required>
          </div>
          <div class="form-group">
            <label>Icono</label>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem; background: var(--bg-input); padding: 1rem; border-radius: var(--radius-md);">
              ${ICON_PRESETS.map(icon => `
                <label style="cursor: pointer; display: flex; justify-content: center; align-items: center; padding: 0.5rem; border-radius: 0.5rem; transition: background 0.2s;">
                  <input type="radio" name="icon" value="${icon}" style="display: none;" ${icon === 'zap' ? 'checked' : ''}>
                  <i data-lucide="${icon}" class="icon-option" style="width: 1.5rem; height: 1.5rem; color: var(--text-muted);"></i>
                </label>
              `).join('')}
            </div>
          </div>
          <button type="submit" class="btn-primary">Agregar Categoría</button>

        </form>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Style for icon radio selection
    const iconRadios = container.querySelectorAll('input[name="icon"]');
    iconRadios.forEach(radio => {
      radio.onchange = () => {
        container.querySelectorAll('.icon-option').forEach(icon => icon.style.color = 'var(--text-muted)');
        if (radio.checked) {
          radio.nextElementSibling.style.color = 'var(--text-main)';
        }
      };
      if (radio.checked) radio.nextElementSibling.style.color = 'var(--text-main)';
    });

    const form = container.querySelector('#categoryForm');
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const newCat = {
        id: generateId(),
        name: formData.get('name'),
        color: '#000000',
        icon: formData.get('icon')
      };
      
      store.addCategory(newCat);
      refresh();
    };

  };

  await refresh();
  return container;
};
