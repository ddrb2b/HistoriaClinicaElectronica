import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000';

function authHeader(creds) {
  return { Authorization: 'Basic ' + btoa(`${creds.user}:${creds.pass}`) };
}

/* ── styles ──────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #f1f5f9; color: #1e293b; -webkit-font-smoothing: antialiased; }
  :root {
    --blue: #3b82f6; --blue-dark: #2563eb; --blue-deeper: #1d4ed8; --blue-light: #eff6ff; --blue-mid: #bfdbfe;
    --indigo: #4f46e5; --indigo-light: #eef2ff;
    --green: #10b981; --green-dark: #059669; --green-light: #ecfdf5;
    --red: #ef4444; --red-dark: #dc2626; --red-light: #fef2f2;
    --yellow: #f59e0b; --yellow-dark: #d97706; --yellow-light: #fffbeb;
    --purple: #8b5cf6; --purple-light: #f5f3ff;
    --slate-50: #f8fafc; --slate-100: #f1f5f9; --slate-200: #e2e8f0;
    --slate-300: #cbd5e1; --slate-400: #94a3b8; --slate-500: #64748b;
    --slate-600: #475569; --slate-700: #334155; --slate-800: #1e293b; --slate-900: #0f172a;
    --shadow-xs: 0 1px 2px rgba(0,0,0,.05);
    --shadow-sm: 0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06);
    --shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);
    --shadow-md: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05);
    --shadow-lg: 0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04);
    --radius: .625rem; --radius-lg: .875rem; --radius-xl: 1.125rem;
    --sidebar-w: 240px;
  }
  button { cursor: pointer; border: none; font-family: inherit; }
  input, select, textarea { font-family: inherit; }
  a { text-decoration: none; }

  /* ── scrollbar ── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--slate-300); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--slate-400); }

  /* ── login ── */
  .login-wrap {
    min-height: 100vh; display: flex;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #2563eb 100%);
    position: relative; overflow: hidden;
  }
  .login-wrap::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 70% 50%, rgba(96,165,250,.15) 0%, transparent 60%),
                radial-gradient(ellipse at 20% 80%, rgba(167,139,250,.1) 0%, transparent 50%);
  }
  .login-left {
    flex: 1; display: flex; flex-direction: column; justify-content: center;
    padding: 3rem 4rem; position: relative; z-index: 1;
  }
  .login-left-brand { display: flex; align-items: center; gap: 1rem; margin-bottom: 2.5rem; }
  .login-left-brand svg { width: 48px; height: 48px; flex-shrink: 0; }
  .login-left-brand-name { font-size: 1.1rem; font-weight: 700; color: #fff; line-height: 1.3; }
  .login-left-brand-sub { font-size: .78rem; color: #93c5fd; margin-top: .1rem; }
  .login-headline { font-size: 2.5rem; font-weight: 700; color: #fff; line-height: 1.2; max-width: 400px; }
  .login-headline span { color: #60a5fa; }
  .login-desc { color: #93c5fd; font-size: .9rem; margin-top: 1rem; max-width: 340px; line-height: 1.6; }
  .login-features { margin-top: 2rem; display: flex; flex-direction: column; gap: .75rem; }
  .login-feature { display: flex; align-items: center; gap: .6rem; color: #bfdbfe; font-size: .83rem; }
  .login-feature-dot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; flex-shrink: 0; }
  .login-right {
    width: 480px; display: flex; align-items: center; justify-content: center;
    padding: 2rem; position: relative; z-index: 1;
    background: rgba(255,255,255,.04); backdrop-filter: blur(20px);
    border-left: 1px solid rgba(255,255,255,.08);
  }
  .login-card {
    background: #fff; border-radius: var(--radius-xl); padding: 2.5rem;
    width: 100%; max-width: 400px; box-shadow: var(--shadow-lg);
  }
  .login-card-header { margin-bottom: 1.75rem; }
  .login-card-title { font-size: 1.4rem; font-weight: 700; color: var(--slate-800); }
  .login-card-sub { font-size: .83rem; color: var(--slate-500); margin-top: .3rem; }
  .field { margin-bottom: 1.1rem; }
  .field label { display: block; font-size: .78rem; font-weight: 600; color: var(--slate-700); margin-bottom: .45rem; letter-spacing: .01em; text-transform: uppercase; }
  .field input {
    width: 100%; padding: .7rem 1rem; border: 1.5px solid var(--slate-200);
    border-radius: var(--radius); outline: none; font-size: .9rem; color: var(--slate-800);
    transition: border-color .15s, box-shadow .15s; background: var(--slate-50);
  }
  .field input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59,130,246,.12); background: #fff; }
  .btn-login {
    width: 100%; padding: .8rem; border-radius: var(--radius);
    background: linear-gradient(135deg, var(--blue-dark) 0%, var(--indigo) 100%);
    color: #fff; font-weight: 600; font-size: .95rem; letter-spacing: .01em;
    transition: opacity .15s, transform .1s; margin-top: .5rem;
    box-shadow: 0 4px 12px rgba(37,99,235,.35);
  }
  .btn-login:hover { opacity: .92; transform: translateY(-1px); }
  .btn-login:active { transform: translateY(0); }
  .btn-login:disabled { opacity: .65; transform: none; cursor: not-allowed; }
  .error-msg {
    background: var(--red-light); color: var(--red-dark); border-radius: var(--radius);
    padding: .65rem 1rem; font-size: .82rem; margin-bottom: 1rem;
    border: 1px solid rgba(239,68,68,.2); display: flex; align-items: center; gap: .5rem;
  }
  .login-hint {
    margin-top: 1.25rem; padding: .75rem 1rem; background: var(--slate-50);
    border-radius: var(--radius); border: 1px solid var(--slate-200);
  }
  .login-hint-title { font-size: .72rem; font-weight: 600; color: var(--slate-500); text-transform: uppercase; letter-spacing: .05em; margin-bottom: .4rem; }
  .login-hint-row { font-size: .78rem; color: var(--slate-600); display: flex; align-items: center; gap: .4rem; }
  .login-hint-row + .login-hint-row { margin-top: .25rem; }
  .login-hint-tag { background: var(--slate-200); border-radius: 4px; padding: .1rem .4rem; font-family: monospace; font-size: .75rem; color: var(--slate-700); }
  @media(max-width: 900px) { .login-left { display: none; } .login-right { width: 100%; border: none; background: transparent; } }

  /* ── layout ── */
  .sidebar {
    position: fixed; left: 0; top: 0; width: var(--sidebar-w); height: 100vh;
    background: var(--slate-900);
    display: flex; flex-direction: column; z-index: 100;
    border-right: 1px solid rgba(255,255,255,.05);
  }
  .sidebar-logo {
    padding: 1.25rem 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,.07);
    display: flex; align-items: center; gap: .75rem;
  }
  .sidebar-logo-icon {
    width: 36px; height: 36px; border-radius: .5rem;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(59,130,246,.4);
  }
  .sidebar-logo-text h2 { color: #f8fafc; font-size: .88rem; font-weight: 700; line-height: 1.3; }
  .sidebar-logo-text p { color: #64748b; font-size: .68rem; margin-top: .1rem; }
  .sidebar-section-label {
    padding: 1.1rem 1.25rem .4rem; font-size: .65rem; font-weight: 700;
    color: #475569; text-transform: uppercase; letter-spacing: .1em;
  }
  .sidebar-nav { flex: 1; padding: .5rem 0; overflow-y: auto; }
  .nav-item {
    display: flex; align-items: center; gap: .65rem;
    padding: .6rem 1rem; margin: .1rem .75rem;
    color: #94a3b8; font-size: .83rem; font-weight: 500;
    cursor: pointer; transition: all .15s; border-radius: .5rem;
    position: relative;
  }
  .nav-item:hover { background: rgba(255,255,255,.06); color: #e2e8f0; }
  .nav-item.active {
    background: rgba(59,130,246,.15); color: #93c5fd;
    box-shadow: inset 0 0 0 1px rgba(59,130,246,.2);
  }
  .nav-item.active svg { color: #3b82f6; }
  .nav-item svg { flex-shrink: 0; opacity: .8; }
  .nav-item.active svg { opacity: 1; }
  .sidebar-footer { padding: .75rem; border-top: 1px solid rgba(255,255,255,.07); }
  .user-chip {
    display: flex; align-items: center; gap: .65rem; padding: .6rem .75rem;
    border-radius: .5rem; cursor: pointer; transition: background .15s;
  }
  .user-chip:hover { background: rgba(255,255,255,.06); }
  .user-avatar {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    display: flex; align-items: center; justify-content: center;
    font-size: .72rem; font-weight: 700; color: #fff; letter-spacing: .03em;
  }
  .user-chip-info { flex: 1; min-width: 0; }
  .user-chip-name { font-size: .8rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-chip-role { font-size: .68rem; color: #64748b; }
  .user-chip-logout { color: #64748b; transition: color .15s; }
  .user-chip:hover .user-chip-logout { color: #94a3b8; }

  .main { margin-left: var(--sidebar-w); min-height: 100vh; }
  .topbar {
    position: sticky; top: 0; z-index: 50; background: rgba(241,245,249,.85);
    backdrop-filter: blur(12px); border-bottom: 1px solid var(--slate-200);
    padding: .75rem 2rem; display: flex; align-items: center; gap: .5rem;
  }
  .topbar-crumb { font-size: .8rem; color: var(--slate-400); }
  .topbar-crumb.active { color: var(--slate-700); font-weight: 600; }
  .topbar-sep { color: var(--slate-300); font-size: .9rem; }
  .page-body { padding: 1.75rem 2rem 2.5rem; }
  .page-header { margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: flex-start; }
  .page-header-left h1 { font-size: 1.35rem; font-weight: 700; color: var(--slate-800); }
  .page-header-left p { font-size: .83rem; color: var(--slate-500); margin-top: .25rem; }

  /* ── cards ── */
  .card {
    background: #fff; border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xs); border: 1px solid var(--slate-200);
  }
  .card-header {
    padding: 1rem 1.25rem; border-bottom: 1px solid var(--slate-100);
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-title { font-size: .9rem; font-weight: 700; color: var(--slate-700); display: flex; align-items: center; gap: .5rem; }
  .card-title-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--blue); flex-shrink: 0; }
  .card-body { padding: 1.25rem; }

  /* ── stat cards ── */
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
  .stat-card {
    background: #fff; border-radius: var(--radius-lg); padding: 1.25rem;
    border: 1px solid var(--slate-200); box-shadow: var(--shadow-xs);
    display: flex; align-items: flex-start; gap: 1rem; position: relative; overflow: hidden;
    transition: transform .15s, box-shadow .15s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
  .stat-card::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--accent, var(--blue));
  }
  .stat-card.blue { --accent: var(--blue); }
  .stat-card.green { --accent: var(--green); }
  .stat-card.yellow { --accent: var(--yellow); }
  .stat-icon-wrap {
    width: 46px; height: 46px; border-radius: .65rem; display: flex;
    align-items: center; justify-content: center; flex-shrink: 0;
  }
  .stat-icon-wrap.blue { background: var(--blue-light); color: var(--blue-dark); }
  .stat-icon-wrap.green { background: var(--green-light); color: var(--green-dark); }
  .stat-icon-wrap.yellow { background: var(--yellow-light); color: var(--yellow-dark); }
  .stat-info { flex: 1; }
  .stat-val { font-size: 1.8rem; font-weight: 700; color: var(--slate-800); line-height: 1; letter-spacing: -.02em; }
  .stat-lbl { font-size: .76rem; color: var(--slate-500); margin-top: .35rem; font-weight: 500; }

  /* ── table ── */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: .83rem; }
  thead tr { background: var(--slate-50); }
  th {
    padding: .7rem 1rem; text-align: left; font-size: .7rem; font-weight: 700;
    color: var(--slate-500); text-transform: uppercase; letter-spacing: .07em;
    border-bottom: 1px solid var(--slate-200); white-space: nowrap;
  }
  td { padding: .75rem 1rem; border-bottom: 1px solid var(--slate-100); color: var(--slate-700); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tbody tr { transition: background .1s; }
  tbody tr:hover td { background: var(--slate-50); }
  .td-primary { font-weight: 600; color: var(--slate-800); }

  /* ── badges ── */
  .badge {
    display: inline-flex; align-items: center; gap: .25rem;
    padding: .2rem .6rem; border-radius: 9999px;
    font-size: .69rem; font-weight: 700; letter-spacing: .02em;
  }
  .badge.red { background: var(--red-light); color: var(--red-dark); border: 1px solid rgba(239,68,68,.15); }
  .badge.green { background: var(--green-light); color: var(--green-dark); border: 1px solid rgba(16,185,129,.15); }
  .badge.blue { background: var(--blue-light); color: var(--blue-deeper); border: 1px solid rgba(59,130,246,.15); }
  .badge.yellow { background: var(--yellow-light); color: var(--yellow-dark); border: 1px solid rgba(245,158,11,.15); }
  .badge.purple { background: var(--purple-light); color: var(--purple); border: 1px solid rgba(139,92,246,.15); }
  .badge.gray { background: var(--slate-100); color: var(--slate-600); border: 1px solid var(--slate-200); }

  /* ── buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: .35rem;
    padding: .55rem 1.1rem; border-radius: var(--radius); font-weight: 600;
    font-size: .82rem; transition: all .15s; border: 1px solid transparent;
    letter-spacing: .01em;
  }
  .btn.primary {
    background: linear-gradient(135deg, var(--blue-dark), var(--indigo));
    color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,.25);
  }
  .btn.primary:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,.3); }
  .btn.success { background: var(--green); color: #fff; box-shadow: 0 2px 8px rgba(16,185,129,.25); }
  .btn.success:hover { background: var(--green-dark); }
  .btn.danger { background: var(--red); color: #fff; box-shadow: 0 2px 8px rgba(239,68,68,.2); }
  .btn.danger:hover { background: var(--red-dark); }
  .btn.ghost { background: #fff; color: var(--slate-700); border-color: var(--slate-200); box-shadow: var(--shadow-xs); }
  .btn.ghost:hover { background: var(--slate-50); border-color: var(--slate-300); }
  .btn.sm { padding: .38rem .8rem; font-size: .76rem; border-radius: .45rem; }
  .btn.icon-only { padding: .45rem; }
  .btn:disabled { opacity: .55; cursor: not-allowed; transform: none !important; }

  /* ── search ── */
  .search-wrap { position: relative; margin-bottom: 1.25rem; }
  .search-wrap svg { position: absolute; left: .85rem; top: 50%; transform: translateY(-50%); color: var(--slate-400); pointer-events: none; }
  .search-input {
    width: 100%; padding: .65rem .9rem .65rem 2.5rem;
    border: 1.5px solid var(--slate-200); border-radius: var(--radius);
    font-size: .87rem; color: var(--slate-800); background: #fff; outline: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .search-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
  .search-input::placeholder { color: var(--slate-400); }

  /* ── forms ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .form-grid .full { grid-column: 1 / -1; }
  .form-field {}
  .form-field label {
    display: block; font-size: .74rem; font-weight: 700; color: var(--slate-600);
    margin-bottom: .4rem; text-transform: uppercase; letter-spacing: .04em;
  }
  .form-field input, .form-field textarea, .form-field select {
    width: 100%; padding: .65rem .9rem;
    border: 1.5px solid var(--slate-200); border-radius: var(--radius);
    font-size: .87rem; color: var(--slate-800); background: var(--slate-50);
    outline: none; transition: border-color .15s, box-shadow .15s;
  }
  .form-field input:focus, .form-field textarea:focus, .form-field select:focus {
    border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59,130,246,.1); background: #fff;
  }
  .form-field textarea { resize: vertical; min-height: 80px; }
  .form-actions { display: flex; gap: .65rem; margin-top: 1.25rem; }
  .form-hint { font-size: .72rem; color: var(--slate-400); margin-top: .3rem; }

  /* ── modal ── */
  .overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,.6); z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 1.5rem;
    backdrop-filter: blur(4px); animation: fadeIn .15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
  .modal {
    background: #fff; border-radius: var(--radius-xl); padding: 0;
    width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto;
    box-shadow: var(--shadow-lg); animation: slideUp .2s ease;
    border: 1px solid var(--slate-200);
  }
  .modal-header {
    padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--slate-100);
    display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #fff; z-index: 1;
  }
  .modal-title { font-size: 1rem; font-weight: 700; color: var(--slate-800); }
  .modal-subtitle { font-size: .78rem; color: var(--slate-500); margin-top: .15rem; }
  .modal-close {
    width: 28px; height: 28px; border-radius: .4rem; background: var(--slate-100);
    color: var(--slate-500); display: flex; align-items: center; justify-content: center;
    border: none; cursor: pointer; transition: background .15s;
  }
  .modal-close:hover { background: var(--slate-200); color: var(--slate-700); }
  .modal-body { padding: 1.5rem; }
  .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--slate-100); display: flex; gap: .65rem; justify-content: flex-end; }

  /* ── alerts / banners ── */
  .alert-banner {
    display: flex; gap: .75rem; padding: .85rem 1rem; border-radius: var(--radius);
    font-size: .82rem; margin-bottom: .75rem; align-items: flex-start;
    border-width: 1px; border-style: solid;
  }
  .alert-banner.danger { background: var(--red-light); color: #991b1b; border-color: rgba(239,68,68,.2); }
  .alert-banner.warning { background: var(--yellow-light); color: #92400e; border-color: rgba(245,158,11,.2); }
  .alert-banner svg { flex-shrink: 0; margin-top: .05rem; }
  .alert-banner-text { flex: 1; }
  .alert-banner strong { font-weight: 700; }

  /* ── timeline ── */
  .timeline { display: flex; flex-direction: column; gap: .75rem; }
  .timeline-item {
    border-radius: var(--radius); border: 1px solid var(--slate-200);
    overflow: hidden; transition: box-shadow .15s;
  }
  .timeline-item:hover { box-shadow: var(--shadow); }
  .timeline-item-bar { height: 3px; background: linear-gradient(90deg, var(--blue), var(--indigo)); }
  .timeline-item-bar.green { background: linear-gradient(90deg, var(--green), #06b6d4); }
  .timeline-item-body { padding: .85rem 1rem; }
  .ti-meta { display: flex; align-items: center; gap: .5rem; margin-bottom: .5rem; flex-wrap: wrap; }
  .ti-date { font-size: .72rem; color: var(--slate-400); font-weight: 500; }
  .ti-doctor { font-size: .72rem; font-weight: 600; color: var(--blue-dark); background: var(--blue-light); padding: .1rem .5rem; border-radius: 99px; }
  .ti-title { font-size: .88rem; font-weight: 700; color: var(--slate-800); margin-bottom: .3rem; }
  .ti-row { font-size: .8rem; color: var(--slate-600); margin-top: .2rem; line-height: 1.5; }
  .ti-row strong { color: var(--slate-700); }

  /* ── section ── */
  .section-label {
    font-size: .7rem; font-weight: 700; color: var(--slate-400);
    text-transform: uppercase; letter-spacing: .08em;
    margin-bottom: .6rem;
  }
  .tag-list { display: flex; flex-wrap: wrap; gap: .35rem; }

  /* ── loading ── */
  .spinner {
    display: inline-block; width: 22px; height: 22px;
    border: 2.5px solid var(--slate-200); border-top-color: var(--blue);
    border-radius: 50%; animation: spin .65s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-center {
    display: flex; align-items: center; justify-content: center;
    padding: 3.5rem; gap: .85rem; color: var(--slate-500); font-size: .87rem;
  }

  /* ── empty state ── */
  .empty-state {
    text-align: center; padding: 2.5rem 1rem; color: var(--slate-400);
    display: flex; flex-direction: column; align-items: center; gap: .6rem;
  }
  .empty-state-icon {
    width: 52px; height: 52px; border-radius: 50%;
    background: var(--slate-100); display: flex; align-items: center; justify-content: center;
    color: var(--slate-400); margin-bottom: .25rem;
  }
  .empty-state p { font-size: .85rem; font-weight: 500; color: var(--slate-500); }
  .empty-state span { font-size: .78rem; color: var(--slate-400); }

  /* ── patient header ── */
  .patient-hero {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;
    position: relative; overflow: hidden;
  }
  .patient-hero::before {
    content: ''; position: absolute; right: -2rem; top: -2rem;
    width: 180px; height: 180px; border-radius: 50%;
    background: rgba(255,255,255,.05); pointer-events: none;
  }
  .patient-hero::after {
    content: ''; position: absolute; right: 4rem; bottom: -3rem;
    width: 120px; height: 120px; border-radius: 50%;
    background: rgba(255,255,255,.04); pointer-events: none;
  }
  .patient-hero-name { font-size: 1.3rem; font-weight: 700; color: #fff; }
  .patient-hero-meta { font-size: .8rem; color: #93c5fd; margin-top: .4rem; display: flex; gap: 1rem; flex-wrap: wrap; }
  .patient-hero-meta span { display: flex; align-items: center; gap: .3rem; }
  .patient-hero-actions { margin-top: 1rem; display: flex; gap: .6rem; flex-wrap: wrap; }
  .btn-hero { display: inline-flex; align-items: center; gap: .4rem; padding: .5rem 1rem; border-radius: .45rem; font-size: .8rem; font-weight: 600; border: 1.5px solid rgba(255,255,255,.3); color: #fff; background: rgba(255,255,255,.1); cursor: pointer; transition: background .15s; }
  .btn-hero:hover { background: rgba(255,255,255,.2); }
  .btn-hero.accent { background: rgba(255,255,255,.9); color: #1d4ed8; border-color: transparent; }
  .btn-hero.accent:hover { background: #fff; }

  /* ── two-col ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }

  /* ── separator ── */
  .divider { border: none; border-top: 1px solid var(--slate-100); margin: 1rem 0; }

  /* ── report row ── */
  .report-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: .7rem 0; border-bottom: 1px solid var(--slate-100);
  }
  .report-row:last-child { border-bottom: none; }
  .report-row-name { font-size: .84rem; font-weight: 600; color: var(--slate-700); }
  .report-row-sub { font-size: .75rem; color: var(--slate-400); margin-top: .15rem; }

  /* ── inline search row ── */
  .inline-search { display: flex; gap: .65rem; margin-bottom: 1rem; }
  .inline-search .form-field { flex: 1; margin-bottom: 0; }

  /* ── pagination ── */
  .pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: .75rem 1rem; border-top: 1px solid var(--slate-100);
    flex-wrap: wrap; gap: .5rem;
  }
  .pagination-info { font-size: .78rem; color: var(--slate-400); }
  .pagination-controls { display: flex; align-items: center; gap: .25rem; }
  .pg-btn {
    width: 30px; height: 30px; border-radius: .4rem; border: 1px solid var(--slate-200);
    background: #fff; color: var(--slate-600); font-size: .78rem; font-weight: 600;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: all .15s;
  }
  .pg-btn:hover:not(:disabled) { background: var(--slate-50); border-color: var(--slate-300); color: var(--slate-800); }
  .pg-btn.active { background: var(--blue-dark); border-color: var(--blue-dark); color: #fff; }
  .pg-btn:disabled { opacity: .35; cursor: not-allowed; }
  .pg-arrow { font-size: .9rem; }

  /* ── responsive ── */
  @media (max-width: 1024px) {
    :root { --sidebar-w: 200px; }
  }
  @media (max-width: 768px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .two-col { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .form-grid .full { grid-column: 1; }
    .page-body { padding: 1.25rem 1rem; }
    .topbar { padding: .65rem 1rem; }
  }
`;

/* ── icons ──────────────────────────────────────────────────────── */
const Icon = ({ d, size = 18, style, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={style} className={className}>
    {Array.isArray(d)
      ? d.map((p, i) => <path key={i} d={p} />)
      : <path d={d} />}
  </svg>
);

const ICONS = {
  home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  users: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  chart: 'M18 20V10 M12 20V4 M6 20v-6',
  search: ['M11 19a8 8 0 100-16 8 8 0 000 16z', 'M21 21l-4.35-4.35'],
  plus: 'M12 5v14 M5 12h14',
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  trash: ['M3 6h18', 'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2'],
  eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 100 6 3 3 0 000-6z'],
  cross: 'M18 6L6 18 M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  calendar: ['M3 4h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z', 'M16 2v4 M8 2v4 M3 10h18'],
  stethoscope: 'M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6v0a6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3 M8 15v1a6 6 0 006 6v0a6 6 0 006-6v-4',
  flask: 'M9 3h6l1 9-4 9-4-9 1-9z M6.3 15h11.4',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  info: ['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M12 8h.01', 'M12 12v4'],
};

/* ── small helpers ──────────────────────────────────────────────── */
function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function usePagination(items, pageSize = 8) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  useEffect(() => { setPage(1); }, [items.length]);
  return { page: safePage, setPage, totalPages, slice, total: items.length };
}

function Pagination({ page, totalPages, setPage, total, pageSize }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  return (
    <div className="pagination">
      <span className="pagination-info">{from}–{to} de {total} registros</span>
      <div className="pagination-controls">
        <button className="pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          <span className="pg-arrow">‹</span>
        </button>
        {pages.map((p, i) =>
          p === '…'
            ? <span key={i} style={{ padding: '0 .2rem', color: 'var(--slate-400)', fontSize: '.8rem' }}>…</span>
            : <button key={p} className={`pg-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
        )}
        <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
          <span className="pg-arrow">›</span>
        </button>
      </div>
    </div>
  );
}

/* ── Login ──────────────────────────────────────────────────────── */
function Login({ onLogin }) {
  const [u, setU] = useState('admin');
  const [p, setP] = useState('admin123');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await axios.post(`${API}/login`, {}, { headers: authHeader({ user: u, pass: p }) });
      onLogin({ user: u, pass: p });
    } catch {
      setErr('Usuario o contraseña incorrectos. Verifica tus credenciales.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div className="login-left-brand">
          <svg viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="rgba(255,255,255,.12)" />
            <path d="M24 12v24M12 24h24" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="24" cy="24" r="7" stroke="#93c5fd" strokeWidth="2" fill="none" />
          </svg>
          <div>
            <div className="login-left-brand-name">Clínica Nicolás Abreu</div>
            <div className="login-left-brand-sub">Sistema de Historial Clínico Digital</div>
          </div>
        </div>
        <h1 className="login-headline">Gestión clínica <span>inteligente</span> y segura</h1>
        <p className="login-desc">
          Accede al expediente completo de cada paciente, registra consultas, análisis y genera reportes en tiempo real.
        </p>
        <div className="login-features">
          {['Historial clínico completo por paciente','Alertas médicas y alergias visibles','Reportes analíticos por médico y fecha','Acceso seguro con autenticación'].map((f, i) => (
            <div key={i} className="login-feature">
              <div className="login-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-title">Iniciar sesión</div>
            <div className="login-card-sub">Ingresa tus credenciales para continuar</div>
          </div>
          {err && (
            <div className="error-msg">
              <Icon d={ICONS.info} size={14} />
              {err}
            </div>
          )}
          <form onSubmit={submit}>
            <div className="field">
              <label>Usuario</label>
              <input value={u} onChange={e => setU(e.target.value)} placeholder="Nombre de usuario" required autoFocus />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input type="password" value={p} onChange={e => setP(e.target.value)} placeholder="••••••••" required />
            </div>
            <button className="btn-login" type="submit" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} /> Verificando…</>
                : 'Acceder al sistema'}
            </button>
          </form>
          <div className="login-hint">
            <div className="login-hint-title">Credenciales de demo</div>
            <div className="login-hint-row">
              <span className="login-hint-tag">admin</span>
              <span style={{ color: 'var(--slate-400)' }}>/</span>
              <span className="login-hint-tag">admin123</span>
            </div>
            <div className="login-hint-row">
              <span className="login-hint-tag">medico</span>
              <span style={{ color: 'var(--slate-400)' }}>/</span>
              <span className="login-hint-tag">medico123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────────────── */
function Dashboard({ creds }) {
  const [stats, setStats] = useState(null);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    axios.get(`${API}/reportes/estadisticas`, { headers: authHeader(creds) })
      .then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/reportes/alertas`, { headers: authHeader(creds) })
      .then(r => setAlertas(r.data)).catch(() => {});
  }, [creds]);

  const alertasPag = usePagination(alertas, 5);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Resumen general del sistema clínico</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { color: 'blue', icon: ICONS.users, val: stats?.total_pacientes, label: 'Pacientes registrados' },
          { color: 'green', icon: ICONS.file, val: stats?.total_consultas, label: 'Consultas médicas' },
          { color: 'yellow', icon: ICONS.alert, val: stats?.pacientes_con_alergias, label: 'Pacientes con alergias' },
        ].map(({ color, icon, val, label }, i) => (
          <div key={i} className={`stat-card ${color}`}>
            <div className={`stat-icon-wrap ${color}`}>
              <Icon d={icon} size={20} />
            </div>
            <div className="stat-info">
              <div className="stat-val">{val ?? '—'}</div>
              <div className="stat-lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-dot" style={{ background: 'var(--red)' }} />
            Alertas Médicas Activas
          </div>
          {alertas.length > 0 && <span className="badge red">{alertas.length} paciente{alertas.length !== 1 ? 's' : ''}</span>}
        </div>
        <div className="card-body">
          {alertas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Icon d={ICONS.shield} size={22} /></div>
              <p>Sin alertas médicas activas</p>
              <span>Todos los pacientes están sin alertas registradas</span>
            </div>
          ) : alertasPag.slice.map((p, i) => (
            <div key={i} className="alert-banner danger" style={{ marginBottom: '.6rem' }}>
              <Icon d={ICONS.alert} size={16} />
              <div className="alert-banner-text">
                <strong>{p.nombre}</strong>
                <div style={{ marginTop: '.25rem', display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                  {p.alertas_medicas.map((a, j) => (
                    <span key={j} className="badge red">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={alertasPag.page} totalPages={alertasPag.totalPages}
          setPage={alertasPag.setPage} total={alertasPag.total} pageSize={5} />
      </div>
    </div>
  );
}

/* ── Pacientes ──────────────────────────────────────────────────── */
function Pacientes({ creds, onViewPaciente }) {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchPacientes = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/pacientes`, { headers: authHeader(creds) })
      .then(r => setList(r.data)).finally(() => setLoading(false));
  }, [creds]);

  useEffect(() => { fetchPacientes(); }, [fetchPacientes]);

  const filtered = list.filter(p =>
    p.nombre.toLowerCase().includes(q.toLowerCase()) || p.cedula.includes(q)
  );

  const pag = usePagination(filtered, 10);

  const deletePaciente = async (cedula) => {
    if (!window.confirm('¿Eliminar este paciente? Esta acción no se puede deshacer.')) return;
    await axios.delete(`${API}/pacientes/${cedula}`, { headers: authHeader(creds) });
    fetchPacientes();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Pacientes</h1>
          <p>Gestión de expedientes clínicos · {list.length} registros</p>
        </div>
        <button className="btn primary" onClick={() => setShowForm(true)}>
          <Icon d={ICONS.plus} size={15} />
          Nuevo paciente
        </button>
      </div>

      <div className="search-wrap">
        <Icon d={ICONS.search} size={16} />
        <input className="search-input" placeholder="Buscar por nombre o cédula…"
          value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /><span>Cargando pacientes…</span></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Cédula</th>
                  <th>Teléfono</th>
                  <th>Alergias</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pag.slice.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: `hsl(${(p.nombre.charCodeAt(0) * 37) % 360}, 55%, 88%)`,
                          color: `hsl(${(p.nombre.charCodeAt(0) * 37) % 360}, 55%, 35%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '.68rem', fontWeight: 700,
                        }}>
                          {initials(p.nombre)}
                        </div>
                        <span className="td-primary">{p.nombre}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'var(--slate-500)' }}>{p.cedula}</td>
                    <td style={{ color: 'var(--slate-500)' }}>{p.telefono || '—'}</td>
                    <td>
                      <div className="tag-list">
                        {(p.alergias || []).length > 0
                          ? p.alergias.map((a, j) => <span key={j} className="badge red">{a}</span>)
                          : <span className="badge green"><Icon d={ICONS.check} size={10} />Sin alergias</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <button className="btn ghost sm" onClick={() => onViewPaciente(p.cedula)}>
                          <Icon d={ICONS.eye} size={13} />
                          Ver
                        </button>
                        <button className="btn danger sm icon-only" onClick={() => deletePaciente(p.cedula)}
                          title="Eliminar paciente">
                          <Icon d={ICONS.trash} size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state" style={{ padding: '2rem' }}>
                        <div className="empty-state-icon"><Icon d={ICONS.users} size={22} /></div>
                        <p>No se encontraron pacientes</p>
                        <span>{q ? `Sin coincidencias para "${q}"` : 'Registra el primer paciente'}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination page={pag.page} totalPages={pag.totalPages}
              setPage={pag.setPage} total={pag.total} pageSize={10} />
          </div>
        )}
      </div>
      {showForm && <NuevoPacienteModal creds={creds} onClose={() => { setShowForm(false); fetchPacientes(); }} />}
    </div>
  );
}

function NuevoPacienteModal({ creds, onClose }) {
  const [form, setForm] = useState({
    nombre: '', cedula: '', fecha_nacimiento: '', telefono: '',
    direccion: '', alergias: '', antecedentes_medicos: ''
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.nombre || !form.cedula) { setErr('Nombre y cédula son obligatorios'); return; }
    setLoading(true); setErr('');
    const payload = {
      ...form,
      alergias: form.alergias ? form.alergias.split(',').map(s => s.trim()).filter(Boolean) : [],
      antecedentes_medicos: form.antecedentes_medicos ? form.antecedentes_medicos.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    try {
      await axios.post(`${API}/pacientes`, payload, { headers: authHeader(creds) });
      onClose();
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error al registrar paciente');
    } finally { setLoading(false); }
  };

  const F = ({ label, name, type = 'text', placeholder, full, hint }) => (
    <div className={`form-field${full ? ' full' : ''}`}>
      <label>{label}</label>
      <input type={type} placeholder={placeholder}
        value={form[name]} onChange={e => set(name, e.target.value)} />
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Registrar nuevo paciente</div>
            <div className="modal-subtitle">Complete la información del expediente clínico</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon d={ICONS.cross} size={14} /></button>
        </div>
        <div className="modal-body">
          {err && <div className="error-msg" style={{ marginBottom: '1rem' }}><Icon d={ICONS.info} size={14} />{err}</div>}
          <div className="form-grid">
            <F label="Nombre completo *" name="nombre" placeholder="Ej: María López" full />
            <F label="Cédula *" name="cedula" placeholder="40212345678" />
            <F label="Fecha de nacimiento" name="fecha_nacimiento" type="date" />
            <F label="Teléfono" name="telefono" placeholder="809-555-1234" />
            <F label="Dirección" name="direccion" placeholder="Santiago, R.D." full />
            <F label="Alergias" name="alergias" placeholder="Penicilina, Ibuprofeno" full hint="Separar con comas" />
            <F label="Antecedentes médicos" name="antecedentes_medicos" placeholder="Hipertensión, Diabetes" full hint="Separar con comas" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={submit} disabled={loading}>
            {loading
              ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} />Registrando…</>
              : <><Icon d={ICONS.plus} size={14} />Registrar paciente</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Historial clínico ──────────────────────────────────────────── */
function HistorialClinico({ creds, cedula, onBack }) {
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConsulta, setShowConsulta] = useState(false);
  const [showAnalisis, setShowAnalisis] = useState(false);

  const fetchPaciente = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/pacientes/${cedula}`, { headers: authHeader(creds) })
      .then(r => setPaciente(r.data)).finally(() => setLoading(false));
  }, [creds, cedula]);

  useEffect(() => { fetchPaciente(); }, [fetchPaciente]);

  if (loading) return <div className="loading-center"><div className="spinner" /><span>Cargando historial…</span></div>;
  if (!paciente) return <div className="empty-state"><p>Paciente no encontrado</p></div>;

  return (
    <div>
      <button className="btn ghost sm" onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Volver a pacientes
      </button>

      <div className="patient-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>{initials(paciente.nombre)}</div>
              <div className="patient-hero-name">{paciente.nombre}</div>
            </div>
            <div className="patient-hero-meta">
              <span><Icon d={ICONS.calendar} size={13} />{paciente.fecha_nacimiento || 'Fecha no registrada'}</span>
              <span style={{ opacity: .5 }}>·</span>
              <span>{paciente.cedula}</span>
              {paciente.direccion && <><span style={{ opacity: .5 }}>·</span><span>{paciente.direccion}</span></>}
            </div>
          </div>
          <div className="patient-hero-actions">
            <button className="btn-hero accent" onClick={() => setShowConsulta(true)}>
              <Icon d={ICONS.plus} size={14} />Nueva consulta
            </button>
            <button className="btn-hero" onClick={() => setShowAnalisis(true)}>
              <Icon d={ICONS.flask} size={14} />Nuevo análisis
            </button>
          </div>
        </div>
      </div>

      {paciente.alertas_medicas?.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          {paciente.alertas_medicas.map((a, i) => (
            <div key={i} className="alert-banner danger">
              <Icon d={ICONS.alert} size={16} />
              <div className="alert-banner-text"><strong>Alerta médica:</strong> {a}</div>
            </div>
          ))}
        </div>
      )}

      <div className="two-col" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><div className="card-title-dot" style={{ background: 'var(--red)' }} />Alergias</div>
          </div>
          <div className="card-body">
            <div className="tag-list">
              {paciente.alergias?.length > 0
                ? paciente.alergias.map((a, i) => <span key={i} className="badge red">{a}</span>)
                : <span className="badge green"><Icon d={ICONS.check} size={10} />Sin alergias conocidas</span>}
            </div>
            {paciente.antecedentes_medicos?.length > 0 && (
              <>
                <hr className="divider" />
                <div className="section-label">Antecedentes médicos</div>
                <div className="tag-list">
                  {paciente.antecedentes_medicos.map((a, i) => <span key={i} className="badge yellow">{a}</span>)}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><div className="card-title-dot" style={{ background: 'var(--purple)' }} />Análisis clínicos</div>
            {paciente.analisis_clinicos?.length > 0 && <span className="badge purple">{paciente.analisis_clinicos.length}</span>}
          </div>
          <div className="card-body">
            {paciente.analisis_clinicos?.length > 0
              ? <div className="timeline">
                  {paciente.analisis_clinicos.map((a, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-item-bar green" />
                      <div className="timeline-item-body">
                        <div className="ti-meta">
                          <span className="ti-date">{a.fecha}</span>
                          <span className="badge purple">{a.tipo}</span>
                        </div>
                        <div className="ti-row">{a.resultado}</div>
                      </div>
                    </div>
                  ))}
                </div>
              : <div className="empty-state" style={{ padding: '1rem' }}>
                  <div className="empty-state-icon"><Icon d={ICONS.flask} size={18} /></div>
                  <p>Sin análisis registrados</p>
                </div>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-title-dot" />Historial de consultas</div>
          {paciente.consultas?.length > 0 && <span className="badge blue">{paciente.consultas.length} consulta{paciente.consultas.length !== 1 ? 's' : ''}</span>}
        </div>
        <div className="card-body">
          {paciente.consultas?.length > 0
            ? <div className="timeline">
                {[...paciente.consultas].reverse().map((c, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-item-bar" />
                    <div className="timeline-item-body">
                      <div className="ti-meta">
                        <span className="ti-date">{c.fecha}</span>
                        {c.doctor && <span className="ti-doctor">{c.doctor}</span>}
                      </div>
                      {c.motivo && <div className="ti-row" style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}><strong style={{ fontStyle: 'normal' }}>Motivo:</strong> {c.motivo}</div>}
                      <div className="ti-title">{c.diagnostico}</div>
                      <div className="ti-row"><strong>Tratamiento:</strong> {c.tratamiento}</div>
                      {c.receta && <div className="ti-row"><strong>Receta:</strong> {c.receta}</div>}
                    </div>
                  </div>
                ))}
              </div>
            : <div className="empty-state">
                <div className="empty-state-icon"><Icon d={ICONS.file} size={22} /></div>
                <p>Sin consultas registradas</p>
                <span>Registra la primera consulta de este paciente</span>
              </div>}
        </div>
      </div>

      {showConsulta && (
        <NuevaConsultaModal creds={creds} cedula={cedula}
          onClose={() => { setShowConsulta(false); fetchPaciente(); }} />
      )}
      {showAnalisis && (
        <NuevoAnalisisModal creds={creds} cedula={cedula}
          onClose={() => { setShowAnalisis(false); fetchPaciente(); }} />
      )}
    </div>
  );
}

function NuevaConsultaModal({ creds, cedula, onClose }) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    doctor: '', motivo: '', diagnostico: '', tratamiento: '', receta: ''
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.doctor || !form.motivo || !form.diagnostico) { setErr('Doctor, motivo y diagnóstico son obligatorios'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/pacientes/${cedula}/consultas`, form, { headers: authHeader(creds) });
      onClose();
    } catch { setErr('Error al registrar consulta'); }
    finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Registrar consulta médica</div>
            <div className="modal-subtitle">Complete los datos de la consulta</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon d={ICONS.cross} size={14} /></button>
        </div>
        <div className="modal-body">
          {err && <div className="error-msg" style={{ marginBottom: '1rem' }}><Icon d={ICONS.info} size={14} />{err}</div>}
          <div className="form-grid">
            <div className="form-field">
              <label>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Doctor *</label>
              <input placeholder="Nombre del médico" value={form.doctor} onChange={e => set('doctor', e.target.value)} />
            </div>
            <div className="form-field full">
              <label>Motivo de consulta *</label>
              <input placeholder="Ej: Dolor de cabeza, fiebre desde hace 2 días" value={form.motivo} onChange={e => set('motivo', e.target.value)} />
            </div>
            <div className="form-field full">
              <label>Diagnóstico *</label>
              <input placeholder="Describe el diagnóstico" value={form.diagnostico} onChange={e => set('diagnostico', e.target.value)} />
            </div>
            <div className="form-field full">
              <label>Tratamiento</label>
              <input placeholder="Tratamiento indicado" value={form.tratamiento} onChange={e => set('tratamiento', e.target.value)} />
            </div>
            <div className="form-field full">
              <label>Receta</label>
              <input placeholder="Medicamentos recetados" value={form.receta} onChange={e => set('receta', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={submit} disabled={loading}>
            {loading ? 'Guardando…' : <><Icon d={ICONS.check} size={14} />Registrar consulta</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function NuevoAnalisisModal({ creds, cedula, onClose }) {
  const [form, setForm] = useState({ tipo: '', fecha: new Date().toISOString().slice(0, 10), resultado: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.tipo || !form.resultado) { setErr('Tipo y resultado son obligatorios'); return; }
    setLoading(true); setErr('');
    try {
      await axios.post(`${API}/pacientes/${cedula}/analisis`, form, { headers: authHeader(creds) });
      onClose();
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error al registrar análisis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Registrar análisis clínico</div>
            <div className="modal-subtitle">Ingresa los resultados del análisis</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon d={ICONS.cross} size={14} /></button>
        </div>
        <div className="modal-body">
          {err && <div className="error-msg" style={{ marginBottom: '1rem' }}><Icon d={ICONS.info} size={14} />{err}</div>}
          <div className="form-grid">
            <div className="form-field">
              <label>Tipo de análisis *</label>
              <input placeholder="Ej: Hemograma completo" value={form.tipo} onChange={e => set('tipo', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
            </div>
            <div className="form-field full">
              <label>Resultado *</label>
              <input placeholder="Describe los resultados" value={form.resultado} onChange={e => set('resultado', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={submit} disabled={loading}>
            {loading ? 'Guardando…' : <><Icon d={ICONS.check} size={14} />Registrar análisis</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Reportes ───────────────────────────────────────────────────── */
function Reportes({ creds }) {
  const [porMedico, setPorMedico] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const alertasPag = usePagination(alertas, 5);
  const [alergiaInput, setAlergiaInput] = useState('Penicilina');
  const [alergiaResult, setAlergiaResult] = useState(null);
  const [rangoInicio, setRangoInicio] = useState('2026-06-01');
  const [rangoFin, setRangoFin] = useState('2026-06-30');
  const [rangoResult, setRangoResult] = useState(null);

  useEffect(() => {
    axios.get(`${API}/reportes/consultas-por-medico`, { headers: authHeader(creds) })
      .then(r => setPorMedico(r.data)).catch(() => {});
    axios.get(`${API}/reportes/alertas`, { headers: authHeader(creds) })
      .then(r => setAlertas(r.data)).catch(() => {});
  }, [creds]);

  const buscarAlergia = () => {
    axios.get(`${API}/reportes/alergias/${alergiaInput}`, { headers: authHeader(creds) })
      .then(r => setAlergiaResult(r.data)).catch(() => {});
  };

  const buscarRango = () => {
    axios.get(
      `${API}/reportes/consultas-por-medico-rango?fecha_inicio=${rangoInicio}&fecha_fin=${rangoFin}`,
      { headers: authHeader(creds) }
    ).then(r => setRangoResult(r.data)).catch(() => {});
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reportes</h1>
          <p>Consultas analíticas del sistema</p>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><div className="card-title-dot" style={{ background: 'var(--yellow)' }} />Buscar por alergia</div>
          </div>
          <div className="card-body">
            <div className="inline-search">
              <div className="form-field">
                <input placeholder="Ej: Penicilina" value={alergiaInput}
                  onChange={e => setAlergiaInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && buscarAlergia()} />
              </div>
              <button className="btn primary" onClick={buscarAlergia}>Buscar</button>
            </div>
            {alergiaResult !== null && (
              alergiaResult.length > 0
                ? alergiaResult.map((p, i) => (
                  <div key={i} className="report-row">
                    <div>
                      <div className="report-row-name">{p.nombre}</div>
                      <div className="report-row-sub">{p.cedula}</div>
                    </div>
                    <div className="tag-list">
                      {p.alergias.map((a, j) => <span key={j} className="badge red">{a}</span>)}
                    </div>
                  </div>
                ))
                : <div className="empty-state" style={{ padding: '1rem' }}><p>Sin pacientes con esa alergia</p></div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><div className="card-title-dot" style={{ background: 'var(--green)' }} />Consultas por médico y rango de fechas</div>
          </div>
          <div className="card-body">
            <div className="inline-search" style={{ flexWrap: 'wrap' }}>
              <div className="form-field" style={{ flex: 1 }}>
                <input type="date" value={rangoInicio} onChange={e => setRangoInicio(e.target.value)} />
              </div>
              <div className="form-field" style={{ flex: 1 }}>
                <input type="date" value={rangoFin} onChange={e => setRangoFin(e.target.value)} />
              </div>
              <button className="btn primary" onClick={buscarRango}>Buscar</button>
            </div>
            {rangoResult !== null && (
              rangoResult.length > 0
                ? rangoResult.map((r, i) => (
                  <div key={i} className="report-row">
                    <div>
                      <div className="report-row-name">{r.doctor || '(sin asignar)'}</div>
                      <div className="report-row-sub">{r.total_pacientes} paciente{r.total_pacientes !== 1 ? 's' : ''} distintos</div>
                    </div>
                    <span className="badge green">{r.total_consultas} consulta{r.total_consultas !== 1 ? 's' : ''}</span>
                  </div>
                ))
                : <div className="empty-state" style={{ padding: '1rem' }}><p>Sin consultas en ese período</p></div>
            )}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><div className="card-title-dot" />Consultas por médico</div>
          </div>
          <div className="card-body">
            {porMedico.length > 0
              ? porMedico.map((m, i) => (
                <div key={i} className="report-row">
                  <div>
                    <div className="report-row-name">{m._id || '(sin asignar)'}</div>
                  </div>
                  <span className="badge blue">{m.total_consultas} consulta{m.total_consultas !== 1 ? 's' : ''}</span>
                </div>
              ))
              : <div className="empty-state"><div className="empty-state-icon"><Icon d={ICONS.chart} size={18} /></div><p>Sin datos disponibles</p></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><div className="card-title-dot" style={{ background: 'var(--red)' }} />Pacientes con alertas activas</div>
            {alertas.length > 0 && <span className="badge red">{alertas.length}</span>}
          </div>
          <div className="card-body">
            {alertas.length > 0
              ? alertasPag.slice.map((p, i) => (
                <div key={i} className="report-row">
                  <div>
                    <div className="report-row-name">{p.nombre}</div>
                    <div className="report-row-sub">{p.alertas_medicas.join(' · ')}</div>
                  </div>
                  <span className="badge red">{p.alertas_medicas.length}</span>
                </div>
              ))
              : <div className="empty-state"><div className="empty-state-icon"><Icon d={ICONS.shield} size={18} /></div><p>Sin alertas activas</p></div>}
          </div>
          <Pagination page={alertasPag.page} totalPages={alertasPag.totalPages}
            setPage={alertasPag.setPage} total={alertasPag.total} pageSize={5} />
        </div>
      </div>
    </div>
  );
}

/* ── App root ───────────────────────────────────────────────────── */
export default function App() {
  const [creds, setCreds] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [viewCedula, setViewCedula] = useState(null);

  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.home },
    { id: 'pacientes', label: 'Pacientes', icon: ICONS.users },
    { id: 'reportes', label: 'Reportes', icon: ICONS.chart },
  ];

  const goViewPaciente = (cedula) => { setViewCedula(cedula); setPage('historial'); };

  const pageLabel = {
    dashboard: 'Dashboard',
    pacientes: 'Pacientes',
    historial: 'Historial clínico',
    reportes: 'Reportes',
  }[page];

  if (!creds) return (
    <>
      <style>{css}</style>
      <Login onLogin={setCreds} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 4v16M4 12h16" />
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <h2>Nicolás Abreu</h2>
            <p>Sistema Clínico</p>
          </div>
        </div>
        <div className="sidebar-section-label">Navegación</div>
        <nav className="sidebar-nav">
          {nav.map(n => (
            <div key={n.id}
              className={`nav-item ${page === n.id || (page === 'historial' && n.id === 'pacientes') ? 'active' : ''}`}
              onClick={() => { setPage(n.id); setViewCedula(null); }}>
              <Icon d={n.icon} size={16} />
              {n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip" onClick={() => setCreds(null)} title="Cerrar sesión">
            <div className="user-avatar">{creds.user.slice(0, 2).toUpperCase()}</div>
            <div className="user-chip-info">
              <div className="user-chip-name">{creds.user}</div>
              <div className="user-chip-role">Cerrar sesión</div>
            </div>
            <div className="user-chip-logout"><Icon d={ICONS.logout} size={14} /></div>
          </div>
        </div>
      </div>

      <main className="main">
        <div className="topbar">
          <span className="topbar-crumb">Sistema Clínico</span>
          <span className="topbar-sep">/</span>
          <span className="topbar-crumb active">{pageLabel}</span>
        </div>
        <div className="page-body">
          {page === 'dashboard' && <Dashboard creds={creds} />}
          {page === 'pacientes' && !viewCedula && <Pacientes creds={creds} onViewPaciente={goViewPaciente} />}
          {page === 'historial' && viewCedula && (
            <HistorialClinico creds={creds} cedula={viewCedula}
              onBack={() => { setPage('pacientes'); setViewCedula(null); }} />
          )}
          {page === 'reportes' && <Reportes creds={creds} />}
        </div>
      </main>
    </>
  );
}
