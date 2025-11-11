import { useState } from 'react';

export type MenuRow = {
  _id: string;
  slug: string;
  title: string;
  items: any[];  // Made items required
  order?: number;
}

type MenuTableProps = {
  menus: MenuRow[];
  onEdit?: (menu: MenuRow) => void;
  onDelete: (slug: string) => Promise<void>;
  onOrderChange?: (slug: string, direction: 'up' | 'down') => Promise<void>;
};

export default function MenuTable({ menus, onEdit, onDelete, onOrderChange }: MenuTableProps) {
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const handleDelete = async (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    if (!window.confirm(`Xác nhận xóa menu "${slug}" này?`)) return;
    await onDelete(slug);
  };

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-head-title">Menus List</div>
          <div className="card-sub">{menus.length} total</div>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th style={{ width: 100 }}>Thứ tự</th>
              <th>Slug</th>
              <th>Tiêu đề</th>
              <th style={{ width: 100 }}>Số mục</th>
              <th style={{ width: 200 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {menus.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">Chưa có menu nào</td>
              </tr>
            )}

            {menus.map((m, index) => (
              <tr 
                key={m.slug}
                className={`transition-colors ${isDragging === m.slug ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                onDragStart={() => onOrderChange && setIsDragging(m.slug)}
                onDragEnd={() => setIsDragging(null)}
              >
                <td className="text-center py-3">
                  <div className="flex items-center justify-center space-x-2">
                    {onOrderChange && (
                      <div className="flex flex-col items-center space-y-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onOrderChange(m.slug, 'up');
                          }}
                          className={`p-1.5 rounded-full transition-colors ${menus[0]?.slug === m.slug ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-blue-100 hover:text-blue-600'}`}
                          disabled={menus[0]?.slug === m.slug}
                          title="Di chuyển lên"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <div className="w-8 h-8 flex items-center justify-center bg-white border rounded-full text-sm font-medium shadow-sm">
                          {m.order || index + 1}
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onOrderChange(m.slug, 'down');
                          }}
                          className={`p-1.5 rounded-full transition-colors ${menus[menus.length - 1]?.slug === m.slug ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-blue-100 hover:text-blue-600'}`}
                          disabled={menus[menus.length - 1]?.slug === m.slug}
                          title="Di chuyển xuống"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {!onOrderChange && (
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-50 border rounded-full text-sm font-medium">
                        {m.order || index + 1}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3">
                  <div className="font-medium text-gray-900">{m.slug}</div>
                </td>
                <td className="py-3">
                  {m.title || <span className="text-gray-400">(chưa có tiêu đề)</span>}
                </td>
                <td className="text-center py-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    {m.items?.length || 0}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex justify-end space-x-2">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(m);
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md border border-blue-100 hover:border-blue-200 transition-colors flex items-center"
                        title="Sửa menu"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Sửa
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, m.slug)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md border border-red-100 hover:border-red-200 transition-colors flex items-center"
                      title="Xóa menu"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  )
}
