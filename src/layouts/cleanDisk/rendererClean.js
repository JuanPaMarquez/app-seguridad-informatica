const { exec } = require('child_process');
const fs = require('fs');

// Referencias a los elementos del DOM
const lblStatus = document.getElementById('lblStatus');
const comboDisks = document.getElementById('comboDisks');
const comboPartitions = document.getElementById('comboPartitions');

document.getElementById('listarDiscosButton').addEventListener('click', listarDispositivos);
document.getElementById('listarParticionesButton').addEventListener('click', listarParticiones);
document.getElementById('formatearButton').addEventListener('click', realizarFormateo);
document.getElementById('formatearTodoButton').addEventListener('click', formatearTodasParticiones);

// Listar discos
function listarDispositivos() {
    const scriptContent = 'list disk\nexit\n';
    fs.writeFileSync('list_disk.txt', scriptContent);

    console.log('Contenido de list_disk.txt:', scriptContent); // Debug: Verificar contenido del archivo

    exec('diskpart /s list_disk.txt', (error, stdout, stderr) => {
        if (error || stderr) {
            console.error('Error:', error || stderr); // Debug: Ver errores
            lblStatus.textContent = `Error al listar discos: ${error?.message || stderr}`;
            return;
        }

        const discos = stdout.split('\n').filter(line => line.trim().startsWith('Disco') || line.trim().startsWith('Disk'));
        console.log('Discos encontrados:', discos); // Debug: Verificar discos encontrados

        if (discos.length === 0) {
            lblStatus.textContent = 'No se encontraron discos.';
            return;
        }

        comboDisks.innerHTML = '';
        discos.forEach((disco, index) => {
            const option = document.createElement('option');
            option.value = `Disco ${index}`; // Formato asegurado
            option.textContent = disco.trim();
            comboDisks.appendChild(option);
        });

        lblStatus.textContent = 'Discos listados correctamente.';
        fs.unlinkSync('list_disk.txt'); // Eliminar el archivo después de usarlo
    });
}

// Listar particiones de un disco seleccionado
function listarParticiones() {
    const discoSeleccionado = comboDisks.value;  // Obtener el disco seleccionado del combo
    console.log('Disco seleccionado:', discoSeleccionado); // Debug: Verificar disco seleccionado

    if (!discoSeleccionado) {
        lblStatus.textContent = 'Selecciona un disco antes de listar particiones.';
        return;
    }

    // Extraer el número del disco (asumiendo que el formato es 'Disco 0', 'Disco 1', etc.)
    const numeroDisco = discoSeleccionado.match(/\d+/)?.[0];
    console.log('Número de disco extraído:', numeroDisco); // Debug: Ver número de disco

    if (!numeroDisco) {
        lblStatus.textContent = 'No se pudo determinar el número del disco seleccionado.';
        return;
    }

    // Crear el contenido del archivo script para diskpart
    const scriptContent = `select disk ${numeroDisco}\nlist partition\nexit\n`;
    fs.writeFileSync('select_disk.txt', scriptContent);

    console.log('Contenido de select_disk.txt:', scriptContent); // Debug: Ver contenido del archivo

    // Ejecutar diskpart para listar las particiones del disco seleccionado
    exec('diskpart /s select_disk.txt', (error, stdout, stderr) => {
        if (error || stderr) {
            console.error('Error:', error || stderr); // Debug: Ver errores
            lblStatus.textContent = `Error al listar particiones: ${error?.message || stderr}`;
            return;
        }

        console.log('Salida de diskpart 82:', stdout); // Debug: Ver salida completa de diskpart

        // Filtrar y procesar las líneas que contienen las particiones
        // const particiones = stdout.split('\n').filter(line => line.trim().startsWith('Partición') || line.trim().startsWith('Partition'));
        let particiones = procesarSalidaDiskpart(stdout);
        console.log('Particiones encontradas 86:', particiones); // Debug: Ver particiones encontradas

        if (particiones.length === 0) {
            lblStatus.textContent = 'No se encontraron particiones en el disco seleccionado.';
            return;
        }

        // Limpiar el combo de particiones antes de agregar las nuevas
        comboPartitions.innerHTML = '';

        // Añadir las particiones al combo
        particiones.forEach((particion) => {
            const option = document.createElement('option');
            option.value = particion.numero; // Número de partición
            option.textContent = `${particion.numero} - ${particion.tipo} - ${particion.tamano} - ${particion.desplazamiento}`; // Mostrar la partición con detalles
            comboPartitions.appendChild(option);
        });

        lblStatus.textContent = 'Particiones listadas correctamente.';
        fs.unlinkSync('select_disk.txt'); // Eliminar el archivo después de usarlo
    });
}

