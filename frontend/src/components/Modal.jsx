function Modal({ isOpen, onClose, title, children, variant = 'neutral' }) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal-window modal-${variant}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="modal-close-icon" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
