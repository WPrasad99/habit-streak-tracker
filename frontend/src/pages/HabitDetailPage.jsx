// src/pages/HabitDetailPage.jsx — light theme redesign

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function StreakGrid({ checkIns }) {
  const today = new Date();
  const days = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  const checkinSet = new Set((checkIns || []).map(c => c.localDate));
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="streak-grid">
      {days.map((d, i) => {
        const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const isToday = i === 34;
        const done = checkinSet.has(str);
        const cls = isToday ? 'today' : done ? 'done' : 'missed';
        return (
          <div key={str} className="streak-day">
            <span className="streak-day-label">{dayLabels[d.getDay()]}</span>
            <div className={`streak-day-dot ${cls}`}>
              {isToday ? d.getDate() : done ? '✓' : ''}
            </div>
            <span className="streak-day-label" style={{ fontSize: '0.65rem' }}>{d.getDate()}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function HabitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [backfillDate, setBackfillDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchHabit = useCallback(async () => {
    try {
      const { data } = await api.get(`/habits/${id}`);
      setHabit(data);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) navigate('/habits');
      else addToast('Failed to load habit', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, addToast]);

  useEffect(() => { fetchHabit(); }, [fetchHabit]);

  async function handleCheckIn(date) {
    setCheckingIn(true);
    try {
      await api.post(`/habits/${id}/checkins`, date ? { date } : {});
      addToast(date ? `Logged ${date} ✓` : "Today's check-in logged! 🔥", 'success');
      setBackfillDate('');
      await fetchHabit();
    } catch (err) {
      const msg = err.response?.data?.error || 'Check-in failed';
      addToast(msg, err.response?.status === 409 ? 'info' : 'error');
    } finally {
      setCheckingIn(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/habits/${id}`);
      addToast('Habit deleted', 'info');
      navigate('/habits');
    } catch {
      addToast('Failed to delete', 'error');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-page">
        <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        <span>Loading…</span>
      </div>
    );
  }
  if (!habit) return null;

  const habitCreatedDate = habit.createdAt.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: 'var(--space-8)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Back */}
        <Link to="/habits" className="back-link" id="link-back">← Back to Dashboard</Link>

        {/* Header card */}
        <div className="card" style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <div style={{ width: 48, height: 48, background: 'var(--accent-green-lt)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  🌿
                </div>
                <div>
                  <h1 style={{ fontSize: '1.5rem' }}>{habit.name}</h1>
                  {habit.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{habit.description}</p>}
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Since {habitCreatedDate}</p>
            </div>
            <button id="btn-delete-habit" className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
              Delete habit
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
            {[
              { label: 'Current Streak', value: `${habit.currentStreak} days`, icon: '🔥', bg: 'var(--accent-orange-lt)', color: 'var(--accent-orange)' },
              { label: 'Longest Streak', value: `${habit.longestStreak} days`, icon: '🏆', bg: 'var(--accent-blue-lt)', color: 'var(--accent-blue)' },
              { label: 'Total Check-ins', value: `${habit.checkIns.length}`, icon: '📅', bg: 'var(--accent-green-lt)', color: 'var(--accent-green)' },
            ].map(stat => (
              <div key={stat.label} style={{ flex: 1, minWidth: 140, background: stat.bg, borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: stat.color, opacity: 0.75, marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>
                  {stat.icon} {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Streak grid */}
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Last 35 Days</h3>
          <StreakGrid checkIns={habit.checkIns} />
        </div>

        {/* Check-in actions */}
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Log a Check-in</h3>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <button
              id="btn-checkin-today"
              className={`btn ${habit.checkedInToday ? 'btn-success' : 'btn-dark'}`}
              onClick={() => !habit.checkedInToday && handleCheckIn(null)}
              disabled={habit.checkedInToday || checkingIn}
            >
              {checkingIn && !backfillDate
                ? <span className="spinner" />
                : habit.checkedInToday ? '✓ Checked in today' : '🔥 Check in today'}
            </button>

            <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
              <label className="form-label" htmlFor="input-backfill-date">Backfill a past date</label>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <input
                  id="input-backfill-date"
                  className="form-input"
                  type="date"
                  value={backfillDate}
                  min={habitCreatedDate}
                  max={today}
                  onChange={e => setBackfillDate(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  id="btn-backfill-submit"
                  className="btn btn-ghost"
                  disabled={!backfillDate || checkingIn}
                  onClick={() => backfillDate && handleCheckIn(backfillDate)}
                >
                  {checkingIn && backfillDate ? <span className="spinner" /> : 'Log date'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Check-in History</h3>
          {habit.checkIns.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              No check-ins yet — get started above!
            </p>
          ) : (
            <div className="checkin-list">
              {habit.checkIns.map(c => (
                <div key={c.id} className="checkin-item" id={`checkin-${c.id}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className="checkin-dot" />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.localDate}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(c.utcInstant).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} local
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
          <div className="modal" role="dialog" aria-modal="true">
            <h2 className="modal-title">Delete habit?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Permanently delete <strong>{habit.name}</strong> and all its check-ins. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button id="btn-cancel-delete" className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button id="btn-confirm-delete" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="spinner" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
