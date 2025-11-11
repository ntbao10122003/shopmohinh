import { useState, useEffect } from 'react';
import axios from 'axios';
import MenuItemForm from '../components/MenuItemForm';

type MenuItem = {
  id: string;
  title: string;
  url: string;
  slug: string;
  order: number;
  children: MenuItem[];
};

type Menu = {
  _id: string;
  name: string;
  slug: string;
  items: MenuItem[];
};

export default function MenuManager() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await axios.get('/api/v1/menus');
      setMenus(res.data.data || []);
      if (res.data.data?.length > 0 && !selectedMenu) {
        setSelectedMenu(res.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async () => {
    if (!editingMenu || !newMenuName.trim()) return;

    try {
      await axios.put(`/api/v1/menus/${editingMenu._id}`, {
        name: newMenuName.trim(),
      });
      
      setShowMenuForm(false);
      setEditingMenu(null);
      setNewMenuName('');
      fetchMenus();
    } catch (error) {
      console.error('Error updating menu:', error);
      alert('Có lỗi xảy ra khi cập nhật menu');
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa menu này?')) return;
    
    try {
      await axios.delete(`/api/v1/menus/${menuId}`);
      
      // If the deleted menu was selected, clear the selection
      if (selectedMenu?._id === menuId) {
        setSelectedMenu(null);
      }
      
      fetchMenus();
    } catch (error) {
      console.error('Error deleting menu:', error);
      alert('Có lỗi xảy ra khi xóa menu');
    }
  };

  const handleSaveItem = async (itemData: Omit<MenuItem, 'id' | 'children'>) => {
    if (!selectedMenu) return;

    try {
      const updatedMenu = { ...selectedMenu };
      
      if (editingItem) {
        // Update existing item
        const itemIndex = updatedMenu.items.findIndex(
          (item) => item.id === editingItem.id
        );
        if (itemIndex !== -1) {
          updatedMenu.items[itemIndex] = { ...updatedMenu.items[itemIndex], ...itemData };
        }
      } else {
        // Add new item
        const newItem = {
          ...itemData,
          id: Date.now().toString(),
          children: [],
        };
        updatedMenu.items = [...updatedMenu.items, newItem];
      }

      // Sort items by order
      updatedMenu.items.sort((a, b) => a.order - b.order);

      // Update the menu
      await axios.put(`/api/v1/menus/${selectedMenu._id}`, {
        items: updatedMenu.items,
      });

      setSelectedMenu(updatedMenu);
      setShowItemForm(false);
      setEditingItem(null);
      fetchMenus(); // Refresh the menu list
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Có lỗi xảy ra khi lưu mục menu');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedMenu) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;

    try {
      const updatedItems = selectedMenu.items.filter((item) => item.id !== itemId);
      
      await axios.put(`/api/v1/menus/${selectedMenu._id}`, {
        items: updatedItems,
      });

      setSelectedMenu({
        ...selectedMenu,
        items: updatedItems,
      });
      
      fetchMenus(); // Refresh the menu list
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Có lỗi xảy ra khi xóa mục menu');
    }
  };

  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className="border-l-2 border-gray-200 pl-4 my-2">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div className="flex-1">
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-gray-500">{item.url}</div>
            <div className="text-xs text-gray-400">Slug: {item.slug}</div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditItem(item)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Chỉnh sửa"
            >
              ✏️
            </button>
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="p-1 text-red-600 hover:text-red-800"
              title="Xóa"
            >
              🗑️
            </button>
          </div>
        </div>
        {item.children.length > 0 && (
          <div className="ml-4">
            {renderMenuItems(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return <div className="p-4">Đang tải...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Quản lý Menu</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Menu List */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Danh sách Menu</h2>
              <button
                onClick={() => {
                  setNewMenuName('');
                  setEditingMenu(null);
                  setShowMenuForm(true);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
                title="Thêm menu mới"
              >
                + Thêm
              </button>
            </div>
            
            {showMenuForm && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <input
                  type="text"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="Tên menu mới"
                  className="w-full p-2 border rounded mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowMenuForm(false);
                      setEditingMenu(null);
                    }}
                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveMenu}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    {editingMenu ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {menus.map((menu) => (
                <div
                  key={menu._id}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    selectedMenu?._id === menu._id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{menu.name}</div>
                    <div className="text-sm text-gray-500">{menu.items.length} mục</div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMenu(menu);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Mở
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewMenuName(menu.name);
                        setEditingMenu(menu);
                        setShowMenuForm(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                      title="Sửa tên menu"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMenu(menu._id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      title="Xóa menu"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {menus.length === 0 && !showMenuForm && (
                <div className="text-center py-4 text-gray-500">
                  Chưa có menu nào
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1">
          {selectedMenu ? (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{selectedMenu.name}</h2>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowItemForm(true);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  + Thêm mục
                </button>
              </div>

              {showItemForm && (
                <div className="mb-6">
                  <MenuItemForm
                    item={editingItem || undefined}
                    onSave={handleSaveItem}
                    onCancel={() => {
                      setShowItemForm(false);
                      setEditingItem(null);
                    }}
                  />
                </div>
              )}

              {selectedMenu.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có mục nào trong menu này. Nhấn "Thêm mục" để bắt đầu.
                </div>
              ) : (
                <div className="space-y-2">
                  {renderMenuItems(selectedMenu.items)}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Vui lòng chọn một menu hoặc tạo menu mới.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
