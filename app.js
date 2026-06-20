
// Paso 3: Inicializar la conexión con Supabase
const SUPABASE_URL = "https://vidrtshlxcjbmkrrmerg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_y_cl3Oy3f6x_wEqAgQbkig_dcKiGM6u";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const STORAGE_KEY = 'asistencias_colegial_data';
const defaultData = {
    usuarios: [
        { id: 1, rol: 'admin', nombre: 'Administrador', email: 'admin@colegio.com', password: 'admin123' },
        { id: 2, rol: 'docente', nombre: 'Docente Base', email: 'docente@colegio.com', password: 'docente123' },
        { id: 3, rol: 'padre', nombre: 'Padre Base', email: 'padre@colegio.com', password: 'padre123' }
    ],
    estudiantes: [
        { id: 1, codigo: 'alumno1', nombre: 'Alumno Uno', fecha_nacimiento: '2011-06-15', genero: 'Masculino', password: 'alumno123', aulaId: null }
    ],
    aulas: [
        { id: 1, nombre: 'Aula 1', grado: '5º', turno: 'Mañana' }
    ],
    asistencia: [],
    asignacionesDocente: [],
    asignacionesPadre: []
};

let state = {
    data: null,
    rolActual: null,
    loginRole: null,
    userActual: null,
    showLoginRoles: false,
    expandedForms: {}
};

const statusBox = document.getElementById('statusBox');
const appContent = document.getElementById('appContent');
const btnExport = document.getElementById('btnExport');
const fileImportInput = document.getElementById('fileImportInput');

async function loadData() {
    try {
        // 1. Primero carga lo que tengas en localStorage como ya hacías
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            state.data = JSON.parse(stored);
            state.data.usuarios = Array.isArray(state.data.usuarios) ? state.data.usuarios : defaultData.usuarios;
            state.data.estudiantes = Array.isArray(state.data.estudiantes) ? state.data.estudiantes : defaultData.estudiantes;
            state.data.aulas = Array.isArray(state.data.aulas) ? state.data.aulas : [];
            state.data.asistencia = Array.isArray(state.data.asistencia) ? state.data.asistencia : [];
            state.data.asignacionesDocente = Array.isArray(state.data.asignacionesDocente) ? state.data.asignacionesDocente : [];
            state.data.asignacionesPadre = Array.isArray(state.data.asignacionesPadre) ? state.data.asignacionesPadre : [];
        } else {
            state.data = JSON.parse(JSON.stringify(defaultData));
        }

        // 2. ¡Aquí viene la magia! Traemos los alumnos reales desde Supabase
        const { data: alumnosNube, error } = await supabase
            .from('alumnos')
            .select('*');

        if (error) throw error;

        // 3. Si hay alumnos en la nube, actualizamos la lista en tu aplicación
        if (alumnosNube && alumnosNube.length > 0) {
            state.data.estudiantes = alumnosNube.map(alumno => ({
                id: alumno.id,
                codigo: 'ALU-' + alumno.id, 
                nombre: alumno.nombre,
                apellido: alumno.apellido, // Mantenemos tu estructura separada
                fecha_nacimiento: '2011-06-15', 
                genero: 'Masculino'
            }));
        }

        updateStatus('Datos sincronizados con la nube correctamente.');

    } catch (error) {
        console.error('Error al cargar datos:', error);
        // Si el internet falla, usa tu respaldo por defecto para que no se rompa la app
        if (!state.data) {
            state.data = JSON.parse(JSON.stringify(defaultData));
        }
        updateStatus('Cargado en modo local (sin conexión).');
    }
}

async function saveData(message = 'Datos guardados automáticamente.') {
    // 1. Guardar localmente en el navegador (para mantener tu respaldo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));

    try {
        // 2. Sincronizar los alumnos con la base de datos en Supabase
        // Primero borramos el contenido viejo e insertamos la lista actual para que estén idénticos
        // Nota: Esta es la vía rápida de sincronización masiva para desarrollo
        if (state.data && state.data.estudiantes) {
            
            // Preparamos el formato exacto que espera tu tabla 'alumnos' en Supabase
            const alumnosParaSubir = state.data.estudiantes.map(est => {
                // Si tu interfaz une el nombre completo, intentamos separar nombre y apellido
                const partes = est.nombre.split(' ');
                return {
                    nombre: partes[0] || 'Sin Nombre',
                    apellido: partes.slice(1).join(' ') || 'Sin Apellido'
                };
            });

            // Limpiamos la tabla en la nube e insertamos el estado fresco
            // Para hacerlo directo, aprovecharemos el RLS que configuraste.
            // Si prefieres guardar uno por uno directo desde el formulario de enviar, me avisas.
            const { error: deleteError } = await supabase.from('alumnos').delete().neq('id', 0);
            if (!deleteError) {
                await supabase.from('alumnos').insert(alumnosParaSubir);
            }
        }

        updateStatus(message + ' (Sincronizado en la nube)');
    } catch (error) {
        console.error('Error al sincronizar con la nube:', error);
        updateStatus(message + ' (Solo guardado local, revisa tu conexión)');
    }
}

