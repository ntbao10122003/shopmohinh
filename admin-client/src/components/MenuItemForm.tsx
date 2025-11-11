import { useState, useEffect } from 'react';
import axios from 'axios';

type MenuItem = {
  id: string;
  title: string;
  url: string;
  slug: string;
  order: number;
  children: MenuItem[];
};

type Category = {
  _id: string;
  name: string;
  slug: string;
};

type MenuItemFormProps = {
  item?: MenuItem;
  onSave: (item: Omit<MenuItem, 'id' | 'children'>) => void;
  onCancel: () => void;
};

export default function MenuItemForm({ item, onSave, onCancel }: MenuItemFormProps) {
  const [title, setTitle] = useState(item?.title || '');
  const [url, setUrl] = useState(item?.url || '');
  const [slug, setSlug] = useState(item?.slug || '');
  const [order, setOrder] = useState<number>(item?.order || 0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        // Replace with your actual API endpoint
        const res = await axios.get('/api/v1/categories');
        setCategories(res.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categorySlug = e.target.value;
    const category = categories.find(cat => cat.slug === categorySlug);
    
    if (category) {
      setTitle(category.name);
      setSlug(category.slug);
      setUrl(`/category/${category.slug}`);
      setSelectedCategory(categorySlug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      url,
      slug,
      order,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">{item ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Category
          </label>
          <select
            value={selectedCategory}
            onChange={handleCategorySelect}
            className="w-full p-2 border rounded"
            disabled={loading}
          >
            <option value="">-- Select a category --</option>
            {categories.map((category) => (
              <option key={category._id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-full p-2 border rounded"
            min="0"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
