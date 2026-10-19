import FoodItem from './FoodItem';

const FoodList = ({ food, deleteItem, isAdmin }) => {
    return (
        <div className="food-list-box">
            <ul>
                {food.map((item, index) => (
                    <FoodItem
                        key={index}
                        index={index}
                        name={item.name}
                        price={item.price}
                        isBestSeller={item.isBestSeller}
                        deleteItem={deleteItem}
                        isAdmin={isAdmin}
                    />
                ))}
            </ul>
        </div>
    );
};

export default FoodList;
