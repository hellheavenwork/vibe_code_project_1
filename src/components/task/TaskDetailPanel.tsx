import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Calendar, UserCircle, Flag, Palette, ImageIcon,
  MessageSquare, Send, Trash2, Plus, Tag, Upload,
} from 'lucide-react';
import { Task, Comment } from '../../types';
import { updateTask } from '../../api/tasks';
import { getComments, addComment, deleteComment } from '../../api/comments';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

// ─── Image storage (localStorage) ────────────────────────────────────────────
const imgKey = (id: string) => `taskflow_images_${id}`;
const loadImages = (id: string): string[] => {
  try { return JSON.parse(localStorage.getItem(imgKey(id)) || '[]'); }
  catch { return []; }
};
const saveImages = (id: string, imgs: string[]) =>
  localStorage.setItem(imgKey(id), JSON.stringify(imgs));

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = [
  { name: 'blue',   cls: 'bg-blue-500' },
  { name: 'green',  cls: 'bg-green-500' },
  { name: 'purple', cls: 'bg-purple-500' },
  { name: 'orange', cls: 'bg-orange-500' },
  { name: 'red',    cls: 'bg-red-500' },
  { name: 'pink',   cls: 'bg-pink-500' },
  { name: 'yellow', cls: 'bg-yellow-400' },
  { name: 'teal',   cls: 'bg-teal-500' },
];

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500',
  orange: 'bg-orange-500', red: 'bg-red-500', pink: 'bg-pink-500',
  yellow: 'bg-yellow-400', teal: 'bg-teal-500',
};

