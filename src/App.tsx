import React, { useState, useEffect } from 'react';
import { User, EventConfig, Track, Project } from './types';
import { api } from './api';
import { Navigation } from './components/Navigation';
import { TrustLayerModal } from './components/TrustLayerModal';
import { ProjectSubmissionModal } from './components/ProjectSubmissionModal';
import { CommandPalette } from './components/CommandPalette';
import { HeroOverviewView } from './views/HeroOverviewView';
import { GalleryView } from './views/GalleryView';
import { JudgeConsoleView } from './views/JudgeConsoleView';
import { ParticipantView } from './views/ParticipantView';
import { OrganizerView } from './views/OrganizerView';
import { ResultsView } from './views/ResultsView';
import { AuditTrailView } from './views/AuditTrailView';
import { ExportCenterView } from './views/ExportCenterView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const isJudgePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/judge');
    const token = api.getClientToken();

    if (token === 'session_judge_a_ada_102' || isJudgePath) {
      return {
        id: 'user_judge_a',
        judge_id: 'judge_a',
        name: 'Ada Okonkwo',
        email: 'ada@mit.edu',
        role: 'judge',
        token: 'session_judge_a_ada_102',
        avatar: 'AO',
        title: 'Principal Systems Architect @ MIT Distributed Lab',
      };
    }
    if (token === 'session_judge_b_marcus_554') {
      return {
        id: 'user_judge_b',
        judge_id: 'judge_b',
        name: 'Marcus Chen',
        email: 'marcus@infra.dev',
        role: 'judge',
        token: 'session_judge_b_marcus_554',
        avatar: 'MC',
        title: 'Staff Platform Engineer @ InfraDev',
      };
    }
    if (token === 'session_participant_tanya_883' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/participant'))) {
      return {
        id: 'user_participant',
        name: 'Tanya Garg',
        email: 'tanyagarg5315@gmail.com',
        role: 'participant',
        team_id: 'team_nightshift',
        token: 'session_participant_tanya_883',
        avatar: 'TG',
        title: 'Team Lead @ Nightshift',
      };
    }

    return {
      id: 'user_organizer',
      name: 'Elena Rostova',
      email: 'elena@judgelayer.org',
      role: 'organizer',
      token: 'session_organizer_sec_991',
      avatar: 'ER',
      title: 'Lead Hackathon Director',
    };
  });

  const [event, setEvent] = useState<EventConfig | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const getViewFromPath = (path: string) => {
    if (path === '/projects') return 'gallery';
    if (path === '/projects/new') return 'gallery';
    if (path === '/judge') return 'judge';
    if (path === '/organizer') return 'organizer';
    if (path === '/results') return 'results';
    if (path === '/audit') return 'audit';
    if (path === '/export') return 'export';
    if (path === '/participant') return 'participant';
    return 'overview';
  };

  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getViewFromPath(window.location.pathname);
    }
    return 'overview';
  });

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (view === 'gallery') targetPath = '/projects';
      else if (view === 'judge') targetPath = '/judge';
      else if (view === 'organizer') targetPath = '/organizer';
      else if (view === 'results') targetPath = '/results';
      else if (view === 'audit') targetPath = '/audit';
      else if (view === 'export') targetPath = '/export';
      else if (view === 'participant') targetPath = '/participant';
      window.history.pushState(null, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTrustLayerOpen, setIsTrustLayerOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global initial data loading
  const loadInitialData = async () => {
    try {
      const [sessionRes, eventRes, tracksRes, projectsRes] = await Promise.all([
        api.getSession(),
        api.getEvent(),
        api.getTracks(),
        api.getProjects(),
      ]);

      if (sessionRes.authenticated && sessionRes.user) {
        setCurrentUser({ ...sessionRes.user, token: sessionRes.token || undefined });
      }
      setEvent(eventRes);
      setTracks(tracksRes);
      setProjects(projectsRes);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSwitchRole = async (roleOrId: string) => {
    try {
      const res = await api.switchRole(roleOrId);
      if (res.success && res.user) {
        setCurrentUser({ ...res.user, token: res.token });
        // Automatically route to appropriate view for the persona
        if (res.user.role === 'judge') {
          setCurrentView('judge');
        } else if (res.user.role === 'participant') {
          setCurrentView('participant');
        } else if (res.user.role === 'organizer') {
          setCurrentView('organizer');
        } else {
          setCurrentView('gallery');
        }
      }
    } catch (err) {
      console.error('Role switch error:', err);
    }
  };

  const handleRefreshProjects = async () => {
    try {
      const updated = await api.getProjects();
      setProjects(updated);
    } catch (err) {
      console.error('Refresh projects failed:', err);
    }
  };

  const handleRefreshEvent = async () => {
    try {
      const updated = await api.getEvent();
      setEvent(updated);
    } catch (err) {
      console.error('Refresh event failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center space-y-4 font-mono text-xs text-[#6B7280]">
        <div className="w-10 h-10 rounded-xl bg-[#111318] text-white flex items-center justify-center font-bold text-sm shadow-md animate-pulse">
          JL
        </div>
        <div>INITIALIZING TRUST CORE SUPERVISOR...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#111318] flex flex-col selection:bg-[#6E44FF]/20 selection:text-[#6E44FF]">
      {/* Global Top Navigation */}
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        event={event}
        onOpenTrustLayer={() => setIsTrustLayerOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentView === 'overview' && (
          <HeroOverviewView
            currentUser={currentUser}
            event={event}
            projects={projects}
            onNavigate={handleNavigate}
            onOpenTrustLayer={() => setIsTrustLayerOpen(true)}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          />
        )}

        {currentView === 'gallery' && (
          <GalleryView
            projects={projects}
            tracks={tracks}
            currentUser={currentUser}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onSelectProject={proj => {
              // Can inspect project
            }}
          />
        )}

        {currentView === 'participant' && (
          <ParticipantView
            currentUser={currentUser}
            event={event}
            projects={projects}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onRefreshProjects={handleRefreshProjects}
          />
        )}

        {currentView === 'judge' && (
          <JudgeConsoleView
            currentUser={currentUser}
            onRefreshGlobalAudit={() => {}}
            onSwitchRole={handleSwitchRole}
          />
        )}

        {currentView === 'organizer' && (
          <OrganizerView
            currentUser={currentUser}
            event={event}
            onRefreshGlobalEvent={handleRefreshEvent}
            onNavigateToResults={() => handleNavigate('results')}
            onNavigateToExports={() => handleNavigate('export')}
            onNavigateToProject={id => handleNavigate('gallery')}
          />
        )}

        {currentView === 'results' && (
          <ResultsView
            currentUser={currentUser}
            event={event}
            onRefreshGlobalEvent={handleRefreshEvent}
            onSelectProject={id => handleNavigate('gallery')}
          />
        )}

        {currentView === 'audit' && (
          <AuditTrailView
            currentUser={currentUser}
          />
        )}

        {currentView === 'export' && (
          <ExportCenterView
            currentUser={currentUser}
            onRefreshAudit={() => {}}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E4E9] bg-white py-6 text-xs font-mono text-[#6B7280]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#111318]">JUDGELAYER</span>
            <span>·</span>
            <span>The Trust Infrastructure Behind Hackathon Judging</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsTrustLayerOpen(true)}
              className="text-[#6E44FF] hover:underline font-semibold"
            >
              Trust Core Blueprint
            </button>
            <a 
              href="/api/export.csv" 
              className="hover:text-[#111318]"
            >
              CSV Portability
            </a>
            <span className="text-[#D1D5DB]">|</span>
            <span>v1.0.0 · OPEN SOURCE</span>
          </div>
        </div>
      </footer>

      {/* Trust Layer Security Inspector Modal */}
      <TrustLayerModal
        isOpen={isTrustLayerOpen}
        onClose={() => setIsTrustLayerOpen(false)}
        currentUser={currentUser}
      />

      {/* Project Submission Modal */}
      <ProjectSubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        tracks={tracks}
        event={event}
        onSuccess={() => {
          handleRefreshProjects();
          handleNavigate('gallery');
        }}
      />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        projects={projects}
        onNavigate={handleNavigate}
        onSelectProject={proj => {
          handleNavigate('gallery');
        }}
        onSwitchRole={handleSwitchRole}
        onOpenTrustLayer={() => setIsTrustLayerOpen(true)}
      />
    </div>
  );
}
