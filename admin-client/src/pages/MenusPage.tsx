import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { apiGetJson, apiPostJson, apiPutJson, apiDeleteJson } from '../services/api'
import MenuForm, { type MenuFormData } from '../components/MenuForm'
import MenuTable from '../components/MenuTable'
import type { MenuRow } from '../components/MenuTable'

type ApiMenusList = {
  success: boolean
  message: string
  data: MenuRow[]
}

export default function MenusPage() {
  const { data, loading, error, request, setData } = useApi<ApiMenusList>()
  const [showForm, setShowForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuRow | null>(null)

  const reload = useCallback(() => {
    return request(() =>
      apiGetJson<ApiMenusList>('/api/v1/menus')
    )
  }, [request])

  useEffect(() => {
    reload()
  }, [reload])

  const handleSaveMenu = async (payload: MenuFormData) => {
    try {
      if (editingMenu) {
        await apiPutJson(`/api/v1/menus/${editingMenu.slug}`, payload)
      } else {
        await apiPostJson('/api/v1/menus', payload)
      }
      
      setShowForm(false)
      setEditingMenu(null)
      reload()
    } catch (error) {
      console.error('Error saving menu:', error)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa menu này?`)) return
    
    try {
      await apiDeleteJson(`/api/v1/menus/${slug}`)
      
      setData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          data: prev.data.filter(m => m.slug !== slug),
        }
      })
    } catch (error) {
      console.error('Error deleting menu:', error)
    }
  }

  const handleEditMenu = (menu: MenuRow) => {
    setEditingMenu(menu)
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingMenu(null)
    setShowForm(false)
  }

  const handleOrderChange = async (slug: string, direction: 'up' | 'down') => {
    if (!data?.data) return;
    
    // Tạo bản sao của mảng menus
    const updatedMenus = [...data.data];
    
    // Tìm index của menu hiện tại và menu đích
    const currentIndex = updatedMenus.findIndex(m => m.slug === slug);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= updatedMenus.length) return;
    
    // Lưu lại menu hiện tại và menu đích
    const currentMenu = { ...updatedMenus[currentIndex] };
    const targetMenu = { ...updatedMenus[newIndex] };
    
    try {
      // Cập nhật thứ tự dựa trên vị trí mới
      // Đặt lại order cho tất cả các menu dựa trên vị trí của chúng
      updatedMenus.forEach((menu, index) => {
        menu.order = index + 1;
      });
      
      // Hoán đổi vị trí
      updatedMenus[currentIndex] = targetMenu;
      updatedMenus[newIndex] = currentMenu;
      
      // Cập nhật lại order sau khi hoán đổi
      updatedMenus.forEach((menu, index) => {
        menu.order = index + 1;
      });
      
      // Sắp xếp lại mảng theo order
      const sortedMenus = [...updatedMenus].sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Cập nhật giao diện người dùng
      setData(prev => ({
        ...prev!,
        data: sortedMenus
      }));
      
      // Cập nhật tất cả các menu để đảm bảo đồng bộ
      const updatePromises = sortedMenus.map(menu => 
        apiPutJson(`/api/v1/menus/${menu.slug}`, {
          ...menu,
          order: menu.order
        })
      );
      
      await Promise.all(updatePromises);
      
    } catch (error) {
      console.error('Lỗi khi cập nhật thứ tự menu:', error);
      // Nếu có lỗi, tải lại dữ liệu từ server
      await reload();
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-head-title">Quản lý Menu</div>
          <div className="card-sub">
            Thêm / sửa / xóa menu (main-menu, footer-menu,...)
          </div>
        </div>
        
        {!showForm && (
          <button
            onClick={() => {
              setEditingMenu(null)
              setShowForm(true)
            }}
            className="btn btn-primary"
          >
            + Thêm menu mới
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 text-red-600 bg-red-50 rounded">
          ❌ {error}
        </div>
      )}

      {showForm ? (
        <div className="p-4">
          <MenuForm 
            initialData={editingMenu || undefined}
            onSave={handleSaveMenu}
            onCancel={handleCancelEdit}
          />
        </div>
      ) : (
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải danh sách menu...</p>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <MenuTable 
              menus={data.data}
              onEdit={handleEditMenu}
              onDelete={handleDelete}
              onOrderChange={handleOrderChange}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có menu nào. Hãy thêm menu mới để bắt đầu.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