// ... Aquí termina el catch de loadData() en la línea 83

async function saveData(message = 'Datos guardados automáticamente.') {
    // 1. Guardar localmente en el navegador (para mantener tu respaldo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));

    try {
        // 2. Sincronizar los alumnos con la base de datos en Supabase
        if (state.data && state.data.estudiantes) {
            
            // Preparamos el formato exacto que espera tu tabla 'alumnos' en Supabase
            const alumnosParaSubir = state.data.estudiantes.map(est => {
                const partes = est.nombre.split(' ');
                return {
                    nombre: partes[0] || 'Sin Nombre',
                    apellido: partes.slice(1).join(' ') || 'Sin Apellido'
                };
            });

            // Limpiamos la tabla en la nube e insertamos el estado fresco
            const { error: deleteError } = await supabase.from('alumnos').delete().neq('id', 0);
            if (!deleteError) {
                await supabase.from('alumnos').insert(alumnosParaSubir);
            }
        }

        updateStatus(message + ' (Sincronizado en la nube)');
    } catch (error) {
        console.error('Error al sincronizar con la nube:', error);
        updateStatus(message + ' (Solo guardado local, revisa tu conexión)');
    }
}

function updateStatus(text) {
    statusBox.textContent = text;
}

// ... El resto de tus funciones abajo (createSection, render, etc.)

function updateStatus(text) {
    statusBox.textContent = text;
}

function createSection(html) {
    const div = document.createElement('div');
    div.className = 'section card';
    div.innerHTML = html;
    return div;
}

function render() {
    appContent.innerHTML = '';
    if (!state.rolActual) {
        appContent.appendChild(renderLoginPanel());
        return;
    }
    appContent.appendChild(renderHeader());
    if (state.rolActual === 'admin') {
        renderAdmin();
    } else if (state.rolActual === 'docente') {
        renderDocente();
    } else if (state.rolActual === 'padre') {
        renderPadre();
    } else if (state.rolActual === 'alumno') {
        renderAlumno();
    }
}

function renderHeader() {
    const title = {
        admin: 'Panel de Administración',
        docente: 'Panel de Docente',
        padre: 'Panel de Padre',
        alumno: 'Panel de Alumno'
    }[state.rolActual] || 'Panel';
    return createSection(`
        <div class="top-panel">
            <div>
                <h2>${title}</h2>
                <p>Usuario: <strong>${state.userActual?.nombre || 'Anónimo'}</strong></p>
            </div>
            <button class="small-button" id="btnLogout">Cerrar sesión</button>
        </div>
    `);
}

function renderLoginPanel() {
    if (!state.showLoginRoles) {
        const html = `
            <div style="text-align: center; padding: 40px 20px;">
                <h2>Asistencias colegial</h2>
                <p style="margin-bottom: 30px; color: #d8e8ff;">Plataforma de control de asistencia escolar</p>
                <button class="small-button big" id="btnComenzar">Comenzar</button>
            </div>
        `;
        const section = createSection(html);
        section.querySelector('#btnComenzar').addEventListener('click', () => {
            state.showLoginRoles = true;
            render();
        });
        return section;
    }

    const roles = ['admin', 'docente', 'padre', 'alumno'];
    const labels = { admin: 'Administrador', docente: 'Docente', padre: 'Padre', alumno: 'Alumno' };
    const fields = state.loginRole === 'alumno'
        ? `
            <label>Código</label>
            <input name="codigo" placeholder="Ej: alumno1" required />
            <label>Contraseña</label>
            <input name="password" type="password" placeholder="Tu contraseña" required />
        `
        : `
            <label>Correo</label>
            <input name="email" type="email" placeholder="usuario@colegio.com" required />
            <label>Contraseña</label>
            <input name="password" type="password" placeholder="Tu contraseña" required />
        `;

    const roleButtonsHtml = roles.map(role => `
        <button class="small-button" data-role="${role}">${labels[role]}</button>
    `).join('');

    const html = `
        <h2>Selecciona tu rol</h2>
        <p style="margin-bottom: 20px; color: #d8e8ff;">Ingresa con tus credenciales para acceder a la plataforma escolar.</p>
        <div class="role-buttons">${roleButtonsHtml}</div>
        ${state.loginRole ? `
            <form id="loginForm">
                ${fields}
                <div class="actions"><button class="small-button">Ingresar</button></div>
            </form>
        ` : ''}
    `;
    const section = createSection(html);
    section.querySelectorAll('[data-role]').forEach(button => {
        button.addEventListener('click', () => {
            state.loginRole = button.dataset.role;
            render();
        });
    });
    if (state.loginRole) {
        section.querySelector('#loginForm').addEventListener('submit', evt => {
            evt.preventDefault();
            handleLogin(evt.target);
        });
    }
    return section;
}

