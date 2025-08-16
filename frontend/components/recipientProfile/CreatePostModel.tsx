// components/recipientProfile/CreatePostModal.tsx
'use client';
import React, { useState } from 'react';
import { createPost } from '@/lib/recipientPosts';
import { PostCategory, PostStatus, PostUrgency } from '@/lib/recipientPosts';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreatePostModal({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'Blood' as PostCategory,
    status: 'PENDING' as PostStatus,
    urgency: 'HIGH' as PostUrgency,
    location: '',
    contact: '',
    goal: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (!user || !user.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        recipient_id: user.id,
        goal: form.goal ? parseFloat(form.goal) : undefined,
      };
      await createPost(payload);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">Create New Post</h2>
        <div className="space-y-4">
          <input className="w-full p-2 border rounded" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          <textarea className="w-full p-2 border rounded" name="content" placeholder="Content" value={form.content} onChange={handleChange} />
          <input className="w-full p-2 border rounded" name="location" placeholder="Location" value={form.location} onChange={handleChange} />
          <input className="w-full p-2 border rounded" name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} />
          <input className="w-full p-2 border rounded" name="goal" placeholder="Goal (only for monetary)" value={form.goal} onChange={handleChange} type="number" />

          <div className="flex gap-4">
            <select name="category" value={form.category} onChange={handleChange} className="p-2 border rounded w-full">
              <option value="BLOOD">Blood</option>
              <option value="MONETARY">Monetary</option>
            </select>
            <select name="urgency" value={form.urgency} onChange={handleChange} className="p-2 border rounded w-full">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
