import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experienceService, companyService } from '../../services';
import { mockExperiences, mockCompanies } from '../../services/mockData';
import CoordinatorLayout from '../../layouts/CoordinatorLayout';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Plus, Edit, Trash2, Eye, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const isDemo = () => localStorage.getItem('demoMode') === 'true';

const YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => String(YEAR + 1 - i));

export default function ManageExperiences() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);

  const [companySelect, setCompanySelect] = useState('');
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [roleOffered, setRoleOffered] = useState('');
  const [batchYear, setBatchYear] = useState(String(YEAR));
  const [title, setTitle] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  const [interviewRounds, setInterviewRounds] = useState('');
  const [experience, setExperience] = useState('');
  const [preparationTips, setPreparationTips] = useState('');
  const [resourcesLinks, setResourcesLinks] = useState('');

  const qc = useQueryClient();

  // Fetch experiences
  const { data, isLoading } = useQuery({
    queryKey: ['experiences-admin', page],
    queryFn: isDemo()
      ? () => {
          const list = mockExperiences;
          const limit = 10;
          const offset = (page - 1) * limit;
          const paginated = list.slice(offset, offset + limit);
          return Promise.resolve({
            data: paginated,
            pagination: {
              total: list.length,
              totalPages: Math.ceil(list.length / limit),
            }
          });
        }
      : () => experienceService.getAllAdmin({ page, limit: 10 }).then(r => r.data),
  });

  // Fetch active companies for the select dropdown
  const { data: companiesData } = useQuery({
    queryKey: ['companies-all'],
    queryFn: isDemo()
      ? () => Promise.resolve({ data: mockCompanies })
      : () => companyService.getAll({ page: 1, limit: 100 }).then(r => r.data),
  });

  const companiesList = companiesData?.data || [];

  // Create Experience mutation
  const createMut = useMutation({
    mutationFn: (newExp) => {
      if (isDemo()) {
        const mockNew = {
          id: 'mock-' + Date.now(),
          student_name: 'Placement Cell',
          created_at: new Date().toISOString(),
          status: 'approved',
          company_id: newExp.companyId,
          company_name: newExp.companyName,
          role_offered: newExp.roleOffered,
          batch_year: newExp.batchYear,
          title: newExp.title,
          difficulty_level: newExp.difficultyLevel,
          interview_rounds: newExp.interviewRounds,
          experience: newExp.experience,
          preparation_tips: newExp.preparationTips,
          resources_links: newExp.resourcesLinks,
        };
        mockExperiences.unshift(mockNew);
        return Promise.resolve(mockNew);
      }
      return experienceService.submit(newExp);
    },
    onSuccess: () => {
      qc.invalidateQueries(['experiences-admin']);
      toast.success('Experience published successfully!');
      setFormOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to publish experience');
    }
  });

  // Update Experience mutation
  const updateMut = useMutation({
    mutationFn: ({ id, updatedExp }) => {
      if (isDemo()) {
        const index = mockExperiences.findIndex(e => e.id === id);
        if (index !== -1) {
          mockExperiences[index] = {
            ...mockExperiences[index],
            company_id: updatedExp.companyId,
            company_name: updatedExp.companyName,
            role_offered: updatedExp.roleOffered,
            batch_year: updatedExp.batchYear,
            title: updatedExp.title,
            difficulty_level: updatedExp.difficultyLevel,
            interview_rounds: updatedExp.interviewRounds,
            experience: updatedExp.experience,
            preparation_tips: updatedExp.preparationTips,
            resources_links: updatedExp.resourcesLinks,
          };
        }
        return Promise.resolve(mockExperiences[index]);
      }
      return experienceService.update(id, updatedExp);
    },
    onSuccess: () => {
      qc.invalidateQueries(['experiences-admin']);
      toast.success('Experience updated successfully!');
      setFormOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update experience');
    }
  });

  // Delete Experience mutation
  const deleteMut = useMutation({
    mutationFn: (id) => {
      if (isDemo()) {
        const index = mockExperiences.findIndex(e => e.id === id);
        if (index !== -1) {
          mockExperiences.splice(index, 1);
        }
        return Promise.resolve(id);
      }
      return experienceService.delete(id);
    },
    onSuccess: () => {
      qc.invalidateQueries(['experiences-admin']);
      toast.success('Experience deleted successfully');
      setDeleteModal(null);
    },
    onError: () => {
      toast.error('Failed to delete experience');
    }
  });

  const handleOpenAdd = () => {
    setFormMode('add');
    setEditingId(null);
    setCompanySelect('');
    setCustomCompanyName('');
    setRoleOffered('');
    setBatchYear(String(YEAR));
    setTitle('');
    setDifficultyLevel('Medium');
    setInterviewRounds('');
    setExperience('');
    setPreparationTips('');
    setResourcesLinks('');
    setFormOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setFormMode('edit');
    setEditingId(exp.id);
    
    // Check if company is in our companiesList
    const matchingCompany = companiesList.find(c => c.name.toLowerCase() === exp.company_name.toLowerCase());
    if (matchingCompany) {
      setCompanySelect(matchingCompany.id);
      setCustomCompanyName('');
    } else {
      setCompanySelect('other');
      setCustomCompanyName(exp.company_name);
    }
    
    setRoleOffered(exp.role_offered || '');
    setBatchYear(exp.batch_year ? String(exp.batch_year) : String(YEAR));
    setTitle(exp.title || '');
    setDifficultyLevel(exp.difficulty_level || 'Medium');
    setInterviewRounds(exp.interview_rounds || '');
    setExperience(exp.experience || '');
    setPreparationTips(exp.preparation_tips || '');
    setResourcesLinks(exp.resources_links || '');
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!companySelect) {
      toast.error('Please select a company');
      return;
    }
    if (companySelect === 'other' && !customCompanyName.trim()) {
      toast.error('Please enter a custom company name');
      return;
    }
    if (!roleOffered.trim()) {
      toast.error('Please enter the role offered');
      return;
    }
    if (!batchYear) {
      toast.error('Please select the batch year');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter an experience title');
      return;
    }
    if (!interviewRounds.trim()) {
      toast.error('Please enter the interview rounds');
      return;
    }
    if (!experience.trim()) {
      toast.error('Please enter the experience content');
      return;
    }

    const selectedCompany = companiesList.find(c => c.id === companySelect);
    const finalCompanyId = selectedCompany ? selectedCompany.id : null;
    const finalCompanyName = selectedCompany ? selectedCompany.name : customCompanyName.trim();

    const payload = {
      companyId: finalCompanyId,
      companyName: finalCompanyName,
      roleOffered: roleOffered.trim(),
      batchYear: parseInt(batchYear),
      title: title.trim(),
      difficultyLevel,
      interviewRounds: interviewRounds.trim(),
      experience: experience.trim(),
      preparationTips: preparationTips.trim() || null,
      resourcesLinks: resourcesLinks.trim() || null,
    };

    if (formMode === 'add') {
      createMut.mutate(payload);
    } else {
      updateMut.mutate({ id: editingId, updatedExp: payload });
    }
  };

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'Medium').toLowerCase();
    if (d === 'easy') return { label: 'Easy', bg: 'rgba(34, 197, 94, 0.15)', color: '#10b981' };
    if (d === 'hard') return { label: 'Hard', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
    return { label: 'Medium', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
  };

  return (
    <CoordinatorLayout title="Experience Library">
      {/* Header Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Curate and publish interview experiences for students before placement drives.
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Experience
        </button>
      </div>

      {/* Main Table Card */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Batch Year</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5}><SkeletonLoader rows={5} cols={5} /></td></tr>
            ) : (data?.data || []).length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No interview experiences found in the library. Click 'Add Experience' to create one.
                </td>
              </tr>
            ) : (
              (data?.data || []).map(exp => {
                const diffBadge = getDifficultyBadge(exp.difficulty_level);
                return (
                  <tr key={exp.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exp.company_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{exp.title}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{exp.role_offered || 'SDE'}</div>
                      <div style={{ marginTop: 2 }}>
                        <span style={{ fontSize: 10, background: diffBadge.bg, color: diffBadge.color, padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>
                          {diffBadge.label}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{exp.batch_year}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {exp.created_at ? format(new Date(exp.created_at), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelected(exp)} title="View Details">
                          <Eye size={13} /> View
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(exp)} title="Edit Experience">
                          <Edit size={13} /> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(exp)} title="Delete Experience">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />

      {/* View Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.company_name} — ${selected.title}` : ''}
        footer={
          <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-muted">Batch {selected.batch_year}</span>
              <span className="badge badge-muted">{selected.role_offered || 'Software Engineer'}</span>
              <span style={{
                fontSize: 12,
                background: getDifficultyBadge(selected.difficulty_level).bg,
                color: getDifficultyBadge(selected.difficulty_level).color,
                padding: '4px 10px',
                borderRadius: 20,
                fontWeight: 600
              }}>
                {getDifficultyBadge(selected.difficulty_level).label}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>📋 INTERVIEW ROUNDS</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {selected.interview_rounds}
              </p>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>📝 EXPERIENCE CONTENT</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {selected.experience}
              </p>
            </div>

            {selected.preparation_tips && (
              <div style={{ padding: 14, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>💡 PREPARATION TIPS</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {selected.preparation_tips}
                </p>
              </div>
            )}

            {selected.resources_links && (
              <div style={{ padding: 14, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LinkIcon size={13} />
                  <span>RESOURCES & HELPFUL LINKS</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.resources_links.split(',').map((link, idx) => {
                    const cleanLink = link.trim();
                    if (!cleanLink) return null;
                    const isUrl = cleanLink.startsWith('http');
                    return (
                      <div key={idx}>
                        {isUrl ? (
                          <a href={cleanLink} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'underline', wordBreak: 'break-all' }}>
                            {cleanLink}
                          </a>
                        ) : (
                          <span>{cleanLink}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Experience"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => deleteMut.mutate(deleteModal.id)} disabled={deleteMut.isLoading}>
              Delete
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete the experience title <strong style={{ color: 'var(--text-primary)' }}>"{deleteModal?.title}"</strong> for <strong style={{ color: 'var(--text-primary)' }}>{deleteModal?.company_name}</strong>?
        </p>
        <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>This action is permanent and cannot be undone.</p>
      </Modal>

      {/* Add / Edit Modal Form */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={formMode === 'add' ? 'Add Interview Experience' : 'Edit Interview Experience'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={createMut.isLoading || updateMut.isLoading}>
              {formMode === 'add' ? 'Publish Experience' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Company Selection */}
          <div className="form-group">
            <label className="label">Company *</label>
            <select
              className="input"
              value={companySelect}
              onChange={(e) => setCompanySelect(e.target.value)}
              required
            >
              <option value="">-- Select Company --</option>
              {companiesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="other">Other (Custom Name)</option>
            </select>
          </div>

          {companySelect === 'other' && (
            <div className="form-group" style={{ marginTop: -8 }}>
              <label className="label">Custom Company Name *</label>
              <input
                type="text"
                className="input"
                placeholder="Enter company name"
                value={customCompanyName}
                onChange={(e) => setCustomCompanyName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Role Offered & Batch Year */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="label">Role Offered *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Software Engineer, SDE-1"
                value={roleOffered}
                onChange={(e) => setRoleOffered(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Batch Year *</label>
              <select
                className="input"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                required
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Difficulty Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="label">Experience Title *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Google SDE-1 Interview Experience 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Difficulty Level</label>
              <select
                className="input"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Interview Rounds */}
          <div className="form-group">
            <label className="label">Interview Rounds *</label>
            <textarea
              className="input"
              rows={2}
              placeholder="e.g. Coding Test -> Technical Round -> Bar Raiser -> HR"
              value={interviewRounds}
              onChange={(e) => setInterviewRounds(e.target.value)}
              style={{ minHeight: 60, resize: 'vertical' }}
              required
            />
          </div>

          {/* Experience Content */}
          <div className="form-group">
            <label className="label">Experience Content *</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Describe the detailed interview experience, questions asked, and layout of rounds..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              style={{ minHeight: 100, resize: 'vertical' }}
              required
            />
          </div>

          {/* Preparation Tips */}
          <div className="form-group">
            <label className="label">Preparation Tips *</label>
            <textarea
              className="input"
              rows={3}
              placeholder="What should students focus on? Useful study resources or key topics to prepare?"
              value={preparationTips}
              onChange={(e) => setPreparationTips(e.target.value)}
              style={{ minHeight: 80, resize: 'vertical' }}
              required
            />
          </div>

          {/* Resources & Links */}
          <div className="form-group">
            <label className="label">Resources / Links (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="Provide comma-separated URLs or descriptions, e.g., https://leetcode.com, https://geeksforgeeks.org"
              value={resourcesLinks}
              onChange={(e) => setResourcesLinks(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </CoordinatorLayout>
  );
}