function handleLogin(form) {
    const role = state.loginRole;
    if (role === 'alumno') {
        const codigo = form.codigo.value.trim();
        const password = form.password.value.trim();
        const alumno = state.data.estudiantes.find(st => st.codigo === codigo && st.password === password);
        if (!alumno) {
            updateStatus('Código o contraseña incorrectos.');
            return;
        }
        state.rolActual = 'alumno';
        state.userActual = alumno;
    } else {
        const email = form.email.value.trim().toLowerCase();
        const password = form.password.value.trim();
        const usuario = state.data.usuarios.find(u => u.rol === role && u.email.toLowerCase() === email && u.password === password);
        if (!usuario) {
            updateStatus('Correo o contraseña incorrectos.');
            return;
        }
        state.rolActual = role;
        state.userActual = usuario;
    }
    updateStatus(`Bienvenido ${state.userActual.nombre}.`);
    render();
}

function logout() {
    state.rolActual = null;
    state.userActual = null;
    state.loginRole = null;
    state.showLoginRoles = false;
    render();
    updateStatus('Sesión cerrada. Selecciona un rol para ingresar.');
}

function recordAttendance(estudianteId, presente) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = state.data.asistencia.find(att => att.estudianteId === estudianteId && att.fecha === today);
    if (existing) {
        existing.presente = presente;
    } else {
        state.data.asistencia.push({ id: Date.now(), estudianteId, fecha: today, presente });
    }
    saveData('Asistencia registrada correctamente.');
    refreshAttendanceList();
}


function renderAdmin() {
    const adminSection = createSection(`
        <div class="actions" style="flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
            <button class="small-button" id="btnNewStudent">Agregar Estudiante</button>
            <button class="small-button" id="btnNewAula">Agregar Aula</button>
            <button class="small-button" id="btnNewDocente">Agregar Docente</button>
            <button class="small-button" id="btnNewPadre">Agregar Padre</button>
        </div>
        <div id="adminSections"></div>
    `);
    appContent.appendChild(adminSection);
    document.getElementById('btnNewStudent').addEventListener('click', () => showStudentForm());
    document.getElementById('btnNewAula').addEventListener('click', () => showAulaForm());
    document.getElementById('btnNewDocente').addEventListener('click', () => showUserForm('docente'));
    document.getElementById('btnNewPadre').addEventListener('click', () => showUserForm('padre'));
    renderAdminLists();
}

function renderAdminLists() {
    const container = document.getElementById('adminSections');
    container.innerHTML = '';
    container.appendChild(createSection(`<h3>Estudiantes</h3><div id="studentList"></div>`));
    container.appendChild(createSection(`<h3>Aulas</h3><div id="aulaList"></div>`));
    container.appendChild(createSection(`<h3>Docentes</h3><div id="docenteList"></div>`));
    container.appendChild(createSection(`<h3>Padres</h3><div id="padreList"></div>`));
    container.appendChild(createSection(`<h3>Asignaciones</h3><div id="assignmentList"></div>`));
    refreshStudentList();
    refreshAulaList();
    refreshUserList('docente');
    refreshUserList('padre');
    refreshAssignmentList();
}

