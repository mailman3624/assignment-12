import { useState } from 'react';

const FoodForm = ({ addItem }) => {
    const [inputs, setInputs] = useState({
        name: '',
        price: '',
        isBestSeller: 'true'
    });

    function handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!inputs.name.trim() || inputs.price === '') return;

        const newFood = {
            name: inputs.name.trim(),
            price: Number(inputs.price),
            isBestSeller: inputs.isBestSeller === 'true'
        };

        addItem(newFood);
        setInputs({ name: '', price: '', isBestSeller: 'true' });
    }

    return (
        <div className="food-form-section">
            <h3>New Food</h3>
            <form onSubmit={handleSubmit} className="food-form">
                <div className="form-field">
                    <label>name : </label>
                    <input
                        type="text"
                        name="name"
                        value={inputs.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>price : </label>
                    <input
                        type="number"
                        name="price"
                        value={inputs.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Best Seller : </label>
                    <select
                        name="isBestSeller"
                        value={inputs.isBestSeller}
                        onChange={handleChange}
                    >
                        <option value="true">BestSeller</option>
                        <option value="false">Normal</option>
                    </select>
                </div>
                <button type="submit" className="submit-btn">
                    Add menu
                </button>
            </form>
        </div>
    );
};

export default FoodForm;