function procesarSalidaDiskpart(salida) {
    const lineas = salida.split('\n');
    const particiones = [];
    let procesar = false;

    for (const linea of lineas) {
        if (linea.includes('-------------')) {
            procesar = true;
            continue;
        }
        if (procesar && linea.trim() !== '') {
            const datos = linea.trim().split(/\s+/);
            if (datos.length >= 5) {
                particiones.push({
                    numero: datos[1],
                    tipo: datos[2],
                    tamano: datos[3],
                    desplazamiento: datos[4]
                });
            }
        }
    }
    return particiones;
}




// Formatear partición
function realizarFormateo() {
    const particionSeleccionada = comboPartitions.value;
    if (!particionSeleccionada) {
        lblStatus.textContent = 'Selecciona una partición antes de proceder.';
        return;
    }

    const respuesta = confirm(`¿Estás seguro de que deseas formatear ${particionSeleccionada}?`);
    if (!respuesta) return;

    const numeroParticion = particionSeleccionada.match(/\d+/)?.[0];
    const numeroDisco = comboDisks.value.match(/\d+/)?.[0];

    if (!numeroParticion || !numeroDisco) {
        lblStatus.textContent = 'No se pudo determinar la partición o el disco seleccionados.';
        return;
    }

    const scriptContent = `select disk ${numeroDisco}\nselect partition ${numeroParticion}\nformat fs=ntfs quick override\nexit\n`;
    fs.writeFileSync('format_script.txt', scriptContent);

    console.log('Contenido de format_script.txt:', scriptContent); // Debug: Verificar contenido del archivo

    exec('diskpart /s format_script.txt', (error, stdout, stderr) => {
        if (error || stderr) {
            console.error('Error:', error || stderr); // Debug: Ver errores
            lblStatus.textContent = `Error durante el formateo: ${error?.message || stderr}`;
            return;
        }

        fs.unlinkSync('format_script.txt');
        lblStatus.textContent = 'Formateo exitoso.';
        alert(`La partición ${particionSeleccionada} fue formateada con éxito.`);
    });
}

// Formatear todas las particiones
function formatearTodasParticiones() {
    const discoSeleccionado = comboDisks.value;  // Obtener el disco seleccionado del combo
    console.log('Disco seleccionado:', discoSeleccionado); 
    lblStatus.textContent = 'Formateando todas las particiones...';

    // Crear el script de diskpart para formatear todas las particiones
    const script = `
        select disk ${discoSeleccionado}
        clean
        create partition primary
        format fs=ntfs quick
        assign
    `;

    // Guardar el script en un archivo temporal
    const fs = require('fs');
    const scriptPath = 'format_disk.txt';
    fs.writeFileSync(scriptPath, script);

    // Ejecutar el script de diskpart
    exec(`diskpart /s ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al formatear el disco: ${error.message}`);
            lblStatus.textContent = 'Error al formatear el disco.';
            return;
        }
        if (stderr) {
            console.error(`Error en diskpart: ${stderr}`);
            lblStatus.textContent = 'Error en diskpart.';
            return;
        }

        console.log(`Salida de diskpart: ${stdout}`);
        lblStatus.textContent = 'Disco formateado correctamente.';

        // Eliminar el archivo temporal
        fs.unlinkSync(scriptPath);
    });
}
