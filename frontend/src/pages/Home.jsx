import { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import bestSellerBadge from '../assets/bestseller.svg';
import './home.css';

const API_BASE = 'http://localhost:3000';

function Home() {
    const [userInfo, setUserInfo] = useState(null);
    const [menuList, setMenuList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [adminView, setAdminView] = useState('menu'); // 'menu' | 'user'
    const [selectedRatings, setSelectedRatings] = useState({});
    const [inputs, setInputs] = useState({
        name: '',
        price: '',
        isBestSeller: 'true'
    });

    const navigate = useNavigate();

    const fetchMenus = useCallback(async () => {
        try {
            const res = await Axios.get(`${API_BASE}/api/menu`);
            setMenuList(res.data);
        } catch (err) {
            console.error('Error fetching menus:', err);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await Axios.get(`${API_BASE}/authen/users`);
            setUserList(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }, []);

    const fetchData = useCallback(async () => {
        await fetchMenus();

        const token = localStorage.getItem('token');
        if (!token || token === 'null' || token === 'undefined') {
            setUserInfo(null);
            return;
        }

        try {
            const response = await Axios.get(`${API_BASE}/authen/home`, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            if (response.status !== 200 && response.status !== 201) {
                setUserInfo(null);
            } else if (response.data.user && response.data.user.length > 0) {
                const loggedInUser = response.data.user[0];
                setUserInfo(loggedInUser);
                if (loggedInUser.role === 'admin') {
                    await fetchUsers();
                }
            }
        } catch (err) {
            localStorage.removeItem('token');
            setUserInfo(null);
        }
    }, [fetchMenus, fetchUsers]);

    // Real-time data updates (polling every 5 seconds as shown in slides)
    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserInfo(null);
        setAdminView('menu');
        navigate('/');
    };

    // User mode: handle rating selection
    const handleRatingChange = async (menuId, newScore) => {
        setSelectedRatings((prev) => ({
            ...prev,
            [menuId]: newScore
        }));
        try {
            await Axios.post(`${API_BASE}/api/menu/${menuId}/rate`, {
                score: Number(newScore),
                userId: userInfo ? userInfo.userId : null
            });
            await fetchMenus();
        } catch (err) {
            console.error('Failed to rate menu:', err);
        }
    };

    // Admin mode: handle New Food form input change
    const handleFoodInputChange = (e) => {
        const { name, value } = e.target;
        setInputs((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Admin mode: Add new menu
    const handleAddMenu = async (e) => {
        e.preventDefault();
        if (!inputs.name.trim() || inputs.price === '') return;
        try {
            await Axios.post(`${API_BASE}/api/menu`, {
                name: inputs.name.trim(),
                price: Number(inputs.price),
                isBestSeller: inputs.isBestSeller === 'true',
                typeId: 1
            });
            setInputs({ name: '', price: '', isBestSeller: 'true' });
            await fetchMenus();
        } catch (err) {
            console.error('Failed to add menu:', err);
        }
    };

    // Admin mode: Delete menu
    const handleDeleteMenu = async (menuId) => {
        try {
            await Axios.delete(`${API_BASE}/api/menu/${menuId}`);
            await fetchMenus();
        } catch (err) {
            console.error('Failed to delete menu:', err);
        }
    };

    // Admin mode: Update user role
    const handleRoleChange = async (targetUserId, newRole) => {
        try {
            await Axios.put(`${API_BASE}/authen/users/${targetUserId}`, {
                role: newRole
            });
            await fetchUsers();
            // If admin changed their own role to user, refresh userInfo
            if (userInfo && userInfo.userId === targetUserId && newRole !== 'admin') {
                await fetchData();
            }
        } catch (err) {
            console.error('Failed to update role:', err);
        }
    };

    const isAdmin = userInfo && userInfo.role === 'admin';
    const isUser = userInfo && userInfo.role === 'user';

    return (
        <div className="home-wrapper">
            {/* Top Bar */}
            <header className="top-header-bar">
                {userInfo ? (
                    <>
                        <span className="header-username">{userInfo.userName}</span>
                        <button type="button" className="header-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <button type="button" className="header-btn" onClick={() => navigate('/login')}>
                        Login
                    </button>
                )}
            </header>

            {/* Admin Mode Toggle Button (user / menu) */}
            {isAdmin && (
                <div className="admin-mode-toggle-row">
                    <button
                        type="button"
                        className="admin-switch-btn"
                        onClick={() => setAdminView(adminView === 'menu' ? 'user' : 'menu')}
                    >
                        {adminView === 'menu' ? 'user' : 'menu'}
                    </button>
                </div>
            )}

            <main className="home-content">
                {/* ADMIN MODE */}
                {isAdmin ? (
                    adminView === 'menu' ? (
                        <div className="admin-menu-section">
                            <h2 className="admin-menu-heading">Our Menu</h2>
                            <ul className="menu-ul">
                                {menuList.map((item) => (
                                    <li key={item.menuId} className="menu-li">
                                        <span>
                                            {item.name} - {item.price} baht
                                        </span>
                                        {Boolean(item.isBestSeller) && (
                                            <img
                                                src={bestSellerBadge}
                                                alt="Best Seller"
                                                className="badge-img"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            className="del-btn"
                                            onClick={() => handleDeleteMenu(item.menuId)}
                                        >
                                            Del
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="new-food-box">
                                <h3 className="new-food-title">New Food</h3>
                                <form onSubmit={handleAddMenu}>
                                    <div className="new-food-field">
                                        <label>name : </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={inputs.name}
                                            onChange={handleFoodInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="new-food-field">
                                        <label>price : </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={inputs.price}
                                            onChange={handleFoodInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="new-food-field">
                                        <label>Best Seller : </label>
                                        <select
                                            name="isBestSeller"
                                            value={inputs.isBestSeller}
                                            onChange={handleFoodInputChange}
                                        >
                                            <option value="true">BestSeller</option>
                                            <option value="false">Normal</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="add-menu-btn">
                                        Add menu
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="admin-user-section">
                            <h1 className="home-heading">User</h1>
                            <ul className="user-ul">
                                {userList
                                    .filter((u) => !userInfo || u.userName !== userInfo.userName)
                                    .map((u) => (
                                        <li key={u.userId} className="user-li">
                                            <span>
                                                {u.userName} {u.email}{' '}
                                            </span>
                                            <select
                                                className="role-select"
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                                            >
                                                <option value="user">user</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )
                ) : (
                    /* USER MODE & GUEST MODE */
                    <div className="public-menu-section">
                        <h1 className="home-heading">Our menu</h1>
                        <ul className="menu-ul">
                            {menuList.map((item) => (
                                <li key={item.menuId} className="menu-li">
                                    <span>
                                        {item.name} (<span className="star-icon">⭐</span>
                                        {item.avgRating ?? 0} )- {item.price} baht
                                    </span>
                                    {Boolean(item.isBestSeller) && (
                                        <img
                                            src={bestSellerBadge}
                                            alt="Best Seller"
                                            className="badge-img"
                                        />
                                    )}
                                    {isUser && (
                                        <>
                                            <span className="choose-rating-label">Choose rating: </span>
                                            <select
                                                className="rating-select"
                                                value={selectedRatings[item.menuId] ?? 5}
                                                onChange={(e) =>
                                                    handleRatingChange(item.menuId, e.target.value)
                                                }
                                            >
                                                <option value="5">5</option>
                                                <option value="4">4</option>
                                                <option value="3">3</option>
                                                <option value="2">2</option>
                                                <option value="1">1</option>
                                            </select>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Home;
