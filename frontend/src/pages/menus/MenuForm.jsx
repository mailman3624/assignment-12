import { useState, useEffect } from "react";

const MenuForm = ({
  addMenu,
  updateMenu,
  editingMenu,
  cancelEdit,
  typeList,
}) => {
  const [inputs, setInputs] = useState({
    menuId: "",
    name: "",
    price: "",
    isBestSeller: "true",
    typeId: "",
  });

  useEffect(() => {
    if (editingMenu) {
      setInputs({
        menuId: editingMenu.menuId,
        name: editingMenu.name,
        price: editingMenu.price,
        isBestSeller: String(editingMenu.isBestSeller),
        typeId: String(editingMenu.typeId || 1),
      });
    } else {
      setInputs((prev) => ({
        menuId: "",
        name: "",
        price: "",
        isBestSeller: "true",
        typeId: prev.typeId || (typeList[0] ? String(typeList[0].typeId) : "1"),
      }));
    }
  }, [editingMenu, typeList]);

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!inputs.name.trim() || inputs.price === "") return;

    const selectedTypeId =
      inputs.typeId || (typeList[0] ? typeList[0].typeId : 1);

    const payload = {
      name: inputs.name.trim(),
      price: Number(inputs.price),
      isBestSeller: inputs.isBestSeller === "true",
      typeId: Number(selectedTypeId),
    };

    if (editingMenu) {
      await updateMenu(editingMenu.menuId, payload);
    } else {
      await addMenu(payload);
    }

    setInputs({
      menuId: "",
      name: "",
      price: "",
      isBestSeller: "true",
      typeId: typeList[0] ? String(typeList[0].typeId) : "1",
    });
  };

  return (
    <div className="menu-form-section">
      <h3>{editingMenu ? "Edit Food" : "New Food"}</h3>
      <form onSubmit={handleSubmit} className="menu-form">
        <div className="form-field">
          <label>
            name :{" "}
            <input
              type="text"
              name="name"
              value={inputs.name}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="form-field">
          <label>
            price :{" "}
            <input
              type="number"
              name="price"
              value={inputs.price}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="form-field">
          <label>
            Best Seller :{" "}
            <select
              name="isBestSeller"
              value={inputs.isBestSeller}
              onChange={handleChange}
            >
              <option value="true">BestSeller</option>
              <option value="false">Normal</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingMenu ? "Update menu" : "Add menu"}
          </button>
          {editingMenu && (
            <button
              type="button"
              className="cancel-btn"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MenuForm;