function refreshStudentList() {
    const container = document.getElementById('studentList');
    if (!container) return;
    if (state.data.estudiantes.length === 0) {
        container.innerHTML = '<p>No hay estudiantes. Usa "Agregar Estudiante" para crear uno.</p>';
        return;
    }
    const rows = state.data.estudiantes.map(est => {
        const aula = state.data.aulas.find(a => a.id === est.aulaId)?.nombre || 'Sin aula';
        const isExpanded = state.expandedForms[`student-${est.id}`];
        return `
        <div class="collapsible ${isExpanded ? 'active' : ''}" data-toggle="student-${est.id}">
            <div>
                <strong>${est.codigo}</strong> - ${est.nombre}
                <span style="color: #aaa; font-size: 0.9em;">( ${aula} )</span>
            </div>
            <span class="collapse-icon ${isExpanded ? 'open' : ''}">▼</span>
        </div>
        ${isExpanded ? `
            <div class="collapsible-content open">
                <div class="row-data">
                    <p><strong>Nombre:</strong> ${est.nombre}</p>
                    <p><strong>Código:</strong> ${est.codigo}</p>
                    <p><strong>Aula:</strong> ${aula}</p>
                    <p><strong>Fecha Nacimiento:</strong> ${est.fecha_nacimiento}</p>
                    <p><strong>Género:</strong> ${est.genero}</p>
                    <div class="actions">
                        <button class="small-button" data-edit-id="${est.id}">Editar</button>
                        <button class="small-button" data-delete-id="${est.id}" style="background:#e74c3c;">Eliminar</button>
                    </div>
                </div>
            </div>
        ` : ''}
        `;
    }).join('');
    container.innerHTML = `<div>${rows}</div>`;
    
    container.querySelectorAll('.collapsible').forEach(collapsible => {
        collapsible.addEventListener('click', () => {
            const key = collapsible.dataset.toggle;
            state.expandedForms[key] = !state.expandedForms[key];
            render();
        });
    });
    
    container.querySelectorAll('[data-edit-id]').forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();
            showStudentForm(Number(button.dataset.editId));
        });
    });
    container.querySelectorAll('[data-delete-id]').forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();
            if (confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
                deleteStudent(Number(button.dataset.deleteId));
            }
        });
    });
}

function refreshAulaList() {
    const container = document.getElementById('aulaList');
    if (!container) return;
    if (state.data.aulas.length === 0) {
        container.innerHTML = '<p>No hay aulas. Agrega una para comenzar.</p>';
        return;
    }
    const rows = state.data.aulas.map(aula => {
        const isExpanded = state.expandedForms[`aula-${aula.id}`];
        return `
        <div class="collapsible ${isExpanded ? 'active' : ''}" data-toggle="aula-${aula.id}">
            <div>
                <strong>${aula.nombre}</strong>
                <span style="color: #aaa; font-size: 0.9em;">( ${aula.grado} - ${aula.turno} )</span>
            </div>
            <span class="collapse-icon ${isExpanded ? 'open' : ''}">▼</span>
        </div>
        ${isExpanded ? `
            <div class="collapsible-content open">
                <div class="row-data">
                    <p><strong>Aula:</strong> ${aula.nombre}</p>
                    <p><strong>Grado:</strong> ${aula.grado}</p>
                    <p><strong>Turno:</strong> ${aula.turno}</p>
                    <div class="actions">
                        <button class="small-button" data-edit-id="${aula.id}">Editar</button>
                        <button class="small-button" data-delete-id="${aula.id}" style="background:#e74c3c;">Eliminar</button>
                    </div>
                </div>
            </div>
        ` : ''}
        `;
    }).join('');
    container.innerHTML = `<div>${rows}</div>`;
    
    container.querySelectorAll('.collapsible').forEach(collapsible => {
        collapsible.addEventListener('click', () => {
            const key = collapsible.dataset.toggle;
            state.expandedForms[key] = !state.expandedForms[key];
            render();
        });
    });
    
    container.querySelectorAll('[data-edit-id]').forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();
            showAulaForm(Number(button.dataset.editId));
        });
    });
    container.querySelectorAll('[data-delete-id]').forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();
            if (confirm('¿Estás seguro de que deseas eliminar esta aula?')) {
                deleteAula(Number(button.dataset.deleteId));
            }
        });
    });
}

function refreshUserList(role) {
    const container = document.getElementById(`${role}List`);
    if (!container) return;
    const users = state.data.usuarios.filter(u => u.rol === role);
    if (users.length === 0) {
        container.innerHTML = `<p>No hay ${role}s. Agrega uno para empezar.</p>`;
        return;
    }
    const rows = users.map(user => {
        const isExpanded = state.expandedForms[`user-${user.id}`];
        return `
        <div class="collapsible ${isExpanded ? 'active' : ''}" data-toggle="user-${user.id}">
            <div>
                <strong>${user.nombre}</strong>
                <span style="color: #aaa; font-size: 0.9em;">( ${user.email} )</span>
            </div>
            <span class="collapse-icon ${isExpanded ? 'open' : ''}">▼</span>
        </div>
        ${isExpanded ? `
            <div class="collapsible-content open">
                <div class="row-data">
                    <p><strong>Nombre:</strong> ${user.nombre}</p>
                    <p><strong>Correo:</strong> ${user.email}</p>
                    <div class="actions">
                        <button class="small-button" data-edit-id="${user.id}" data-role="${role}">Editar</button>
                        <button class="small-button" data-delete-id="${user.id}" data-role="${role}" style="background:#e74c3c;">Eliminar</button>
                    </div>
                </div>
            </div>
        ` : ''}
        `;
    }).join('');
    container.innerHTML = `<div>${rows}</div>`;
    
    container.querySelectorAll('.collapsible').forEach(collapsible => {
        collapsible.addEventListener('click', () => {
            const key = collapsible.dataset.toggle;
            state.expandedForms[key] = !state.expandedForms[key];
            render();
        });
    });
    
    container.querySelectorAll('[data-edit-id]').forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();
            showUserForm(role, Number(button.dataset.editId));
        });
    });
    container.querySelectorAll('[data-delete-id]').forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();
            if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                deleteUser(Number(button.dataset.deleteId));
            }
        });
    });
}

