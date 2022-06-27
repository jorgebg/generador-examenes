
const PYTHON_GOOGLE_MOCK = `
import sys
from unittest import mock

google_mock = mock.MagicMock()
google_mock.files.upload.return_value.popitem.return_value = ["examen.txt"]
sys.modules['google.colab'] = google_mock
`
const OUTPUT_FILENAMES = {
    'papel.py': 'output.txt',
    'moodle.py': 'salida.xml'
}
const SCRIPTS = {};
const statusEl = document.getElementById('status');
var pyodide = null;

// Cargar los scripts y Pyodide
Promise.all([
    fetch('papel.py').then(res => res.text()),
    fetch('moodle.py').then(res => res.text()),
    loadPyodide(),
]).then(([papel, moodle, _pyodide]) => {
    // Guardar los scripts
    SCRIPTS['papel.py'] = papel;
    SCRIPTS['moodle.py'] = moodle;

    // Habilitar la interfaz
    document.forms[0].hidden = false;
    statusEl.hidden = true;

    // Asignar pyodide
    pyodide = _pyodide
    console.log("Pyodide ready");
});

// Función ejecutada al subir el archivo
function processForm(e) {
    e.preventDefault();
    statusEl.hidden = false;

    // Obtener los valores del formulario
    const formData = new FormData(e.target);
    const scriptName = formData.get('script');
    const entrada = document.getElementById('entrada');
    const outputFilename = OUTPUT_FILENAMES[scriptName];

    // Leer el examen subido
    var inputFile = entrada.files[0];
    var reader = new FileReader();
    reader.readAsText(inputFile);
    reader.onload = evt => {
        try {
            // Escribir el examen de entrada en el sistema de archivos virtual de Pyodide
            var inputContent = evt.target.result;
            pyodide.FS.writeFile("examen.txt", inputContent, { encoding: "utf8" });

            // Ejecutar el script
            pyodide.globals.clear()
            pyodide.runPython(PYTHON_GOOGLE_MOCK)
            var debug = pyodide.runPython(SCRIPTS[scriptName]);
            console.log(debug) // Podemos ver la salida de texto del script en la consola

            // Leer el examen de salida del sistema de archivos virtual de Pyodide
            let outputContent = pyodide.FS.readFile(outputFilename, { encoding: "utf8" });
            var outputLength = outputContent.length;
            var outputEncoded = new Uint8Array(outputLength);
            for (var i = 0; i < outputLength; i++) {
                outputEncoded[i] = outputContent.charCodeAt(i);
            }

            // Disparar la descarga del archivo en el navegador creando un elemento temporal
            var blob = new Blob([outputEncoded], { type: 'application/octet-stream' });
            var elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = outputFilename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }
        catch (err) {
            alert("Error al producir el exámen: " + err.message);
        } finally {
            pyodide.FS.unlink("examen.txt");
        }
    }
    statusEl.hidden = true
    return false;
}

// Generar el examen al enviar el formulario
var form = document.forms[0];
form.addEventListener("submit", processForm);
