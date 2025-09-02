import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { getRandomNewBasketName, createNewBasket } from "../services/services";

// the "create a new basket" container on homepage
function NewBasketCard ({ defaultBasketName, setBaskets, createBasket = createNewBasket }) {
  const domainName = `${window.location.origin}/`;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creationResult, setCreationResult] = useState(null);
  const [fieldError, setFieldError] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const openModal = () => setIsModalOpen(true);

  const closeModal = (e) => {
    e?.preventDefault();
    setIsModalOpen(false);
  };

  const validateName = (name) => {
    if (!name) return 'Please provide a basket name.';
    if (!/^[A-Za-z0-9]{1,100}$/.test(name)) {
      return 'Invalid name. Only letters and digits, max 100 characters.';
    }
    return '';
  };

  const ModalContent = () => {
    if (!creationResult) return null;
    const { status, message, name } = creationResult;

    if (status === 'success') {
      return (
        <>
          <p>{message}</p>
          <div className="actions">
            <button type="button" className="close-btn" onClick={closeModal}>
              Close
            </button>
            <button 
              type="button" 
              className="open-btn" 
              onClick={() => {
                closeModal();
                if (name) navigate(`/${name}`);
              }}
            >
              Open Basket
            </button>
          </div>
        </>
      );
    } else {
      return (
        <>
          <p>{message}</p>
          <div className="actions">
            <button type="button" className="close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </>
      )
    }
  };

  // const refreshCard = async () => {
  //   const newBasketName = await getRandomNewBasketName();
  //   if (inputRef.current) inputRef.current.value = newBasketName;
  // };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const basketName = inputRef.current?.value.trim();
    const error = validateName(basketName);
    if (error) {
      setFieldError(error);
      inputRef.current?.focus();
      return;
    }
    setFieldError('');

    try {
      // await createNewBasket(basketName);
      // this line is for testing - when connected to backend, delete this and use the line above
      await createBasket(basketName); 
      setBaskets(prev => prev.includes(basketName) ? prev : [basketName, ...prev]);
      setCreationResult({ 
        status: 'success', 
        message: `Basket ${basketName} is successfully created!`,
        name: basketName,
      });
      // await refreshCard();
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        // await refreshCard();
        setCreationResult({ 
          status: 'conflict', 
          message: `Failed to create basket: ${basketName} - basket already exists.`
        });
      } else if (status === 400 || status === 414) {
        // await refreshCard();
        setCreationResult({ 
          status: 'invalid', 
          message: `Failed to create basket: name is invalid.`
        });
      } else {
        setCreationResult({
          status: 'error', 
          message: `Failed to create basket: ${err}.`
        });
      };
    }
    openModal();
  };

  return (
    <div className="new-basket-card">
      <h1>New Basket</h1>
      <p>Create a basket to collect and inspect HTTP requests</p>
      <form className="new-basket-form" onSubmit={handleFormSubmit} noValidate>
        <label htmlFor="basket-name-input">{domainName}</label>
        <input
          type="text"
          id="basket-name-input"
          defaultValue={defaultBasketName} 
          ref={inputRef}
          maxLength={100}
          placeholder="type a name"
          onInput={() => fieldError && setFieldError("")}
        />
        <button type="submit" className="create-btn">Create</button>
        {fieldError && (
          <p id="basket-name-error" className="field-error" role="alert">
            {fieldError}
          </p>
        )}
      </form>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalContent />
      </Modal>
    </div>
  );
};

export default NewBasketCard;
