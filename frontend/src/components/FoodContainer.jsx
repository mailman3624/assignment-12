import { useState } from 'react';
import FoodList from './FoodList';
import FoodForm from './FoodForm';

const initialMenu = [
    { name: 'cake', price: 35, isBestSeller: true },
    { name: 'bread', price: 25, isBestSeller: false },
    { name: 'milk', price: 15, isBestSeller: true },
    { name: 'donut', price: 45, isBestSeller: false },
    { name: 'cookie', price: 55, isBestSeller: true },
];

const FoodContainer = () => {
    const [food, setFood] = useState(initialMenu);
    const [isAdmin, setIsAdmin] = useState(true);

    const deleteItem = (index) => {
        const updated = food.filter((_, i) => i !== index);
        setFood(updated);
    };

    const addItem = (item) => {
        setFood([...food, item]);
    };

    return (
        <div className="card">
            <div className="mode-bar">
                <span className="mode-status">
                    {isAdmin ? 'Admin Mode' : 'User Mode'}
                </span>
                <button
                    type="button"
                    className="mode-switch-btn"
                    onClick={() => setIsAdmin(!isAdmin)}
                >
                    {isAdmin ? 'User' : 'Admin'}
                </button>
            </div>

            <h3>Our Menu</h3>
            <FoodList
                food={food}
                deleteItem={deleteItem}
                isAdmin={isAdmin}
            />

            {isAdmin && <FoodForm addItem={addItem} />}
        </div>
    );
};

export default FoodContainer;
