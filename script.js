// Configuración de la API
const API_URL = 'https://script.google.com/macros/s/AKfycbwnjuYm2rQkiyngtW2z94ehMyKweZ5T_h0kEZeYlc3Fnz9LXw75gzFeP9kD9oDH6aG6/exec';

/**
 * Inicialización al cargar el documento
 */
window.onload = function() {
    cargarCatalogoProductos();
    cargarCatalogoDepartamentos();
    cargarCatalogoResponsables();
    cargarInventario();
};

/**
 * Obtiene el catálogo de productos desde la pestaña Catalogo_Productos
 */
async function cargarCatalogoProductos() {
    const select = document.getElementById('idProducto');
    try {
        const response = await fetch(`${API_URL}?sheet=Catalogo_Productos`);
        const productos = await response.json();
        
        select.innerHTML = '<option value="">Seleccione producto...</option>';
        productos.forEach(p => {
            let opt = document.createElement('option');
            opt.value = p.ID_Producto;
            opt.text = `${p.Nombre_Producto} (${p.ID_Producto})`;
            select.add(opt);
        });
    } catch (error) {
        console.error("Error en catálogo:", error);
        select.innerHTML = '<option>Error al cargar catálogo</option>';
    }
}

/**
 * Obtiene la lista de áreas desde la pestaña Catalogo_Departamentos
 */
async function cargarCatalogoDepartamentos() {
    const select = document.getElementById('departamento');
    try {
        const response = await fetch(`${API_URL}?sheet=Catalogo_Departamentos`);
        const departamentos = await response.json();
        
        select.innerHTML = '<option value="">Seleccione área...</option>';
        departamentos.forEach(d => {
            let opt = document.createElement('option');
            // Usamos el nombre de la columna definida en Sheets
            opt.value = d.Nombre_Departamento; 
            opt.text = d.Nombre_Departamento;
            select.add(opt);
        });
    } catch (error) {
        console.error("Error en catálogo de departamentos:", error);
        select.innerHTML = '<option value="">Error al cargar áreas</option>';
    }
}

/**
 * Obtiene el catálogo de empleados desde la pestaña Catalogo_Responsables
 */
async function cargarCatalogoResponsables() {
    const select = document.getElementById('responsable');
    try {
        // Pedimos la pestaña de responsables a la API
        const response = await fetch(`${API_URL}?sheet=Catalogo_Responsables`);
        const personal = await response.json();
        
        select.innerHTML = '<option value="">Seleccione responsable...</option>';
        personal.forEach(p => {
            let opt = document.createElement('option');
            // Guardamos el nombre o ID según lo que necesites en la BD
            opt.value = `${p.ID_Empleado} - ${p.Nombre_Empleado}`; 
            opt.text = `${p.ID_Empleado} - ${p.Nombre_Empleado}`;
            select.add(opt);
        });
    } catch (error) {
        console.error("Error en catálogo de responsables:", error);
        select.innerHTML = '<option value="">Error al cargar personal</option>';
    }
}


/**
 * Obtiene y renderiza el inventario actual
 */
async function cargarInventario() {
    const tabla = document.getElementById('tablaCuerpo');
    const loader = document.getElementById('loader');
    const btn = document.getElementById('btnActualizar');
    
    tabla.innerHTML = '';
    loader.classList.remove('d-none');
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}?sheet=Productos`);
        const data = await response.json();
        
        data.forEach(item => {
            const row = `<tr>
                <td><small class="text-muted">${item.ID}</small></td>
                <td class="fw-bold">${item.Nombre}</td>
                <td class="text-center">
                    <span class="badge rounded-pill ${item.Stock < 10 ? 'bg-danger' : 'bg-success'}" style="min-width: 50px;">
                        ${item.Stock}
                    </span>
                </td>
                <td><span class="text-muted" style="font-size: 0.9rem;">${item.Departamento}</span></td>
            </tr>`;
            tabla.innerHTML += row;
        });
    } catch (error) {
        tabla.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error de conexión con la base de datos</td></tr>';
    } finally {
        loader.classList.add('d-none');
        btn.disabled = false;
    }
}

/**
 * Procesa el envío del formulario hacia la base de datos
 */
document.getElementById('formMovimiento').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const datos = {
        idProducto: document.getElementById('idProducto').value,
        tipo: document.getElementById('tipo').value,
        cantidad: document.getElementById('cantidad').value,
        responsable: document.getElementById('responsable').value,
        departamento: document.getElementById('departamento').value
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        alert('Movimiento registrado correctamente.');
        document.getElementById('formMovimiento').reset();
        setTimeout(cargarInventario, 1500); 
    } catch (error) {
        alert('Error al procesar el envío.');
    }
});