function refreshAssignmentList() {
    const container = document.getElementById('assignmentList');
    if (!container) return;
    const docenteOptions = state.data.usuarios.filter(u => u.rol === 'docente').map(doc => `<option value="${doc.id}">${doc.nombre}</option>`).join('');
    const aulaOptions = state.data.aulas.map(a => `<option value="${a.id}">${a.nombre} (${a.grado})</option>`).join('');
    const padreOptions = state.data.usuarios.filter(u => u.rol === 'padre').map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
    const studentOptions = state.data.estudiantes.map(st => `<option value="${st.id}">${st.nombre} (${st.codigo})</option>`).join('');
    const rowsDoc = state.data.asignacionesDocente.map(item => {
        const docente = state.data.usuarios.find(u => u.id === item.docenteId);
        const aula = state.data.aulas.find(a => a.id === item.aulaId);
        return `<tr><td>${docente?.nombre || 'N/A'}</td><td>${aula?.nombre || 'N/A'}</td><td><button class="small-button" data-delete-doc="${item.id}" style="background:#e74c3c;">Eliminar</button></td></tr>`;
    }).join('');
    const rowsPadre = state.data.asignacionesPadre.map(item => {
        const padre = state.data.usuarios.find(u => u.id === item.padreId);
        const estudiante = state.data.estudiantes.find(st => st.id === item.estudianteId);
        return `<tr><td>${padre?.nombre || 'N/A'}</td><td>${estudiante?.nombre || 'N/A'}</td><td><button class="small-button" data-delete-padre="${item.id}" style="background:#e74c3c;">Eliminar</button></td></tr>`;
    }).join('');
    container.innerHTML = `
        <div class="section card">
            <h4>Asignar docente a aula</h4>
            <form id="assignDocenteForm">
                <label>Docente</label><select name="docenteId" required><option value="">Seleccionar</option>${docenteOptions}</select>
                <label>Aula</label><select name="aulaId" required><option value="">Seleccionar</option>${aulaOptions}</select>
                <div class="actions"><button class="small-button">Asignar</button></div>
            </form>
            <table><thead><tr><th>Docente</th><th>Aula</th><th>Acción</th></tr></thead><tbody>${rowsDoc || '<tr><td colspan="3">No hay asignaciones de docentes.</td></tr>'}</tbody></table>
        </div>
        <div class="section card">
            <h4>Asignar padre a estudiante</h4>
            <form id="assignPadreForm">
                <label>Padre</label><select name="padreId" required><option value="">Seleccionar</option>${padreOptions}</select>
                <label>Estudiante</label><select name="estudianteId" required><option value="">Seleccionar</option>${studentOptions}</select>
                <div class="actions"><button class="small-button">Asignar</button></div>
            </form>
            <table><thead><tr><th>Padre</th><th>Estudiante</th><th>Acción</th></tr></thead><tbody>${rowsPadre || '<tr><td colspan="3">No hay asignaciones de padres.</td></tr>'}</tbody></table>
        </div>`;
    document.getElementById('assignDocenteForm').addEventListener('submit', evt => {
        evt.preventDefault();
        const docenteId = Number(evt.target.docenteId.value);
        const aulaId = Number(evt.target.aulaId.value);
        if (!docenteId || !aulaId) return;
        state.data.asignacionesDocente.push({ id: Date.now(), docenteId, aulaId });
        saveData('Docente asignado a aula.');
        refreshAssignmentList();
    });
    document.getElementById('assignPadreForm').addEventListener('submit', evt => {
        evt.preventDefault();
        const padreId = Number(evt.target.padreId.value);
        const estudianteId = Number(evt.target.estudianteId.value);
        if (!padreId || !estudianteId) return;
        state.data.asignacionesPadre.push({ id: Date.now(), padreId, estudianteId });
        saveData('Padre asignado al estudiante.');
        refreshAssignmentList();
    });
    container.querySelectorAll('[data-delete-doc]').forEach(button => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.deleteDoc);
            state.data.asignacionesDocente = state.data.asignacionesDocente.filter(item => item.id !== id);
            saveData('Asignación de docente eliminada.');
            refreshAssignmentList();
        });
    });
    container.querySelectorAll('[data-delete-padre]').forEach(button => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.deletePadre);
            state.data.asignacionesPadre = state.data.asignacionesPadre.filter(item => item.id !== id);
            saveData('Asignación de padre eliminada.');
            refreshAssignmentList();
        });
    });
}

