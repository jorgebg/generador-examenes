import '@picocss/pico/css/pico.min.css';
import { generatePapel } from './papel';
import { generateMoodle } from './moodle';
import { initKofi } from './kofi';

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

function show(el: HTMLElement, visible: boolean) {
  el.hidden = !visible;
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(file, 'utf-8');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const statusEl = byId<HTMLParagraphElement>('status');
  const form = document.forms[0];
  if (!form) throw new Error('Missing <form> element');

  // Ready instantly, no Pyodide loading
  show(statusEl, false);
  form.hidden = false;

  // Init Ko‑fi floating button (no CDN)
  initKofi();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      show(statusEl, true);
      const data = new FormData(form);
      const script = String(data.get('script'));
      const entrada = byId<HTMLInputElement>('entrada');
      const file = entrada.files?.[0];
      if (!file) throw new Error('Debe seleccionar un archivo .txt');
      const inputContent = await readFileAsText(file);

      let outputFilename = 'output.txt';
      let outputContent = '';
      if (script === 'papel.py') {
        outputContent = generatePapel(inputContent);
        outputFilename = 'output.txt';
      } else if (script === 'moodle.py') {
        outputContent = generateMoodle(inputContent);
        outputFilename = 'salida.xml';
      } else {
        throw new Error('Formato no reconocido');
      }

      const blob = new Blob([outputContent], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err: any) {
      alert('Error al producir el exámen: ' + (err?.message ?? String(err)));
    } finally {
      show(statusEl, false);
    }
  });
});
