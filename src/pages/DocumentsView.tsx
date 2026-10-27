import React, { useState } from 'react';
import {
  FileText,
  Search,
  UploadCloud,
  X,
  Download,
  Trash2,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { Project, ProjectDocument } from '../types';
import { useAuth } from '../context/AuthContext';

interface DocumentsViewProps {
  project: Project;
  documents: ProjectDocument[];
  onUploadDocument: (doc: ProjectDocument) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  project,
  documents,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('All Files');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Upload modal form state
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<ProjectDocument['category']>('Drawings');
  const [newFileNotes, setNewFileNotes] = useState('');

  const categories = ['All Files', 'Drawings', 'Contracts', 'Correspondence', 'Photos', 'Closeout'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      activeCategory === 'All Files' ||
      doc.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getFileIcon = (name: string, category: string) => {
    if (name.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    if (name.endsWith('.zip') || name.endsWith('.rar')) {
      return <FileArchive className="w-5 h-5 text-amber-500" />;
    }
    if (category === 'Photos' || name.endsWith('.jpg') || name.endsWith('.png')) {
      return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    }
    return <FileCode className="w-5 h-5 text-blue-500" />;
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newDoc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      projectId: project.id,
      name: newFileName.endsWith('.pdf') || newFileName.endsWith('.zip') ? newFileName : `${newFileName}.pdf`,
      category: newFileCategory,
      size: `${(Math.random() * 8 + 1).toFixed(1)} MB`,
      mimeType: newFileName.endsWith('.zip') ? 'application/zip' : 'application/pdf',
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      uploadedBy: currentUser?.displayName || 'Ian Tumulak',
      fileUrl: '#',
      notes: newFileNotes,
    };

    await onUploadDocument(newDoc);
    setNewFileName('');
    setNewFileNotes('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header matching Screenshot 9 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Project Documents
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {project.name} &nbsp;·&nbsp; <span className="font-mono text-slate-700">{project.code}</span>
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Tabs Row matching Screenshot 9: All Files, Drawings, Contracts, Correspondence, Photos, Closeout */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar matching Screenshot 9 */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredDocs.length} of {documents.length} document(s)
        </span>
      </div>

      {/* Documents Table matching Screenshot 9 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Upload Date</th>
              <th className="py-3 px-4">Uploaded By</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No documents found matching the filter.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                        {getFileIcon(doc.name, doc.category)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{doc.name}</p>
                        <p className="text-[10px] text-slate-500">{doc.size} · {doc.notes || 'Official Project Record'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {doc.category}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {doc.uploadDate}
                  </td>

                  <td className="py-3.5 px-4 text-slate-800 font-medium">
                    {doc.uploadedBy}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => alert(`Downloading ${doc.name}`)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Upload Project Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Name / File</label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. Foundation Inspection Certificate.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newFileCategory}
                  onChange={(e) => setNewFileCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Drawings">Drawings</option>
                  <option value="Contracts">Contracts</option>
                  <option value="Correspondence">Correspondence</option>
                  <option value="Photos">Photos</option>
                  <option value="Closeout">Closeout</option>
                  <option value="Reports">Reports</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={newFileNotes}
                  onChange={(e) => setNewFileNotes(e.target.value)}
                  placeholder="Notes regarding engineering revision or signatory..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Upload & Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
