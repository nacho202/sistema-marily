// Requiere Cropper (global) cargado por CDN.
// Expone window.openImageCropper(src) => Promise<string dataURL>

(function () {
  let cropper = null;
  let resolver = null;
  let rejecter = null;

  function $(id) {
    return document.getElementById(id);
  }

  function showError(msg) {
    const el = $('image-cropper-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }

  function clearError() {
    const el = $('image-cropper-error');
    if (!el) return;
    el.textContent = '';
    el.style.display = 'none';
  }

  function openModal() {
    const modal = $('image-cropper-modal');
    if (modal) modal.style.display = 'flex';
  }

  function closeModal() {
    const modal = $('image-cropper-modal');
    if (modal) modal.style.display = 'none';
  }

  function cleanup() {
    clearError();
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    resolver = null;
    rejecter = null;
    const img = $('image-cropper-target');
    if (img) img.src = '';
  }

  function cancel() {
    if (rejecter) rejecter(new Error('cancelled'));
    closeModal();
    cleanup();
  }

  function apply() {
    try {
      if (!cropper) throw new Error('Cropper no inicializado');
      const canvas = cropper.getCroppedCanvas({
        width: 800,
        height: 800,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (resolver) resolver(dataUrl);
      closeModal();
      cleanup();
    } catch (e) {
      showError(e.message || 'Error al recortar');
    }
  }

  function bindOnce() {
    if (bindOnce.done) return;
    bindOnce.done = true;

    const closeBtn = $('image-cropper-close');
    const cancelBtn = $('image-cropper-cancel');
    const applyBtn = $('image-cropper-apply');
    const modal = $('image-cropper-modal');

    if (closeBtn) closeBtn.addEventListener('click', cancel);
    if (cancelBtn) cancelBtn.addEventListener('click', cancel);
    if (applyBtn) applyBtn.addEventListener('click', apply);
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) cancel();
      });
    }
  }

  window.openImageCropper = function openImageCropper(src) {
    bindOnce();
    clearError();

    return new Promise((resolve, reject) => {
      if (!window.Cropper) {
        reject(new Error('No se cargó Cropper.js'));
        return;
      }
      const img = $('image-cropper-target');
      if (!img) {
        reject(new Error('Falta el modal de recorte'));
        return;
      }

      resolver = resolve;
      rejecter = reject;

      img.onload = function () {
        try {
          cropper = new Cropper(img, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1,
            background: false,
          });
          openModal();
        } catch (e) {
          reject(e);
          cleanup();
        }
      };

      img.onerror = function () {
        reject(new Error('No se pudo cargar la imagen para recortar (puede ser CORS si es un link).'));
        cleanup();
      };

      img.src = src;
    });
  };
})();