function showStudentForm(id = null) {
    const editar = id !== null ? state.data.estudiantes.find(st => st.id === id) : null;
    const aulaOptions = state.data.aulas.map(a => `<option value="${a.id}" ${editar?.aulaId === a.id ? 'selected' : ''}>${a.nombre} (${a.grado})</option>`).join('');
    
    const formId = id ? `student-form-${id}` : 'student-form-new';
    if (editar) {
        state.expandedForms[`student-${id}`] = false;
    }
    
    const section = createSection(`
        <h3>${editar ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h3>
        <form id="${formId}">
            <label>Código</label><input name="codigo" required value="${editar ? editar.codigo : ''}" />
            <label>Nombre completo</label><input name="nombre" required value="${editar ? editar.nombre : ''}" />
            <label>Contraseña</label><input name="password" type="text" required value="${editar ? editar.password : 'alumno123'}" />
            <label>Fecha de nacimiento</label><input type="date" name="fecha_nacimiento" required value="${editar ? editar.fecha_nacimiento : ''}" />
            <label>Género</label>
            <select name="genero" required>
                <option value="">Seleccionar</option>
                <option value="Masculino" ${editar?.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
                <option value="Femenino" ${editar?.genero === 'Femenino' ? 'selected' : ''}>Femenino</option>
                <option value="Otro" ${editar?.genero === 'Otro' ? 'selected' : ''}>Otro</option>
            </select>
            <label>Aula</label>
            <select name="aulaId">
                <option value="">Sin aula</option>
                ${aulaOptions}
            </select>
            <div class="actions" style="margin-top:16px; gap:10px; flex-wrap: wrap;">
                <button class="small-button" type="submit">Guardar</button>
                <button class="small-button" type="button" class="btnCancel" style="background:#95a5a6;">Cancelar</button>
            </div>
        </form>
    `);
    
    appContent.insertBefore(section, appContent.children[1]);
    
    section.querySelector(`#${formId}`).addEventListener('submit', evt => {
        evt.preventDefault();
        const form = evt.target;
        const data = {
            codigo: form.codigo.value.trim(),
            nombre: form.nombre.value.trim(),
            password: form.password.value.trim(),
            fecha_nacimiento: form.fecha_nacimiento.value,
            genero: form.genero.value,
            aulaId: form.aulaId.value ? Number(form.aulaId.value) : null
        };
        if (!data.codigo || !data.nombre || !data.password || !data.fecha_nacimiento || !data.genero) {
            updateStatus('Completa todos los campos antes de guardar.');
            return;
        }
        if (editar) {
            editar.codigo = data.codigo;
            editar.nombre = data.nombre;
            editar.password = data.password;
            editar.fecha_nacimiento = data.fecha_nacimiento;
            editar.genero = data.genero;
            editar.aulaId = data.aulaId;
            updateStatus('Estudiante actualizado correctamente.');
        } else {
            state.data.estudiantes.push({ id: Date.now(), ...data });
            updateStatus('Estudiante creado correctamente.');
        }
        saveData();
        section.remove();
        refreshStudentList();
    });
    
    section.querySelector('.btnCancel').addEventListener('click', () => {
        section.remove();
    });
}

function showAulaForm(id = null) {
    const editar = id !== null ? state.data.aulas.find(a => a.id === id) : null;
    const section = createSection(`
        <h3>${editar ? 'Editar Aula' : 'Nueva Aula'}</h3>
        <form id="aulaForm">
            <label>Nombre del aula</label><input name="nombre" required value="${editar ? editar.nombre : ''}" />
            <label>Grado</label><input name="grado" required value="${editar ? editar.grado : ''}" />
            <label>Turno</label><select name="turno" required>
                <option value="">Seleccionar</option>
                <option value="Mañana" ${editar?.turno === 'Mañana' ? 'selected' : ''}>Mañana</option>
                <option value="Tarde" ${editar?.turno === 'Tarde' ? 'selected' : ''}>Tarde</option>
                <option value="Noche" ${editar?.turno === 'Noche' ? 'selected' : ''}>Noche</option>
            </select>
            <div class="actions" style="margin-top:16px; gap:10px; flex-wrap: wrap;">
                <button class="small-button" type="submit">Guardar</button>
                <button class="small-button" type="button" id="cancelAula" style="background:#95a5a6;">Cancelar</button>
            </div>
        </form>
    `);
    appContent.appendChild(section);
    document.getElementById('aulaForm').addEventListener('submit', evt => {
        evt.preventDefault();
        const form = evt.target;
        const data = {
            nombre: form.nombre.value.trim(),
            grado: form.grado.value.trim(),
            turno: form.turno.value
        };
        if (!data.nombre || !data.grado || !data.turno) {
            updateStatus('Completa todos los campos de la aula.');
            return;
        }
        if (editar) {
            editar.nombre = data.nombre;
            editar.grado = data.grado;
            editar.turno = data.turno;
        } else {
            state.data.aulas.push({ id: Date.now(), ...data });
        }
        saveData('Aula guardada correctamente.');
        render();
    });
    document.getElementById('cancelAula').addEventListener('click', () => render());
}

