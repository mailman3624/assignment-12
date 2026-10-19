import bestSellerBadge from '../assets/bestseller.svg';

const FoodItem = ({ name, price, isBestSeller, index, deleteItem, isAdmin }) => {
    return (
        <li className="food-item">
            <span className="food-info">
                {name} - {price} baht
            </span>
            {isBestSeller && (
                <img
                    src={bestSellerBadge}
                    alt="Best Seller"
                    className="badge-img"
                />
            )}
            {isAdmin && (
                <button
                    type="button"
                    className="del-btn"
                    onClick={() => deleteItem(index)}
                >
                    Del
                </button>
            )}
        </li>
    );
};

export default FoodItem;
