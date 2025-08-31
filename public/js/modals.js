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
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Remove modal on either close button click
    document.getElementById('closeModalBtn').onclick =
    document.getElementById('closeModalBtnFooter').onclick = function() {
        document.getElementById('modal').remove();
    };
}