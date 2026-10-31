/**
 * GEC Sheikhpura - Sports & Events Management System
 * Production client library for Modules A, B, C, D
 */

(function (window) {
  const API_BASE = 'https://gec-sheikhpura-backend.onrender.com/api';

  const SportsEventsClient = {
    // --- MODULE A: EVENTS ---
    async getEvents(params = {}) {
      try {
        const q = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/events${q ? '?' + q : ''}`);
        return await res.json();
      } catch (e) {
        console.error('Error fetching events:', e);
        return { events: [] };
      }
    },

    async createEvent(payload) {
      try {
        const res = await fetch(`${API_BASE}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (e) {
        console.error('Error creating event:', e);
        return { error: e.message };
      }
    },

    async registerForEvent(eventId, payload) {
      try {
        const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (e) {
        console.error('Error registering event:', e);
        return { error: e.message };
      }
    },

    // --- MODULE B: SPORTS & SQUADS ---
    async getSports() {
      try {
        const res = await fetch(`${API_BASE}/sports`);
        return await res.json();
      } catch (e) {
        return { sports: [] };
      }
    },

    async getTeams(params = {}) {
      try {
        const q = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/sports/teams${q ? '?' + q : ''}`);
        return await res.json();
      } catch (e) {
        return { teams: [] };
      }
    },

    async registerTeam(payload) {
      try {
        const res = await fetch(`${API_BASE}/sports/teams/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    },

    async updateTeamStatus(teamId, status, rejectionReason = '') {
      try {
        const res = await fetch(`${API_BASE}/sports/teams/${teamId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, rejectionReason })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    },

    // --- MODULE C: MATCHES & SCORING ---
    async getMatches(params = {}) {
      try {
        const q = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/matches${q ? '?' + q : ''}`);
        return await res.json();
      } catch (e) {
        return { matches: [] };
      }
    },

    // MANUAL MATCH SCHEDULING (Default & Mandatory)
    async scheduleMatch(payload) {
      try {
        const res = await fetch(`${API_BASE}/matches/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    },

    async recordMatchEvent(matchId, payload) {
      try {
        const res = await fetch(`${API_BASE}/matches/${matchId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    },

    async updateMatchTimer(matchId, payload) {
      try {
        const res = await fetch(`${API_BASE}/matches/${matchId}/timer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    },

    async resolveTieBreaker(matchId, payload) {
      try {
        const res = await fetch(`${API_BASE}/matches/${matchId}/tie-breaker`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    },

    async publishMatchResult(matchId) {
      try {
        const res = await fetch(`${API_BASE}/matches/${matchId}/publish-result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    },

    async getStandings(params = {}) {
      try {
        const q = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/standings${q ? '?' + q : ''}`);
        return await res.json();
      } catch (e) {
        return { standings: [] };
      }
    },

    async getIndividualRankings(params = {}) {
      try {
        const q = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/rankings/individual${q ? '?' + q : ''}`);
        return await res.json();
      } catch (e) {
        return { rankings: [] };
      }
    },

    // --- MODULE D: CULTURAL COMPETITIONS ---
    async getCulturalCompetitions(params = {}) {
      try {
        const q = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/cultural/competitions${q ? '?' + q : ''}`);
        return await res.json();
      } catch (e) {
        return { competitions: [] };
      }
    },

    async registerCultural(compId, payload) {
      try {
        const res = await fetch(`${API_BASE}/cultural/competitions/${compId}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    },

    async submitJudgeScore(compId, payload) {
      try {
        const res = await fetch(`${API_BASE}/cultural/competitions/${compId}/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    },

    async publishCulturalResults(compId) {
      try {
        const res = await fetch(`${API_BASE}/cultural/competitions/${compId}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    }
  };

  window.SportsEventsClient = SportsEventsClient;
})(window);
