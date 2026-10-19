import { useState, useEffect } from "react";
import { menuApi } from "../../services/menuApi";
import { typeApi } from "../../services/typeApi";
import MenuList from "./MenuList";
import MenuForm from "./MenuForm";

function Menu() {
  const [menuList, setMenuList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);

  const fetchMenus = async () => {
    try {
      const data = await menuApi.getAll();
      setMenuList(data);
    } catch (error) {
      console.error("Failed to fetch menus:", error);
    }
  };

  const fetchTypes = async () => {
    try {
      const data = await typeApi.getAll();
      setTypeList(data);
    } catch (error) {
      console.error("Failed to fetch types:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchMenus(), fetchTypes()]);
    };
    fetchData();
  }, []);

  const addMenu = async (newMenu) => {
    try {
      await menuApi.create(newMenu);
      await fetchMenus();
    } catch (error) {
      console.error("Failed to add menu:", error);
    }
  };

  const updateMenu = async (id, updatedData) => {
    try {
      await menuApi.update(id, updatedData);
      setEditingMenu(null);
      await fetchMenus();
    } catch (error) {
      console.error("Failed to update menu:", error);
    }
  };

  const deleteMenu = async (id) => {
    try {
      await menuApi.delete(id);
      setMenuList((prevList) =>
        prevList.filter((menu) => menu.menuId !== id)
      );
      if (editingMenu && editingMenu.menuId === id) {
        setEditingMenu(null);
      }
    } catch (error) {
      console.error("Failed to delete menu:", error);
    }
  };

  return (
    <div className="menu-container" style={{ padding: "20px" }}>
      <MenuList
        menuList={menuList}
        deleteMenu={deleteMenu}
        onEdit={(item) => setEditingMenu(item)}
      />
      <MenuForm
        addMenu={addMenu}
        updateMenu={updateMenu}
        editingMenu={editingMenu}
        cancelEdit={() => setEditingMenu(null)}
        typeList={typeList}
      />
    </div>
  );
}

export default Menu;
