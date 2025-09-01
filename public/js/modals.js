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

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'modal-backdrop';
  Object.assign(backdrop.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.7)',
    zIndex: 1040
  });
  document.body.appendChild(backdrop);

  // Insert modal
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Close + refresh
  const removeModal = () => {
    const modal = document.getElementById('modal');
    if (modal) modal.remove();
    backdrop.remove();
    location.reload(); // refresh
  };

  document.querySelector('#modal #closeModalBtn').addEventListener('click', removeModal);
  document.querySelector('#modal #closeModalBtnFooter').addEventListener('click', removeModal);
}
