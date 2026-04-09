document.addEventListener('DOMContentLoaded', function () {
  const blocks = document.querySelectorAll('[data-producto-imagenes]');
  blocks.forEach(initBlock);
});

function initBlock(block) {
  const fileInput = block.querySelector('input[type="file"][name="imagenes_files"]');
  const urlInput = block.querySelector('input[data-imagen-url-input]');
  const addUrlBtn = block.querySelector('button[data-imagen-add-url]');
  const dropzone = block.querySelector('[data-imagen-dropzone]');
  const list = block.querySelector('[data-imagen-list]');

  if (!list) return;

  async function addBase64Image(dataUrl) {
    const normalized = String(dataUrl || '').trim();
    if (!/^data:image\//i.test(normalized)) return;

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '0.5rem';
    row.style.alignItems = 'center';
    row.style.marginTop = '0.5rem';

    const preview = document.createElement('img');
    preview.src = normalized;
    preview.alt = 'Imagen';
    preview.style.width = '56px';
    preview.style.height = '56px';
    preview.style.objectFit = 'cover';
    preview.style.borderRadius = '6px';
    preview.style.border = '1px solid #d1cfff';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'imagenes_base64[]';
    input.value = normalized;

    const text = document.createElement('div');
    text.style.flex = '1';
    text.style.overflow = 'hidden';
    text.style.textOverflow = 'ellipsis';
    text.style.whiteSpace = 'nowrap';
    text.textContent = 'Imagen recortada (cuadrada)';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn-small btn-danger';
    remove.textContent = 'Quitar';
    remove.addEventListener('click', () => row.remove());

    row.appendChild(preview);
    row.appendChild(text);
    row.appendChild(remove);
    row.appendChild(input);

    list.appendChild(row);
  }

  async function cropFromSrc(src) {
    if (!window.openImageCropper) return null;
    try {
      const cropped = await window.openImageCropper(src);
      return cropped;
    } catch (e) {
      return null;
    }
  }

  async function handleImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(file);
    });
    const cropped = await cropFromSrc(dataUrl);
    if (cropped) await addBase64Image(cropped);
  }

  function addUrl(url) {
    const normalized = String(url || '').trim();
    if (!/^https?:\/\//i.test(normalized)) return;

    const existing = Array.from(list.querySelectorAll('input[name="imagenes_urls[]"]')).some(
      (i) => i.value === normalized
    );
    if (existing) return;

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '0.5rem';
    row.style.alignItems = 'center';
    row.style.marginTop = '0.5rem';

    const preview = document.createElement('img');
    preview.src = normalized;
    preview.alt = 'Imagen';
    preview.style.width = '56px';
    preview.style.height = '56px';
    preview.style.objectFit = 'cover';
    preview.style.borderRadius = '6px';
    preview.style.border = '1px solid #d1cfff';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'imagenes_urls[]';
    input.value = normalized;

    const text = document.createElement('div');
    text.style.flex = '1';
    text.style.overflow = 'hidden';
    text.style.textOverflow = 'ellipsis';
    text.style.whiteSpace = 'nowrap';
    text.textContent = normalized;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn-small btn-danger';
    remove.textContent = 'Quitar';
    remove.addEventListener('click', () => row.remove());

    row.appendChild(preview);
    row.appendChild(text);
    row.appendChild(remove);
    row.appendChild(input);

    list.appendChild(row);
  }

  function extractUrlFromDataTransfer(dt) {
    if (!dt) return null;

    // Intentar primero text/uri-list (drag desde navegador)
    const uri = dt.getData('text/uri-list');
    if (uri && /^https?:\/\//i.test(uri.trim())) return uri.trim();

    // Fallback: texto
    const text = dt.getData('text/plain');
    if (text && /^https?:\/\//i.test(text.trim())) return text.trim();

    // Fallback: HTML (buscar src=)
    const html = dt.getData('text/html');
    if (html) {
      const match = html.match(/src=["']([^"']+)["']/i);
      if (match && match[1] && /^https?:\/\//i.test(match[1])) return match[1];
    }

    return null;
  }

  if (addUrlBtn && urlInput) {
    addUrlBtn.addEventListener('click', function () {
      addUrl(urlInput.value);
      urlInput.value = '';
      urlInput.focus();
    });
  }

  if (urlInput) {
    urlInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addUrl(urlInput.value);
        urlInput.value = '';
      }
    });
  }

  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.outline = '2px dashed #6c63ff';
      dropzone.style.outlineOffset = '4px';
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.outline = 'none';
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.outline = 'none';

      // Si soltaron archivos de imagen, recortar y guardar como base64 hidden
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files).filter((f) => /^image\//.test(f.type));
        files.forEach((f) => handleImageFile(f));
        return;
      }

      const url = extractUrlFromDataTransfer(e.dataTransfer);
      if (url) {
        // Intentar recortar también links (si CORS lo permite); si no, guarda el link
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
          const cropped = await cropFromSrc(url);
          if (cropped) await addBase64Image(cropped);
          else addUrl(url);
        };
        img.onerror = () => addUrl(url);
        img.src = url;
      }
    });
  }

  // Subida desde input file -> recortar y guardar como base64 hidden
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const files = Array.from(fileInput.files || []).filter((f) => /^image\//.test(f.type));
      files.forEach((f) => handleImageFile(f));
      // Limpiar input para permitir subir el mismo archivo de nuevo
      fileInput.value = '';
    });
  }

  // Pegar con Ctrl+V (imagen o link)
  if (dropzone) {
    dropzone.tabIndex = 0;
    dropzone.addEventListener('paste', (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      const imgItem = items.find((it) => it.type && it.type.startsWith('image/'));
      if (imgItem) {
        const file = imgItem.getAsFile();
        if (file) handleImageFile(file);
        return;
      }
      const text = e.clipboardData?.getData('text/plain');
      if (text && /^https?:\/\//i.test(text.trim())) {
        addUrl(text.trim());
      }
    });
  }
}