function showUserForm(role, id = null) {
    const editar = id !== null ? state.data.usuarios.find(u => u.id === id && u.rol === role) : null;
    const section = createSection(`
        <h3>${editar ? `Editar ${role}` : `Nuevo ${role}`}</h3>
        <form id="userForm">
            <label>Nombre</label><input name="nombre" required value="${editar ? editar.nombre : ''}" />
            <label>Correo</label><input name="email" type="email" required value="${editar ? editar.email : ''}" />
            <label>Contraseña</label><input name="password" type="text" required value="${editar ? editar.password : '123456'}" />
            <div class="actions" style="margin-top:16px; gap:10px; flex-wrap: wrap;">
                <button class="small-button" type="submit">Guardar</button>
                <button class="small-button" type="button" id="cancelUser" style="background:#95a5a6;">Cancelar</button>
            </div>
        </form>
    `);
    appContent.appendChild(section);
    document.getElementById('userForm').addEventListener('submit', evt => {
        evt.preventDefault();
        const form = evt.target;
        const data = {
            nombre: form.nombre.value.trim(),
            email: form.email.value.trim().toLowerCase(),
            password: form.password.value.trim()
        };
        if (!data.nombre || !data.email || !data.password) {
            updateStatus('Completa todos los campos del usuario.');
            return;
        }
        if (editar) {
            editar.nombre = data.nombre;
            editar.email = data.email;
            editar.password = data.password;
        } else {
            state.data.usuarios.push({ id: Date.now(), rol: role, ...data });
        }
        saveData(`${role.charAt(0).toUpperCase() + role.slice(1)} guardado correctamente.`);
        render();
    });
    document.getElementById('cancelUser').addEventListener('click', () => render());
}

function deleteAula(id) {
    state.data.aulas = state.data.aulas.filter(a => a.id !== id);
    state.data.estudiantes.forEach(st => { if (st.aulaId === id) st.aulaId = null; });
    state.data.asignacionesDocente = state.data.asignacionesDocente.filter(item => item.aulaId !== id);
    saveData('Aula eliminada.');
    render();
}

function deleteUser(id) {
    state.data.usuarios = state.data.usuarios.filter(u => u.id !== id);
    state.data.asignacionesDocente = state.data.asignacionesDocente.filter(item => item.docenteId !== id);
    state.data.asignacionesPadre = state.data.asignacionesPadre.filter(item => item.padreId !== id);
    saveData('Usuario eliminado.');
    render();
}

function deleteStudent(id) {
    state.data.estudiantes = state.data.estudiantes.filter(st => st.id !== id);
    state.data.asistencia = state.data.asistencia.filter(att => att.estudianteId !== id);
    state.data.asignacionesPadre = state.data.asignacionesPadre.filter(item => item.estudianteId !== id);
    saveData('Estudiante eliminado. Los cambios están guardados.');
    render();
}

function renderDocente() {
    const aulaIds = state.data.asignacionesDocente
        .filter(item => item.docenteId === state.userActual.id)
        .map(item => item.aulaId);
    const aulas = state.data.aulas.filter(a => aulaIds.includes(a.id));
    appContent.appendChild(createSection(`
        <h3>Mis aulas asignadas</h3>
        <p>${aulas.length ? aulas.map(a => `${a.nombre} (${a.grado})`).join(', ') : 'No tienes aulas asignadas.'}</p>
    `));
    appContent.appendChild(createSection(`
        <h3>Tomar asistencia</h3>
        <div id="attendanceList"></div>
    `));
    refreshAttendanceList();
}

