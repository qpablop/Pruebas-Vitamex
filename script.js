const API_URL = 'https://script.google.com/macros/s/AKfycbyceyPimtHb6sQeIrBNJf9YAQQLFERV0VbDe-CIV0tIHTFUICrKppjJgzkeHbwqZ94QIQ/exec';

// Manejo de Login
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    // Enviar al Backend
    await fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        body: JSON.stringify({ action: "login", user: user, pass: pass })
    });

    // Simulación de éxito para la demo (Seguridad real en Backend)
    document.getElementById('loginOverlay').classList.add('d-none');
    document.getElementById('mainContent').classList.remove('d-none');
    inicializarApp();
});

function inicializarApp() {
    cargarCatalogo("Catalogo_Productos", "idProducto", p => `${p.Nombre_Producto} (${p.ID_Producto})`, p => p.ID_Producto);
    cargarCatalogo("Catalogo_Responsables", "responsable", r => `${r.ID_Empleado} - ${r.Nombre_Empleado}`, r => r.Nombre_Empleado);
    cargarCatalogo("Catalogo_Departamentos", "departamento", d => d.Nombre_Departamento, d => d.Nombre_Departamento);
    cargarInventario();
}

async function cargarCatalogo(pestaña, elementoId, textoFn, valorFn) {
    const res = await fetch(`${API_URL}?sheet=${pestaña}`);
    const data = await res.json();
    const select = document.getElementById(elementoId);
    select.innerHTML = '<option value="">Seleccione...</option>';
    data.forEach(item => {
        let opt = document.createElement('option');
        opt.value = valorFn(item);
        opt.text = textoFn(item);
        select.add(opt);
    });
}

async function cargarInventario() {
    const res = await fetch(`${API_URL}?sheet=Productos`);
    const data = await res.json();
    const tabla = document.getElementById('tablaCuerpo');
    tabla.innerHTML = data.map(i => `<tr><td>${i.ID}</td><td>${i.Nombre}</td><td><span class="badge ${i.Stock < 10 ? 'bg-danger':'bg-success'}">${i.Stock}</span></td><td>${i.Departamento}</td></tr>`).join('');
}

document.getElementById('formMovimiento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        action: "registro_movimiento",
        idProducto: document.getElementById('idProducto').value,
        tipo: document.getElementById('tipo').value,
        cantidad: document.getElementById('cantidad').value,
        responsable: document.getElementById('responsable').value,
        departamento: document.getElementById('departamento').value
    };
    await fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
    alert("Movimiento registrado.");
    cargarInventario();
});
