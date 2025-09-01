function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-window">
        <button type="button" className="close-icon" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;