function refreshAttendanceList() {
    const container = document.getElementById('attendanceList');
    if (!container) return;
    const aulaIds = state.data.asignacionesDocente
        .filter(item => item.docenteId === state.userActual?.id)
        .map(item => item.aulaId);
    const estudiantes = state.data.estudiantes.filter(st => aulaIds.includes(st.aulaId));
    if (estudiantes.length === 0) {
        container.innerHTML = '<p>No hay estudiantes en tus aulas asignadas.</p>';
        return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const rows = estudiantes.map(est => {
        const registro = state.data.asistencia.find(att => att.estudianteId === est.id && att.fecha === today);
        return `
            <tr>
                <td>${est.codigo}</td>
                <td>${est.nombre}</td>
                <td>${state.data.aulas.find(a => a.id === est.aulaId)?.nombre || 'Sin aula'}</td>
                <td><button class="small-button" data-att="present" data-id="${est.id}" ${registro?.presente ? 'disabled' : ''}>Presente</button></td>
                <td><button class="small-button" data-att="absent" data-id="${est.id}" ${registro?.presente === false ? 'disabled' : ''}>Ausente</button></td>
                <td>${registro ? `<span class="badge ${registro.presente ? 'success' : 'warn'}">${registro.presente ? 'Presente' : 'Ausente'}</span>` : '<span class="badge">Sin registrar</span>'}</td>
            </tr>
        `;
    }).join('');
    container.innerHTML = `
        <table>
            <thead><tr><th>Código</th><th>Nombre</th><th>Aula</th><th>Presente</th><th>Ausente</th><th>Estado</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
    container.querySelectorAll('[data-att]').forEach(button => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.id);
            const presente = button.dataset.att === 'present';
            recordAttendance(id, presente);
        });
    });
}

function renderPadre() {
    const assignments = state.data.asignacionesPadre.filter(item => item.padreId === state.userActual.id);
    const children = assignments.map(item => state.data.estudiantes.find(st => st.id === item.estudianteId)).filter(Boolean);
    appContent.appendChild(createSection(`
        <h3>Mis hijos</h3>
        <p>${children.length ? 'Aquí están los estudiantes asignados a tu cuenta:' : 'No tienes hijos asignados.'}</p>
    `));
    if (!children.length) return;
    children.forEach(child => {
        const registros = state.data.asistencia.filter(att => att.estudianteId === child.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
        const rows = registros.map(att => `<tr><td>${att.fecha}</td><td>${att.presente ? 'Presente' : 'Ausente'}</td></tr>`).join('');
        appContent.appendChild(createSection(`
            <h4>${child.nombre} (${child.codigo})</h4>
            <table><thead><tr><th>Fecha</th><th>Estado</th></tr></thead><tbody>${rows || '<tr><td colspan="2">Sin registros aún</td></tr>'}</tbody></table>
        `));
    });
}

function renderAlumno() {
    const alumno = state.userActual;
    const registros = state.data.asistencia.filter(att => att.estudianteId === alumno.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const rows = registros.map(att => `<tr><td>${att.fecha}</td><td>${att.presente ? 'Presente' : 'Ausente'}</td></tr>`).join('');
    appContent.appendChild(createSection(`
        <h3>Hola, ${alumno.nombre}</h3>
        <p>Código: ${alumno.codigo}</p>
        <p>Aula: ${state.data.aulas.find(a => a.id === alumno.aulaId)?.nombre || 'Sin aula asignada'}</p>
    `));
    appContent.appendChild(createSection(`
        <h3>Historial de asistencia</h3>
        <table><thead><tr><th>Fecha</th><th>Estado</th></tr></thead><tbody>${rows || '<tr><td colspan="2">No hay registros aún</td></tr>'}</tbody></table>
    `));
}

function userButtonListeners() {
    appContent.addEventListener('click', evt => {
        if (evt.target.id === 'btnLogout') {
            logout();
        }
    });
}

btnExport.addEventListener('click', () => {
    const dataStr = JSON.stringify(state.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'asistencias_colegial.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    updateStatus('Archivo JSON preparado para descarga.');
});

fileImportInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const imported = JSON.parse(reader.result);
            if (!imported || typeof imported !== 'object') throw new Error('Formato inválido');
            state.data = {
                usuarios: Array.isArray(imported.usuarios) ? imported.usuarios : defaultData.usuarios,
                estudiantes: Array.isArray(imported.estudiantes) ? imported.estudiantes : [],
                aulas: Array.isArray(imported.aulas) ? imported.aulas : [],
                asistencia: Array.isArray(imported.asistencia) ? imported.asistencia : [],
                asignacionesDocente: Array.isArray(imported.asignacionesDocente) ? imported.asignacionesDocente : [],
                asignacionesPadre: Array.isArray(imported.asignacionesPadre) ? imported.asignacionesPadre : []
            };
            saveData('Datos importados y guardados localmente.');
            render();
        } catch (error) {
            console.error(error);
            updateStatus('No se pudo importar el archivo. Asegúrate de que sea JSON válido.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
});

// Envoltura asíncrona para que todo cargue en orden estricto
(async () => {
    await loadData(); // Espera a que Supabase traiga los alumnos reales
    render();         // Pinta la aplicación con los datos frescos de la nube
    userButtonListeners(); // Activa los botones de la interfaz
})();
