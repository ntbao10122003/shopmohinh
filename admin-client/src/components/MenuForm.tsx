import { useState, useEffect, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type MenuItemType = {
  id: string;
  title: string;
  url: string;
  slug: string;
  order: number;
  children: any[];
};

const ItemTypes = {
  MENU_ITEM: 'menuItem',
};

export type MenuFormData = {
  slug: string
  title: string
  items: any[]
}

type MenuFormProps = {
  initialData?: MenuFormData
  onSave: (payload: MenuFormData) => Promise<void>
  onCancel: () => void
}

function MenuForm({ 
  initialData,
  onSave,
  onCancel 
}: MenuFormProps) {
  const [slug, setSlug] = useState(initialData?.slug || 'main-menu')
  const [title, setTitle] = useState(initialData?.title || '')
  const [items, setItems] = useState<MenuItemType[]>(
    initialData?.items || []
  );
  
  // Update itemsText when items change
  useEffect(() => {
    setItemsText(JSON.stringify(items, null, 2));
  }, [items]);
  
  const [itemsText, setItemsText] = useState(
    initialData?.items ? JSON.stringify(initialData.items, null, 2) : '[]'
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  // Handle drag and drop reordering
  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const [movedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, movedItem);
      
      // Update order numbers
      return newItems.map((item, index) => ({
        ...item,
        order: index + 1
      }));
    });
  }, []);

  // Menu Item Component with Drag and Drop
  const MenuItem = ({ item, index, moveItem }: { item: MenuItemType, index: number, moveItem: (dragIndex: number, hoverIndex: number) => void }) => {
    const ref = useRef<HTMLDivElement>(null);
    
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.MENU_ITEM,
      item: { index },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    
    const [, drop] = useDrop({
      accept: ItemTypes.MENU_ITEM,
      hover(item: { index: number }, monitor: any) {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        
        if (dragIndex === hoverIndex) return;
        
        // Determine rectangle on screen
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        // Get vertical middle
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        // Get mouse position
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        
        // Only perform the move when the mouse has crossed half of the items height
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
        
        // Time to actually perform the action
        moveItem(dragIndex, hoverIndex);
        
        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.index = hoverIndex;
      },
    });
    
    const opacity = isDragging ? 0.4 : 1;
    drag(drop(ref));
    
    return (
      <div 
        ref={ref} 
        style={{ opacity }} 
        className="flex items-center p-2 border rounded mb-2 bg-white hover:bg-gray-50 cursor-move"
      >
        <div className="mr-3 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-medium">{item.title}</div>
          <div className="text-sm text-gray-500">{item.url}</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            Thứ tự: {item.order}
          </div>
          {isReordering && (
            <div className="text-gray-400 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Parse JSON when text changes
  useEffect(() => {
    try {
      if (itemsText.trim()) {
        const parsed = JSON.parse(itemsText);
        if (Array.isArray(parsed)) {
          setItems(parsed.map((item, index) => ({
            ...item,
            order: item.order || index + 1
          })));
        }
      } else {
        setItems([]);
      }
    } catch (e) {
      // Invalid JSON, keep the current items
    }
  }, [itemsText]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Use the current items state which is always in sync with the UI
      await onSave({
        slug,
        title,
        items: items.map((item, index) => ({
          ...item,
          order: index + 1 // Ensure order is sequential
        }))
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu menu');
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-title">{initialData ? 'Cập nhật menu' : 'Tạo menu mới'}</div>
        <div className="card-sub">{initialData ? 'Cập nhật menu hiện tại' : 'Tạo menu mới (main-menu, footer-menu,...)'}</div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="mb-16">
          <label>Slug *</label>
          <input
            required
            value={slug}
            onChange={e => setSlug(e.target.value)}
          />
          <div className="muted">
            ví dụ: main-menu, footer-menu
          </div>
        </div>

        <div className="mb-16">
          <label>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-16">
          <label>Menu Items (JSON) <span className="text-gray-500">(Tùy chọn)</span></label>
          <p className="text-sm text-gray-500 mb-2">
            Để trống nếu muốn tạo menu trống. Ví dụ cấu trúc JSON:
          </p>
          <div className="bg-gray-100 p-3 rounded mb-3">
            <button 
              type="button" 
              onClick={() => setItemsText(JSON.stringify([
                {
                  id: '1',
                  title: 'Trang chủ',
                  url: '/',
                  slug: 'home',
                  order: 1,
                  children: []
                },
                {
                  id: '2',
                  title: 'Sản phẩm',
                  url: '/products',
                  slug: 'products',
                  order: 2,
                  children: []
                }
              ], null, 2))}
              className="text-blue-600 hover:underline text-sm mb-2"
            >
              Sử dụng mẫu có sẵn
            </button>
            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40 border">
              {`[
  {
    "id": "1",
    "title": "Trang chủ",
    "url": "/",
    "slug": "home",
    "order": 1,
    "children": []
  },
  {
    "id": "2",
    "title": "Sản phẩm",
    "url": "/products",
    "slug": "products",
    "order": 2,
    "children": []
  }
]`}
            </pre>
            <button 
              type="button"
              onClick={() => setItemsText(JSON.stringify([], null, 2))}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              + Thêm mục mới
            </button>
          </div>
          
          <div className="mb-2 text-sm text-gray-600">
            <p>Định dạng URL: /slug-danh-muc/slug-san-pham</p>
            <p>Ví dụ: /dien-thoai/iphone-15-pro-max</p>
          </div>
          
          <div className="mb-4">
            <div className="mb-2 flex justify-between items-center">
              <span className="font-medium">
                {isReordering ? 'Đang sắp xếp thứ tự' : 'Danh sách menu'}
              </span>
              <button
                type="button"
                onClick={() => setIsReordering(!isReordering)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {isReordering ? 'Hoàn thành' : 'Sắp xếp thứ tự'}
              </button>
              <div className={`mt-2 space-y-2 max-h-60 overflow-y-auto p-2 border rounded ${isReordering ? 'bg-gray-50' : ''}`}>
                {items.length > 0 ? (
                  items.map((item, i) => (
                    <div 
                      key={item.id}
                      className={isReordering ? 'cursor-move' : ''}
                    >
                      <MenuItem 
                        item={item} 
                        index={i} 
                        moveItem={isReordering ? moveItem : () => {}} 
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Chưa có mục nào. Thêm mục bên dưới.
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Chỉnh sửa JSON (nâng cao):</label>
              <textarea
                value={itemsText}
                onChange={e => setItemsText(e.target.value)}
                rows={8}
                style={{ fontFamily: 'monospace' }}
                className="w-full border p-2 rounded text-sm"
                placeholder="Để trống hoặc nhập cấu trúc JSON..."
              />
            </div>
            <div className="text-xs text-gray-500 mb-4">
              <p className="font-medium mb-1">Các trường cho mỗi mục menu:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><code>id</code>: Mã định danh duy nhất (chuỗi)</li>
                <li><code>title</code>: Văn bản hiển thị</li>
                <li><code>url</code>: Đường dẫn liên kết</li>
                <li><code>slug</code>: Định danh thân thiện với URL (dùng cho API)</li>
                <li><code>order</code>: Thứ tự hiển thị (số)</li>
                <li><code>children</code>: Các mục con (mảng)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button 
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            disabled={saving}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Tạo mới')}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2 text-red-600 bg-red-50 rounded text-sm">
            ❌ {error}
          </div>
        )}
      </form>
    </div>
  );
};

const MenuFormWithDnD = (props: MenuFormProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <MenuForm {...props} />
    </DndProvider>
  );
};

export { MenuForm };
export default MenuFormWithDnD;
