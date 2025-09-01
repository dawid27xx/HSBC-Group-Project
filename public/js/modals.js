function showModal(message, type) {
    const existingModal = document.getElementById('modal');
    if (existingModal) existingModal.remove();

    const headerClass = type === "success" ? "bg-success text-white" : "bg-danger text-white";
    const title = type === "success" ? "Success" : "Error";

    const modalHtml = `
      <div class="modal fade show" id="modal" tabindex="-1" aria-modal="true" style="display:block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header ${headerClass}">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" id="closeModalBtn"></button>
            </div>
            <div class="modal-body">${message}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="closeModalBtnFooter">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'modal-backdrop';
  backdrop.style.position = 'fixed';
  backdrop.style.top = '0';
  backdrop.style.left = '0';
  backdrop.style.width = '100vw';
  backdrop.style.height = '100vh';
  backdrop.style.background = 'rgba(0,0,0,0.7)';
  backdrop.style.zIndex = '1040';
  document.body.appendChild(backdrop);

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Remove modal and backdrop on either close button click
  const removeModal = function() {
    document.getElementById('modal').remove();
    backdrop.remove();
  };
  document.getElementById('closeModalBtn').onclick = removeModal;
  document.getElementById('closeModalBtnFooter').onclick = removeModal;
}