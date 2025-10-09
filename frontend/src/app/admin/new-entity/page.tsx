"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { createEntity, EntityCreateRequest } from "@/api/entities";
import { EntityType, TagType } from "@/models/index";

const tagTypeOptions = [
  { value: TagType.LOCATION, label: "Location" },
  { value: TagType.TOPIC, label: "Topic" }
];

const NewEntityPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const { isAuthenticated } = useAuth();
  const api = useAuthApi();
  const [form, setForm] = useState<EntityCreateRequest>({
    type: EntityType.ISSUE,
    title: "",
    description: "",
    start_time: null,
    end_time: null,
    images: [],
    tags: []
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newTag, setNewTag] = useState<{ name: string; tag_type: TagType }>({ name: "", tag_type: TagType.TOPIC });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, type: Number(e.target.value) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve((reader.result as string).split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Convert files to base64 strings
      const images: Array<string> = await Promise.all(
        selectedFiles.map(file => fileToBase64(file))
      );
      const payload = { ...form, images };
      await createEntity(api, payload);
      setSuccess(true);
      setForm({
        type: EntityType.ISSUE,
        title: "",
        description: "",
        start_time: null,
        end_time: null,
        images: [],
        tags: []
      });
      setSelectedFiles([]);
    } catch (err: any) {
      setError(err?.message || "Failed to create entity");
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (idx: number, field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.map((tag, i) =>
        i === idx ? { ...tag, [field]: value } : tag
      )
    }));
  };

  const handleAddTag = () => {
    if (newTag.name.trim()) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, { ...newTag }] }));
      setNewTag({ name: "", tag_type: TagType.TOPIC });
    }
  };

  const handleRemoveTag = (idx: number) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="p-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Create New Entity</h1>
      <form className="max-w-lg" onSubmit={handleSubmit}>
        <label className="block mb-2 font-semibold">Type</label>
        <select name="type" value={form.type} onChange={handleTypeChange} className="mb-4 p-2 border rounded w-full">
          <option value={EntityType.ISSUE}>Issue</option>
          <option value={EntityType.EVENT}>Event</option>
          {/* <option value={EntityType.LEGISLATION}>Legislation</option> */}
          {/* <option value={EntityType.QUOTE}>Quote</option> */}
        </select>
        <label className="block mb-2 font-semibold">Title</label>
        <input name="title" value={form.title} onChange={handleChange} className="mb-4 p-2 border rounded w-full" required />
        <label className="block mb-2 font-semibold">Description</label>
        <textarea name="description" value={form.description ?? ""} onChange={handleChange} className="mb-4 p-2 border rounded w-full" />
        {form.type === EntityType.EVENT && (
          <>
            <label className="block mb-2 font-semibold">Start Time</label>
            <input name="start_time" value={form.start_time ?? ""} onChange={handleChange} className="mb-4 p-2 border rounded w-full" type="datetime-local" />
            <label className="block mb-2 font-semibold">End Time</label>
            <input name="end_time" value={form.end_time ?? ""} onChange={handleChange} className="mb-4 p-2 border rounded w-full" type="datetime-local" />
          </>
        )}
        <label className="block mb-2 font-semibold">Images</label>
        <div
          className={`mb-4 p-4 border-2 rounded w-full flex flex-col items-center justify-center transition ${dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 bg-white"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="mb-2" />
          <span className="text-gray-500 text-sm">Drag and drop images here, or click to select</span>
          {selectedFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedFiles.map((file, idx) => (
                <span key={idx} className="px-2 py-1 bg-purple-100 rounded text-xs text-purple-700">{file.name}</span>
              ))}
            </div>
          )}
        </div>
        <label className="block mb-2 font-semibold">Tags</label>
        <div className="mb-4">
          {form.tags.map((tag, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tag.name}
                onChange={e => handleTagChange(idx, "name", e.target.value)}
                placeholder="Tag name"
                className="p-2 border rounded w-1/2"
              />
              <select
                value={tag.tag_type}
                onChange={e => handleTagChange(idx, "tag_type", Number(e.target.value))}
                className="p-2 border rounded w-1/3"
              >
                {tagTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button type="button" onClick={() => handleRemoveTag(idx)} className="px-2 py-1 bg-red-100 text-red-700 rounded">Remove</button>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newTag.name}
              onChange={e => setNewTag(nt => ({ ...nt, name: e.target.value }))}
              placeholder="New tag name"
              className="p-2 border rounded w-1/2"
            />
            <select
              value={newTag.tag_type}
              onChange={e => setNewTag(nt => ({ ...nt, tag_type: Number(e.target.value) }))}
              className="p-2 border rounded w-1/3"
            >
              {tagTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button type="button" onClick={handleAddTag} className="px-2 py-1 bg-green-100 text-green-700 rounded">Add Tag</button>
          </div>
        </div>
        <button type="submit" className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition" disabled={loading}>
          {loading ? "Creating..." : "+ Create Entity"}
        </button>
        {error && <div className="mt-4 text-red-600">{error}</div>}
        {success && <div className="mt-4 text-green-600">Entity created successfully!</div>}
      </form>
    </div>
  );
};

export default NewEntityPage;