const PRIORITY_ACTIVE: Record<string, string> = {
  Low:    'bg-green-100 text-green-700 border-green-300',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  High:   'bg-red-100 text-red-700 border-red-300',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Task) => void;
  onDelete: (taskId: string) => void;
  projectMembers: string[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export const TaskDetailPanel: React.FC<Props> = ({
  task, isOpen, onClose, onUpdate, onDelete, projectMembers,
}) => {
  const { currentUser, users } = useApp();

  // local state, seeded from task prop
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority]     = useState<Task['priority']>('Medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate]       = useState('');
  const [color, setColor]           = useState('blue');
  const [tags, setTags]             = useState<string[]>([]);
  const [newTag, setNewTag]         = useState('');
  const [images, setImages]         = useState<string[]>([]);
  const [comments, setComments]     = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending]       = useState(false);

  const fileRef    = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // sync state whenever the task changes
  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setAssigneeId(task.assigneeId);
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    setColor(task.color ?? 'blue');
    setTags(task.tags ?? []);
    setImages(loadImages(task.id));
    setComments([]);
  }, [task?.id]);

  // load comments when panel opens
  useEffect(() => {
    if (!isOpen || !task) return;
    getComments(task.id).then(setComments).catch(console.error);
  }, [isOpen, task?.id]);

  if (!task) return null;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const save = async (fields: Partial<Task>) => {
    try {
      const updated = await updateTask(task.id, fields);
      onUpdate(updated);
    } catch (err) { console.error(err); }
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) save({ title: title.trim() });
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) save({ description });
  };

  const handlePriority = (p: Task['priority']) => {
    setPriority(p);
    save({ priority: p });
  };

  const handleAssignee = (id: string) => {
    setAssigneeId(id);
    save({ assigneeId: id });
  };

  const handleDueDate = (d: string) => {
    setDueDate(d);
    if (d) save({ dueDate: new Date(d).toISOString() });
  };

  const handleColor = (c: string) => {
    setColor(c);
    save({ color: c });
  };

  const handleAddTag = () => {
    const t = newTag.trim();
    if (!t || tags.includes(t)) return;
    const next = [...tags, t];
    setTags(next);
    setNewTag('');
    save({ tags: next });
  };

  const handleRemoveTag = (t: string) => {
    const next = tags.filter(x => x !== t);
    setTags(next);
    save({ tags: next });
  };

  // ── Images ──────────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const url = ev.target?.result as string;
        setImages(prev => {
          const next = [...prev, url];
          saveImages(task.id, next);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      saveImages(task.id, next);
      return next;
    });
  };

  // ── Comments ─────────────────────────────────────────────────────────────
  const handleSendComment = async () => {
    const txt = commentText.trim();
    if (!txt) return;
    setSending(true);
    try {
      const c = await addComment(task.id, txt);
      setComments(prev => [...prev, c]);
      setCommentText('');
      onUpdate({ ...task, commentsCount: task.commentsCount + 1 });
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const handleDeleteComment = async (cId: string) => {
    try {
      await deleteComment(task.id, cId);
      setComments(prev => prev.filter(c => c.id !== cId));
      onUpdate({ ...task, commentsCount: Math.max(0, task.commentsCount - 1) });
    } catch (err) { console.error(err); }
  };

  const colorBar = COLOR_MAP[color] ?? 'bg-blue-500';

  // ── Render ────────────────────────────────────────────────────────────────
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-[500px] max-w-full flex-col bg-white shadow-2xl dark:bg-zinc-900"
          >
            {/* color bar at top */}
            <div className={cn('h-1 w-full shrink-0', colorBar)} />

            {/* header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className={cn('h-3 w-3 rounded-full', colorBar)} />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                  Task Detail
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(task.id); onClose(); }}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 cursor-pointer dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer dark:hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-5">

                {/* ── Title ── */}
                <input
                  className="w-full bg-transparent text-xl font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:rounded-lg focus:bg-gray-50 focus:px-2 focus:py-1 dark:text-zinc-100 dark:focus:bg-zinc-800"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  placeholder="Task title…"
                />

                {/* ── Meta grid ── */}
                <div className="grid grid-cols-2 gap-4">

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                      <Flag className="h-3 w-3" /> Priority
                    </label>
                    <div className="flex gap-1">
                      {(['Low', 'Medium', 'High'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => handlePriority(p)}
                          className={cn(
                            'flex-1 rounded-md border py-1 text-[11px] font-semibold transition-all cursor-pointer',
                            priority === p
                              ? PRIORITY_ACTIVE[p]
                              : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700'
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Due date */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                      <Calendar className="h-3 w-3" /> Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => handleDueDate(e.target.value)}
                      className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    />
                  </div>

                  {/* Assignee */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                      <UserCircle className="h-3 w-3" /> Assignee
                    </label>
                    <select
                      value={assigneeId}
                      onChange={e => handleAssignee(e.target.value)}
                      className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-400 focus:outline-none cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {projectMembers.map(mId => {
                        const m = users.find(u => u.id === mId);
                        return <option key={mId} value={mId}>{m?.name ?? mId}</option>;
                      })}
                    </select>
                  </div>

                  {/* Color */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                      <Palette className="h-3 w-3" /> Color
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COLORS.map(c => (
                        <button
                          key={c.name}
                          onClick={() => handleColor(c.name)}
                          className={cn(
                            'h-6 w-6 rounded-full transition-all hover:scale-110 cursor-pointer',
                            c.cls,
                            color === c.name ? 'ring-2 ring-blue-500 ring-offset-1 opacity-100' : 'opacity-60 hover:opacity-100'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Tags ── */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                    <Tag className="h-3 w-3" /> Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(t => (
                      <span key={t} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {t}
                        <button onClick={() => handleRemoveTag(t)} className="cursor-pointer text-blue-400 hover:text-blue-700">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                        placeholder="Add tag…"
                        className="w-20 rounded-full border border-dashed border-gray-300 bg-transparent px-2.5 py-0.5 text-xs text-gray-500 focus:border-blue-400 focus:outline-none dark:border-zinc-600 dark:text-zinc-400"
                      />
                      <button onClick={handleAddTag} className="cursor-pointer text-blue-500 hover:text-blue-700">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Description ── */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    onBlur={handleDescriptionBlur}
                    placeholder="Add a description…"
                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:focus:bg-zinc-900"
                  />
                </div>

                {/* ── Attachments ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                      <ImageIcon className="h-3 w-3" /> Attachments
                      {images.length > 0 && (
                        <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-zinc-700 dark:text-zinc-400">
                          {images.length}
                        </span>
                      )}
                    </label>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 cursor-pointer dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
                      <Upload className="h-3 w-3" /> Upload
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </div>

                  {images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((src, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700">
                          <img src={src} alt="" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleRemoveImage(i)}
                              className="rounded-full bg-white p-1.5 text-red-500 shadow hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-6 text-gray-400 transition-colors hover:border-blue-300 hover:text-blue-500 cursor-pointer dark:border-zinc-700 dark:hover:border-blue-800"
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-xs">Click to upload images</span>
                    </button>
                  )}
                </div>

                {/* ── Comments ── */}
                <div className="space-y-3">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                    <MessageSquare className="h-3 w-3" /> Comments
                    {comments.length > 0 && (
                      <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {comments.length}
                      </span>
                    )}
                  </label>

                  {/* comment list */}
                  <div className="space-y-3">
                    {comments.length === 0 && (
                      <p className="py-4 text-center text-xs text-gray-400 dark:text-zinc-600">No comments yet</p>
                    )}
                    {comments.map(c => {
                      const author = users.find(u => u.id === c.authorId);
                      const isOwn  = c.authorId === currentUser?.id;
                      return (
                        <div key={c.id} className="flex gap-3">
                          <img
                            src={author?.avatarUrl}
                            alt={author?.name}
                            className="h-8 w-8 shrink-0 rounded-full border border-gray-100 bg-gray-100 dark:border-zinc-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-gray-800 dark:text-zinc-300">{author?.name}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-gray-400">
                                  {new Date(c.createdAt).toLocaleDateString('th-TH', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                  })}
                                </span>
                                {isOwn && (
                                  <button
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="text-gray-300 transition-colors hover:text-red-400 cursor-pointer dark:text-zinc-700 dark:hover:text-red-400"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="mt-1 rounded-xl rounded-tl-none bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {c.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* add comment */}
                  <div className="flex gap-2.5 border-t border-gray-100 pt-3 dark:border-zinc-800">
                    <img
                      src={currentUser?.avatarUrl}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full border border-gray-100 bg-gray-100 dark:border-zinc-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-1 items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800">
                      <textarea
                        ref={commentRef}
                        rows={1}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); }
                        }}
                        placeholder="Write a comment… (Enter to send)"
                        className="flex-1 resize-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-zinc-300 dark:placeholder:text-zinc-600"
                        style={{ minHeight: '20px', maxHeight: '80px' }}
                      />
                      <button
                        onClick={handleSendComment}
                        disabled={!commentText.trim() || sending}
                        className="shrink-0 rounded-lg bg-blue-600 p-1.5 text-white transition-colors hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
