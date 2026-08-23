// src/pages/HabitsPage.jsx
// Dashboard Redesign: Fully wired with dynamic backend data and restructured layout.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

// ── Icons & SVGs ─────────────────────────────────────────────────────────────
const ICONS = {
  logo: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="4" y1="12" x2="20" y2="4"/><line x1="4" y1="20" x2="20" y2="12"/><line x1="12" y1="20" x2="20" y2="16"/></svg>,
  grid: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  pie: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"></path></svg>,
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  gift: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  refresh: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>,
  arrowUpRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
};

const COLORS = ['#D9F99D', '#A78BFA', '#67E8F9', '#FCA5A5', '#FCD34D', '#A3E635'];

// Helpers
const formatDateStr = (dateObj) => dateObj.toISOString().split('T')[0];

export default function HabitsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    fetchHabits();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  async function fetchHabits() {
    try {
      const { data } = await api.get('/habits');
      setHabits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateHabit(e) {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    setIsCreating(true);
    try {
      await api.post('/habits', { name: newHabitName });
      setShowNewHabitModal(false);
      setNewHabitName('');
      fetchHabits();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  }

  const todayStr = formatDateStr(new Date());
  
  // ── DATA CALCULATIONS ──

  // 1. Daily Progress (Steps equivalent)
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.checkedInToday).length;
  const dailyProgressPercent = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
  
  // SVG Ring calculations (Dasharray = 251)
  const strokeOffset = 251 - (251 * dailyProgressPercent) / 100;

  async function handleCheckIn(habitId) {
    try {
      await api.post(`/habits/${habitId}/checkins`);
      fetchHabits(); // re-fetch to update progress rings and charts
    } catch (err) {
      console.error(err);
    }
  }

  // Dynamic Alerts System
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);

  const alerts = [];
  habits.forEach(habit => {
    if (!habit.checkedInToday) {
      alerts.push({
        id: `pending-${habit.id}`,
        type: 'warning',
        title: 'Pending Habit',
        message: `You haven't completed "${habit.name}" today.`,
        icon: '⚠️'
      });
    }
    if (habit.checkedInToday && habit.currentStreak > 0 && habit.currentStreak % 5 === 0) {
      alerts.push({
        id: `milestone-${habit.id}`,
        type: 'success',
        title: 'Streak Milestone!',
        message: `Incredible! You hit a ${habit.currentStreak}-day streak on "${habit.name}". 🔥`,
        icon: '🎉'
      });
    }
    const hasCheckins = habit.checkIns && habit.checkIns.length > 0;
    const checkedInYesterday = habit.checkIns?.includes(yesterdayStr);
    if (hasCheckins && !checkedInYesterday && !habit.checkedInToday && habit.currentStreak === 0) {
      alerts.push({
        id: `broken-${habit.id}`,
        type: 'danger',
        title: 'Streak Paused',
        message: `You missed "${habit.name}" yesterday. Don't worry, start a new streak today!`,
        icon: '💔'
      });
    }
  });

  // 2. Activity (Water balance equivalent - Last 3 Days)
  const days = [
    { label: '2 Days Ago', offset: 2 },
    { label: 'Yesterday', offset: 1 },
    { label: 'Today', offset: 0 }
  ];
  
  const activityData = days.map(d => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - d.offset);
    const targetStr = formatDateStr(targetDate);
    
    const count = habits.filter(h => h.checkIns?.includes(targetStr)).length;
    const heightPercent = totalHabits > 0 ? (count / totalHabits) * 100 : 0;
    
    return { label: d.label, count, heightPercent };
  });

  // 3. Schedule Scroller (5 days centered on today)
  const scheduleDates = Array.from({length: 6}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 1 + i); // Starts from yesterday
    return d;
  });

  // 4. Barcode logic for All Habits (last 24 days)
  const barcodeDates = Array.from({length: 24}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (23 - i));
    return formatDateStr(d);
  });

  // 5. Github Heatmap Data (Last 52 weeks)
  const heatmapCounts = {};
  let totalYearCheckins = 0;
  habits.forEach(h => {
    h.checkIns?.forEach(dateStr => {
      heatmapCounts[dateStr] = (heatmapCounts[dateStr] || 0) + 1;
      totalYearCheckins++;
    });
  });

  const heatmapDays = [];
  const startOffset = 364; 
  const heatmapStartDate = new Date();
  heatmapStartDate.setDate(heatmapStartDate.getDate() - startOffset);
  const startDay = heatmapStartDate.getDay(); // 0 = Sun

  for (let i = 0; i < startDay; i++) heatmapDays.push(null); // pad start to align Sundays
  for (let i = startOffset; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    heatmapDays.push(d);
  }

  const getHeatmapColor = (count) => {
    if (totalHabits === 0 || count === 0) return '#F1F5F9';
    const percent = count / totalHabits;
    if (percent >= 1) return '#059669'; // Full perfect day!
    if (percent >= 0.5) return '#34D399';
    return '#D1FAE5';
  };

  const monthLabels = [];
  let currentMonth = -1;
  heatmapDays.forEach((d, i) => {
    if (!d) return;
    const colIndex = Math.floor(i / 7);
    const month = d.getMonth();
    if (month !== currentMonth) { 
      // Prevent overlapping labels if months change within 3 columns of each other
      if (monthLabels.length === 0 || colIndex - monthLabels[monthLabels.length - 1].colIndex > 2) {
        monthLabels.push({ label: d.toLocaleString('en-US', { month: 'short' }), colIndex });
      }
      currentMonth = month;
    }
  });

  return (
    <div style={S.page}>
      
      {/* ════ LEFT DARK SIDEBAR ══════════════════════════════════════════════ */}
      <div style={S.sidebarWrapper}>
        <div style={S.sidebar}>
          <div style={{width: 60, height: 60, background: '#111', borderRadius: '0 30px 30px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24}}>
            {ICONS.logo}
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', width: '100%'}}>
            <div style={{color: '#9CA3AF', cursor: 'pointer'}}>{ICONS.grid}</div>
            <div style={{
              width: 52, height: 52, background: '#fff', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginLeft: 8
            }}>
              {ICONS.pie}
            </div>
          </div>

          <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', width: '100%', marginBottom: 24}}>
            <div style={{color: '#9CA3AF', cursor: 'pointer'}}>{ICONS.settings}</div>
            <div onClick={logout} style={{color: '#9CA3AF', cursor: 'pointer'}}>{ICONS.logout}</div>
          </div>
        </div>
      </div>

      {/* ════ MAIN CONTENT ═══════════════════════════════════════════════════ */}
      <div style={S.main}>
        
        {/* GREETING */}
        <div style={{marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h1 style={{margin: '0 0 4px', fontSize: '2.5rem', fontWeight: 400, color: '#111'}}>
              Hello, {user?.name?.split(' ')[0] || user?.username?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
            </h1>
            <p style={{margin: 0, fontSize: '1rem', color: '#6B7280'}}>How are you doing today?</p>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 8}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <span style={{fontSize: '0.9rem', color: '#6B7280', fontWeight: 500}}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              
              <div style={{
                display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 50, padding: '8px 20px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F3F4F6', gap: 12
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, paddingRight: 12, borderRight: '1px solid #E5E7EB'}}>
                  <span style={{fontSize: '0.9rem'}}>📍</span>
                  <span style={{fontSize: '0.85rem', fontWeight: 500, color: '#6B7280', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {user?.timezone ? user.timezone.split('/').pop().replace('_', ' ') : 'Local'}
                  </span>
                </div>
                <span style={{fontSize: '0.95rem', fontWeight: 600, color: '#111'}}>
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            
            <button style={{
              width: 44, height: 44, borderRadius: '50%', background: '#fff', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)', position: 'relative'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <div style={{position: 'absolute', top: 10, right: 10, width: 10, height: 10, background: '#EF4444', borderRadius: '50%', border: '2px solid #fff'}} />
            </button>
          </div>
        </div>

        {/* TOP GRID LAYOUT (Extracted All Habits from here) */}
        {loading ? <p>Loading...</p> : (
          <>
            <div style={S.grid}>
              
              {/* ── TOP LEFT: Steps (Daily Progress) ── */}
              <div style={{...S.card, gridColumn: '1 / 2', gridRow: '1 / 2', display: 'flex', flexDirection: 'column'}}>
                <div style={{position: 'absolute', top: 16, right: 16, ...S.arrowBtn}}>{ICONS.arrowUpRight}</div>
                <h2 style={{margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 500, color: '#111'}}>Daily Progress</h2>
                <p style={{margin: '0 0 24px', fontSize: '0.85rem', color: '#6B7280'}}>Today's completion</p>
                
                <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 160}}>
                  <svg viewBox="0 0 100 100" style={{width: 140, height: 140, transform: 'rotate(-90deg)'}}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#D1FAE5" strokeWidth="8" strokeLinecap="round" strokeDasharray="251" strokeDashoffset={strokeOffset} style={{transition: 'stroke-dashoffset 0.5s ease'}}/>
                  </svg>
                  <div style={{position: 'absolute', textAlign: 'center'}}>
                    <p style={{margin: '0 0 4px', fontSize: '0.75rem', color: '#6B7280'}}>Completed</p>
                    <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 400, color: '#111'}}>{Math.round(dailyProgressPercent)}%</h2>
                  </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6B7280', marginTop: 'auto', borderTop: '1px solid #F3F4F6', paddingTop: 16}}>
                  <span>Plan for today:</span>
                  <span style={{color: '#111', fontWeight: 500}}>{totalHabits} habits</span>
                </div>
              </div>

              {/* ── TOP MIDDLE: Water Balance (Weekly) ── */}
              <div style={{...S.card, gridColumn: '2 / 3', gridRow: '1 / 2', display: 'flex', flexDirection: 'column'}}>
                <div style={{position: 'absolute', top: 16, right: 16, ...S.arrowBtn}}>{ICONS.arrowUpRight}</div>
                <h2 style={{margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 500, color: '#111'}}>Activity</h2>
                <p style={{margin: '0 0 24px', fontSize: '0.85rem', color: '#6B7280'}}>Last 3 Days</p>
                
                <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 16px', minHeight: 160}}>
                  {activityData.map((b, i) => (
                    <div key={b.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                      <div style={{background: '#F1F5F9', padding: '4px 8px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, color: i === 2 ? '#10B981' : '#6B7280'}}>
                        {b.count} done
                      </div>
                      <div style={{width: 48, height: `${Math.max(b.heightPercent, 10)}%`, minHeight: 40, background: i === 2 ? '#D1FAE5' : '#E8F3EE', borderRadius: '24px 24px 0 0', transition: 'height 0.5s ease'}} />
                      <span style={{fontSize: '0.75rem', color: '#9CA3AF'}}>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT COLUMN: Schedule ── */}
              <div style={{...S.card, gridColumn: '3 / 4', gridRow: '1 / 2', alignSelf: 'start', display: 'flex', flexDirection: 'column'}}>
                <div style={{position: 'absolute', top: 16, right: 16, ...S.arrowBtn}}>{ICONS.arrowUpRight}</div>
                <h2 style={{margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 500, color: '#111'}}>Schedule</h2>
                <p style={{margin: '0 0 24px', fontSize: '0.85rem', color: '#6B7280'}}>
                  {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'short' })}
                </p>
                
                {/* Dynamic Date Scroller */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #F3F4F6'}}>
                  {scheduleDates.map(d => {
                    const isToday = formatDateStr(d) === todayStr;
                    return (
                      <div key={d.toString()} style={{textAlign: 'center', opacity: isToday ? 1 : 0.3}}>
                        <div style={{fontSize: isToday ? '2rem' : '1.5rem', fontWeight: 400, color: '#111'}}>{d.getDate()}</div>
                        <div style={{fontSize: '0.75rem', color: '#6B7280', textTransform: 'lowercase'}}>{d.toLocaleDateString('en-US', {weekday: 'short'})}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Time Blocks */}
                <div style={{display: 'flex', flexDirection: 'column', gap: 24, flex: 1, paddingRight: 8}}>
                  {habits.length === 0 && <p style={{color: '#9CA3AF', fontSize: '0.85rem'}}>No habits scheduled.</p>}
                  {habits.slice(0, 4).map((h, i) => (
                    <div key={h.id} style={{display: 'flex', alignItems: 'center', gap: 16}}>
                      <span style={{fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 500, width: 56, textAlign: 'right'}}>{8 + i * 2}:00am</span>
                      <div style={{flex: 1, background: i % 2 === 0 ? '#EEF5F1' : '#2D2D2D', borderRadius: 40, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                          <h4 style={{margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 500, color: i % 2 === 0 ? '#111' : '#fff'}}>{h.name}</h4>
                          <p style={{margin: 0, fontSize: '0.75rem', color: i % 2 === 0 ? '#6B7280' : '#9CA3AF'}}>Scheduled Event</p>
                        </div>
                        <div style={{...S.arrowBtn, width: 28, height: 28, background: '#fff', border: 'none'}}>{ICONS.arrowUpRight}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── BOTTOM ROW: 70/30 SPLIT ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 24, marginBottom: 40 }}>
              
              {/* ── LEFT: Interactive Checklist (70%) ── */}
              <div style={{...S.card, minHeight: 'auto', marginBottom: 0}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32}}>
                  <div>
                    <h2 style={{margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 500, color: '#111'}}>Today's Habits</h2>
                    <p style={{margin: 0, fontSize: '0.85rem', color: '#6B7280'}}>Mark your habits as done for today</p>
                  </div>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                  {habits.length === 0 && <p style={{color: '#9CA3AF'}}>You have no habits yet. Click "New +" on the right.</p>}
                  {habits.map((habit) => {
                    const isChecked = habit.checkedInToday;
                    return (
                      <div key={habit.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: isChecked ? '#F8FAF9' : '#fff', border: '1px solid #E5E7EB', borderRadius: 20, transition: 'all 0.2s'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
                          <button 
                            onClick={() => !isChecked && handleCheckIn(habit.id)}
                            disabled={isChecked}
                            style={{
                              width: 36, height: 36, borderRadius: '50%', border: isChecked ? 'none' : '2px solid #D1D5DB', 
                              background: isChecked ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: isChecked ? 'default' : 'pointer', transition: 'all 0.2s', boxShadow: isChecked ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none'
                            }}
                          >
                            {isChecked && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </button>
                          <div>
                            <h4 style={{margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 500, color: isChecked ? '#9CA3AF' : '#111', textDecoration: isChecked ? 'line-through' : 'none', transition: 'all 0.2s'}}>{habit.name}</h4>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                              <span style={{fontSize: '0.85rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4}}>
                                <span style={{color: '#F59E0B'}}>🔥</span> {habit.currentStreak || 0} Day Streak
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{...S.arrowBtn, background: '#F1F5F9', border: 'none', width: 36, height: 36, cursor: 'pointer'}} onClick={() => navigate(`/habits/${habit.id}`)}>
                          {ICONS.arrowUpRight}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── RIGHT: All Habits & History (30%) ── */}
              <div style={{...S.card, minHeight: 'auto', marginBottom: 0}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32}}>
                  <div>
                    <h2 style={{margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 500, color: '#111'}}>All Habits</h2>
                    <p style={{margin: 0, fontSize: '0.85rem', color: '#6B7280'}}>Habit History</p>
                  </div>
                  <button onClick={() => setShowNewHabitModal(true)} style={{padding: '8px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 50, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                    New +
                  </button>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
                  {habits.length === 0 && <p style={{color: '#9CA3AF'}}>No habits found.</p>}
                  {habits.map((habit, i) => {
                    const startedDate = new Date(habit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    return (
                      <div key={habit.id} style={{display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24, borderBottom: i !== habits.length -1 ? '1px solid #F3F4F6' : 'none'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                          <div style={{width: 36, height: 36, borderRadius: '50%', background: COLORS[i % COLORS.length]}} />
                          <div>
                            <h4 style={{margin: '0 0 2px', fontSize: '1rem', fontWeight: 500, color: '#111'}}>{habit.name}</h4>
                            <p style={{margin: 0, fontSize: '0.75rem', color: '#9CA3AF'}}>Started: {startedDate}</p>
                          </div>
                        </div>

                        {/* Barcode Progress Indicator */}
                        <div style={{display: 'flex', alignItems: 'center', gap: 3}}>
                          {barcodeDates.slice(-21).map(dateStr => { // Show last 21 days
                            const checked = habit.checkIns?.includes(dateStr);
                            return <div key={dateStr} style={{flex: 1, height: checked ? 24 : 12, background: checked ? '#111' : '#F1F5F9', borderRadius: 2}} />
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── GITHUB STYLE HEATMAP (LIGHT THEME) ── */}
            <div style={{...S.card, background: '#fff', color: '#111', marginBottom: 40, border: '1px solid #F3F4F6', minHeight: 'auto'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <h2 style={{margin: 0, fontSize: '1rem', fontWeight: 500, color: '#111'}}>
                  {totalYearCheckins} total habit check-ins in the last year
                </h2>
                <span style={{fontSize: '0.85rem', color: '#6B7280', cursor: 'pointer'}}>Contribution settings ▾</span>
              </div>

              <div style={{display: 'flex', overflowX: 'auto', paddingBottom: 16}}>
                {/* Day Labels */}
                <div style={{display: 'flex', flexDirection: 'column', gap: 4, marginRight: 8, marginTop: 24, fontSize: '0.75rem', color: '#9CA3AF'}}>
                  <span style={{height: 12}}></span>
                  <span style={{height: 12, display: 'flex', alignItems: 'center'}}>Mon</span>
                  <span style={{height: 12}}></span>
                  <span style={{height: 12, display: 'flex', alignItems: 'center'}}>Wed</span>
                  <span style={{height: 12}}></span>
                  <span style={{height: 12, display: 'flex', alignItems: 'center'}}>Fri</span>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  {/* Month Labels */}
                  <div style={{position: 'relative', height: 20, width: '100%', marginBottom: 4}}>
                    {monthLabels.map((m, i) => (
                      <span key={i} style={{position: 'absolute', left: m.colIndex * 16, fontSize: '0.75rem', color: '#9CA3AF'}}>
                        {m.label}
                      </span>
                    ))}
                  </div>
                  
                  {/* Heatmap Grid */}
                  <div style={{
                    display: 'grid', 
                    gridTemplateRows: 'repeat(7, 12px)', 
                    gridAutoFlow: 'column', 
                    gap: 4
                  }}>
                    {heatmapDays.map((d, i) => {
                      if (!d) return <div key={`pad-${i}`} style={{width: 12, height: 12, borderRadius: 2}} />;
                      const dateStr = formatDateStr(d);
                      const count = heatmapCounts[dateStr] || 0;
                      return (
                        <div 
                          key={dateStr} 
                          title={`${count}/${totalHabits} habits completed on ${dateStr}`}
                          style={{
                            width: 12, height: 12, borderRadius: 2,
                            background: getHeatmapColor(count),
                            outline: '1px solid rgba(0,0,0,0.02)', outlineOffset: -1
                          }} 
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#6B7280', marginTop: 16}}>
                <span style={{cursor: 'pointer'}}>Learn how we count contributions</span>
                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <span>Less</span>
                  <div style={{width: 12, height: 12, borderRadius: 2, background: '#F1F5F9'}} />
                  <div style={{width: 12, height: 12, borderRadius: 2, background: '#D1FAE5'}} />
                  <div style={{width: 12, height: 12, borderRadius: 2, background: '#34D399'}} />
                  <div style={{width: 12, height: 12, borderRadius: 2, background: '#059669'}} />
                  <span>More</span>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ════ NEW HABIT MODAL ═══════════════════════════════════════════════════ */}
      {showNewHabitModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'}}>
          <div style={{background: '#fff', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400, boxShadow: '0 24px 48px rgba(0,0,0,0.2)'}}>
            <h2 style={{margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 500, color: '#111'}}>Add New Habit</h2>
            <p style={{margin: '0 0 24px', fontSize: '0.9rem', color: '#6B7280'}}>What do you want to achieve?</p>
            <form onSubmit={handleCreateHabit}>
              <input 
                type="text" 
                placeholder="E.g., Read for 30 minutes" 
                value={newHabitName}
                onChange={e => setNewHabitName(e.target.value)}
                required
                style={{width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', marginBottom: 24, fontSize: '1rem', outline: 'none', boxSizing: 'border-box'}}
              />
              <div style={{display: 'flex', gap: 16}}>
                <button type="button" onClick={() => setShowNewHabitModal(false)} style={{flex: 1, padding: '14px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 50, cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem'}}>Cancel</button>
                <button type="submit" disabled={isCreating} style={{flex: 1, padding: '14px', background: '#111', color: '#fff', border: 'none', borderRadius: 50, cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem'}}>
                  {isCreating ? 'Creating...' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#FAFAFA',
    fontFamily: "'Inter', system-ui, sans-serif",
    display: 'flex',
  },
  
  sidebarWrapper: {
    width: 80,
    background: '#FAFAFA',
    position: 'relative'
  },
  sidebar: {
    position: 'fixed',
    top: 0, bottom: 0, left: 0,
    width: 80,
    background: '#111',
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 40
  },
  
  main: {
    flex: 1,
    padding: '32px 48px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    maxHeight: '100vh',
    overflowY: 'auto'
  },

  /* Grid Layout Restructured */
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1.5fr', // Right column slightly wider for Schedule
    gridTemplateRows: 'auto auto',
    gap: 24,
    marginBottom: 24 // Space between grid and the independent All Habits card
  },
  card: {
    background: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    position: 'relative',
    boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 340
  },
  glassCard: {
    background: '#E8F3EE',
    overflow: 'hidden',
  },
  arrowBtn: {
    width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
  }
};
