import React from 'react';
import { ContentBlock, BlockType } from '../types';
import { Plus, Trash2, MoveUp, MoveDown, Type, AlignLeft, Image as ImageIcon, Link as LinkIcon, FileText, Layout } from 'lucide-react';
import ReactQuill from 'react-quill-new';

interface EditorProps {
  content: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
}

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

export default function Editor({ content, onChange }: EditorProps) {
  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substring(2, 11),
      type,
      text: '',
      level: 2,
      url: '',
      caption: '',
      title: '',
      html: '',
      footerText: '',
      footerImage: '',
      footerLink: ''
    };
    onChange([...content, newBlock]);
  };

  const removeBlock = (id: string) => {
    onChange(content.filter(block => block.id !== id));
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(content.map(block => block.id === id ? { ...block, ...updates } : block));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newContent = [...content];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newContent.length) return;
    
    [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
    onChange(newContent);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {content.map((block, index) => (
          <div key={block.id} className="group relative bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                type="button"
                onClick={() => moveBlock(index, 'up')}
                disabled={index === 0}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-30"
              >
                <MoveUp size={16} />
              </button>
              <button 
                type="button"
                onClick={() => moveBlock(index, 'down')}
                disabled={index === content.length - 1}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-30"
              >
                <MoveDown size={16} />
              </button>
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-600">
                {block.type === 'heading' && <Type size={14} />}
                {block.type === 'paragraph' && <AlignLeft size={14} />}
                {block.type === 'image' && <ImageIcon size={14} />}
                {block.type === 'interlink' && <LinkIcon size={14} />}
                {block.type === 'rich-text' && <FileText size={14} />}
                {block.type === 'footer' && <Layout size={14} />}
                {block.type}
              </div>
              <button 
                type="button"
                onClick={() => removeBlock(block.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {block.type === 'heading' && (
              <div className="flex gap-4">
                <select 
                  value={block.level} 
                  onChange={(e) => updateBlock(block.id, { level: parseInt(e.target.value) as 2 | 3 })}
                  className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm font-bold outline-none"
                >
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                </select>
                <input 
                  type="text"
                  value={block.text}
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder="Enter heading..."
                  className="flex-1 bg-transparent border-b border-gray-100 focus:border-orange-500 outline-none py-2 text-xl font-serif"
                />
              </div>
            )}

            {block.type === 'paragraph' && (
              <textarea 
                value={block.text}
                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                placeholder="Write your paragraph..."
                className="w-full bg-transparent border-none outline-none py-2 text-lg leading-relaxed min-h-[100px] resize-none"
              />
            )}

            {block.type === 'image' && (
              <div className="space-y-4">
                <input 
                  type="url"
                  value={block.url}
                  onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                  placeholder="Image URL (Unsplash, etc.)"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none"
                />
                <input 
                  type="text"
                  value={block.caption}
                  onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                  placeholder="Image caption (optional)"
                  className="w-full bg-transparent border-b border-gray-100 px-4 py-2 text-sm italic outline-none"
                />
                {block.url && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100">
                    <img src={block.url} alt="Preview" className="w-full max-h-[300px] object-cover" />
                  </div>
                )}
              </div>
            )}

            {block.type === 'interlink' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text"
                  value={block.title}
                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                  placeholder="Link Title"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none"
                />
                <input 
                  type="url"
                  value={block.url}
                  onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                  placeholder="Link URL"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>
            )}

            {block.type === 'rich-text' && (
              <div className="quill-container">
                <ReactQuill 
                  theme="snow"
                  value={block.html}
                  onChange={(html) => updateBlock(block.id, { html })}
                  modules={quillModules}
                  className="bg-white rounded-xl overflow-hidden min-h-[200px]"
                />
              </div>
            )}

            {block.type === 'footer' && (
              <div className="space-y-4">
                <textarea 
                  value={block.footerText}
                  onChange={(e) => updateBlock(block.id, { footerText: e.target.value })}
                  placeholder="Footer text..."
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none min-h-[80px]"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="url"
                    value={block.footerImage}
                    onChange={(e) => updateBlock(block.id, { footerImage: e.target.value })}
                    placeholder="Footer Image URL"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none"
                  />
                  <input 
                    type="url"
                    value={block.footerLink}
                    onChange={(e) => updateBlock(block.id, { footerLink: e.target.value })}
                    placeholder="Footer Link URL"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
        <button type="button" onClick={() => addBlock('heading')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm">
          <Type size={14} /> Heading
        </button>
        <button type="button" onClick={() => addBlock('paragraph')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm">
          <AlignLeft size={14} /> Paragraph
        </button>
        <button type="button" onClick={() => addBlock('image')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm">
          <ImageIcon size={14} /> Image
        </button>
        <button type="button" onClick={() => addBlock('interlink')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm">
          <LinkIcon size={14} /> Interlink
        </button>
        <button type="button" onClick={() => addBlock('rich-text')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm">
          <FileText size={14} /> Rich Text
        </button>
        <button type="button" onClick={() => addBlock('footer')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm">
          <Layout size={14} /> Footer
        </button>
      </div>
    </div>
  );
}
