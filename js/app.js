// Sound System - Disabled
class SoundManager {
    constructor() {
        this.enabled = false;
    }

    playTone() {
        // Sounds disabled
    }

    playClick() {
        // Sounds disabled
    }

    playSuccess() {
        // Sounds disabled
    }

    playError() {
        // Sounds disabled
    }

    playComplete() {
        // Sounds disabled
    }

    playHover() {
        // Sounds disabled
    }
}

const soundManager = new SoundManager();

// Main Application Logic
let currentDate = new Date();
let settings = { weeklyGoal: 300 };
let difficultyChartInstance = null;
let platformChartInstance = null;
let previousUnlockedBadges = new Set();

// --- CONSTANTS ---
const QUOTES = [
    "Consistency beats intensity.", "Code is like humor. When you have to explain it, it’s bad.",
    "First, solve the problem. Then, write the code.", "Simplicity is the soul of efficiency.",
    "Make it work, make it right, make it fast.", "Talk is cheap. Show me the code."
];

const BADGES = [
    // Milestones
    { id: 'hello_world', name: 'Hello World', desc: 'Log your first problem', icon: 'fa-hand', category: 'Milestones', color: 'text-yellow-400', check: s => s.total >= 1 },
    { id: 'getting_started', name: 'Getting Started', desc: 'Solve 10 problems', icon: 'fa-rocket', category: 'Milestones', color: 'text-blue-400', check: s => s.total >= 10 },
    { id: 'half_century', name: 'Half Century', desc: 'Solve 50 problems', icon: 'fa-star-half', category: 'Milestones', color: 'text-green-400', check: s => s.total >= 50 },
    { id: 'centurion', name: 'Centurion', desc: 'Solve 100 problems', icon: 'fa-trophy', category: 'Milestones', color: 'text-purple-400', check: s => s.total >= 100 },
    { id: 'legend', name: 'Legend', desc: 'Solve 500 problems', icon: 'fa-crown', category: 'Milestones', color: 'text-yellow-500', check: s => s.total >= 500 },
    
    // Streaks
    { id: 'spark', name: 'Spark', desc: '3-day streak', icon: 'fa-sparkles', category: 'Streaks', color: 'text-yellow-300', check: s => s.streak >= 3 },
    { id: 'on_fire', name: 'On Fire', desc: '7-day streak', icon: 'fa-fire', category: 'Streaks', color: 'text-orange-500', check: s => s.streak >= 7 },
    { id: 'unstoppable', name: 'Unstoppable', desc: '14-day streak', icon: 'fa-bolt', category: 'Streaks', color: 'text-blue-500', check: s => s.streak >= 14 },
    { id: 'habitual', name: 'Habitual', desc: '30-day streak', icon: 'fa-infinity', category: 'Streaks', color: 'text-purple-500', check: s => s.streak >= 30 },
    { id: 'dedication_streak', name: 'Dedication', desc: '90-day streak', icon: 'fa-gem', category: 'Streaks', color: 'text-pink-500', check: s => s.streak >= 90 },
    
    // Mastery & Topics
    { id: 'apprentice', name: 'Apprentice', desc: '10 Easy problems', icon: 'fa-seedling', category: 'Mastery', color: 'text-green-300', check: s => s.easy >= 10 },
    { id: 'journeyman', name: 'Journeyman', desc: '10 Medium problems', icon: 'fa-hammer', category: 'Mastery', color: 'text-yellow-400', check: s => s.medium >= 10 },
    { id: 'warrior', name: 'Warrior', desc: '10 Hard problems', icon: 'fa-sword', category: 'Mastery', color: 'text-red-500', check: s => s.hard >= 10 },
    { id: 'ironborn', name: 'Ironborn', desc: '50 Hard problems', icon: 'fa-shield', category: 'Mastery', color: 'text-red-600', check: s => s.hard >= 50 },
    { id: 'grandmaster', name: 'Grandmaster', desc: '100 Hard problems', icon: 'fa-medal', category: 'Mastery', color: 'text-purple-600', check: s => s.hard >= 100 },
    { id: 'dp_master', name: 'DP Master', desc: '20 Dynamic Programming problems', icon: 'fa-diagram-project', category: 'Topics', color: 'text-blue-500', check: s => {
        const dpCount = (s.tagCounts['dp'] || 0) + (s.tagCounts['dynamic programming'] || 0) + (s.tagCounts['dynamic-programming'] || 0);
        return dpCount >= 20;
    }},
    { id: 'graph_guru', name: 'Graph Guru', desc: '20 Graph problems', icon: 'fa-project-diagram', category: 'Topics', color: 'text-cyan-500', check: s => {
        const graphCount = (s.tagCounts['graph'] || 0) + (s.tagCounts['graphs'] || 0);
        return graphCount >= 20;
    }},
    { id: 'arborist', name: 'Arborist', desc: '20 Tree problems', icon: 'fa-tree', category: 'Topics', color: 'text-green-500', check: s => {
        const treeCount = (s.tagCounts['tree'] || 0) + (s.tagCounts['trees'] || 0);
        return treeCount >= 20;
    }},
    { id: 'polymath', name: 'Polymath', desc: 'Solve problems from 5+ different topics', icon: 'fa-brain', category: 'Topics', color: 'text-indigo-500', check: s => s.uniqueTopicsCount >= 5 },
    
    // Dedication & Platforms
    { id: 'leetcode_fan', name: 'LeetCode Fan', desc: '50 problems on LeetCode', icon: 'fa-code', category: 'Platforms', color: 'text-orange-400', check: s => (s.platCounts['LeetCode'] || 0) >= 50 },
    { id: 'hackerrank_hero', name: 'HackerRank Hero', desc: '50 problems on HackerRank', icon: 'fa-laptop-code', category: 'Platforms', color: 'text-green-400', check: s => (s.platCounts['HackerRank'] || 0) >= 50 },
    { id: 'cf_pupil', name: 'CF Pupil', desc: '10 problems on Codeforces', icon: 'fa-chess-pawn', category: 'Platforms', color: 'text-blue-400', check: s => (s.platCounts['Codeforces'] || 0) >= 10 },
    { id: 'cf_specialist', name: 'CF Specialist', desc: '50 problems on Codeforces', icon: 'fa-chess-knight', category: 'Platforms', color: 'text-cyan-400', check: s => (s.platCounts['Codeforces'] || 0) >= 50 },
    { id: 'hundred_hours', name: '100 Hours', desc: '100 hours total time tracked', icon: 'fa-hourglass-half', category: 'Dedication', color: 'text-yellow-400', check: s => (s.minutes / 60) >= 100 },
    { id: 'five_hundred_hours', name: '500 Hours', desc: '500 hours total time tracked', icon: 'fa-hourglass', category: 'Dedication', color: 'text-orange-500', check: s => (s.minutes / 60) >= 500 },
    { id: 'weekender', name: 'Weekender', desc: '10 problems solved on weekends', icon: 'fa-calendar-week', category: 'Dedication', color: 'text-purple-400', check: s => s.weekendProblems >= 10 },
    { id: 'marathoner', name: 'Marathoner', desc: 'Single session lasting > 120 minutes', icon: 'fa-running', category: 'Dedication', color: 'text-red-500', check: s => s.maxSessionTime >= 120 }
];

// Daily Activities - will be loaded from database
let DAILY_ACTIVITIES = [];

// --- INIT ---
window.onDBReady = function() {
    loadDailyActivities();
    refreshAll();
};

document.addEventListener('DOMContentLoaded', async () => {
    // Date & Quote
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateEl = document.getElementById('headerDate');
    if(dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', options).toUpperCase();
    const quoteEl = document.getElementById('dailyQuote');
    if(quoteEl) quoteEl.innerText = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    // Setup Event Listeners
    setupEventListeners();
    setupKeyboardShortcuts();
    
    // If DB is already ready, refresh
    if(window.db) {
        loadDailyActivities();
        refreshAll();
    }
});

function loadDailyActivities() {
    if(!window.db) return;
    try {
        const res = window.db.exec("SELECT * FROM daily_activities");
        if(res.length && res[0].values.length) {
            DAILY_ACTIVITIES = res[0].values.map(row => ({
                id: row[0],
                category: row[1],
                task: row[2],
                duration: row[3]
            }));
        }
    } catch(e) {
        console.error("Failed to load daily activities:", e);
    }
}

function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchLogs');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            soundManager.playHover();
            renderStats(e.target.value);
        });
    }
    
    // Modal Triggers
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.onclick = () => {
            soundManager.playClick();
            const modal = btn.closest('.fixed');
            closeModal(modal.id);
        };
    });
    
    // Buttons with sound effects
    const addSoundToButton = (btn, sound = 'click') => {
        if (btn) {
            btn.addEventListener('mouseenter', () => soundManager.playHover());
            btn.addEventListener('click', () => {
                if (sound === 'success') soundManager.playSuccess();
                else if (sound === 'click') soundManager.playClick();
            });
        }
    };
    
    const saveLogBtn = document.getElementById('saveLogBtn');
    if (saveLogBtn) {
        saveLogBtn.onclick = () => { soundManager.playSuccess(); saveLog(); };
    }
    
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.onclick = () => { soundManager.playSuccess(); saveSettings(); };
    }
    
    const finishOnboardingBtn = document.getElementById('finishOnboardingBtn');
    if (finishOnboardingBtn) {
        finishOnboardingBtn.onclick = () => { soundManager.playComplete(); completeOnboarding(); };
    }
    
    const addCustomTaskBtn = document.getElementById('addCustomTaskBtn');
    if (addCustomTaskBtn) {
        addCustomTaskBtn.onclick = () => { soundManager.playClick(); addCustomTask(); };
    }
    
    const toggleTimerBtn = document.getElementById('toggleTimerBtn');
    if (toggleTimerBtn) {
        toggleTimerBtn.onclick = () => { soundManager.playClick(); toggleTimer(); };
    }
    
    const timerCollapsedBtn = document.getElementById('timerCollapsedBtn');
    if (timerCollapsedBtn) {
        timerCollapsedBtn.onclick = () => { soundManager.playClick(); toggleTimer(); };
    }
    
    const startTimerBtn = document.getElementById('startTimerBtn');
    if (startTimerBtn) {
        startTimerBtn.onclick = () => { soundManager.playSuccess(); startFocusTimer(); };
    }
    
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    if (pauseTimerBtn) {
        pauseTimerBtn.onclick = () => { soundManager.playClick(); pauseFocusTimer(); };
    }
    
    const stopTimerBtn = document.getElementById('stopTimerBtn');
    if (stopTimerBtn) {
        stopTimerBtn.onclick = () => { soundManager.playClick(); stopFocusTimer(); };
    }
    
    const newLogBtn = document.getElementById('newLogBtn');
    if (newLogBtn) {
        newLogBtn.onclick = () => { soundManager.playClick(); openModal(); };
    }
    
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.onclick = () => { soundManager.playClick(); openSettings(); };
    }
    
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    if (prevMonthBtn) {
        prevMonthBtn.onclick = () => { soundManager.playClick(); changeMonth(-1); };
    }
    
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    if (nextMonthBtn) {
        nextMonthBtn.onclick = () => { soundManager.playClick(); changeMonth(1); };
    }
    
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.onclick = () => { soundManager.playSuccess(); window.exportDB(); };
    }
    
    const restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) {
        restoreBtn.onclick = () => { soundManager.playClick(); document.getElementById('dbInput').click(); };
    }
    
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.onclick = () => { 
            if (confirm("⚠️ WARNING: This will delete ALL your data. Are you sure?")) {
                window.clearAllData(); 
            }
        };
    }
    
    const dbInput = document.getElementById('dbInput');
    if (dbInput) {
        dbInput.onchange = (e) => { soundManager.playSuccess(); window.importDB(e.target); };
    }
    
    // Add hover sounds to all buttons
    document.querySelectorAll('button, .shad-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            if (!btn.disabled) soundManager.playHover();
        });
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Esc to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
        // Ctrl+Enter to save log
        if (e.ctrlKey && e.key === 'Enter') {
            const logModal = document.getElementById('logModal');
            if (logModal && !logModal.classList.contains('hidden')) {
                saveLog();
            }
        }
    });
}

// --- CORE LOGIC ---
function refreshAll() {
    if(!window.db) return;
    if(DAILY_ACTIVITIES.length === 0) loadDailyActivities();
    generateDailyQuests();
    renderQuests();
    renderCalendar();
    // Preserve search input value when refreshing
    const searchInput = document.getElementById('searchLogs');
    const searchValue = searchInput ? searchInput.value : '';
    renderStats(searchValue);
    renderBadges();
    renderTasks();
    updateCharts();
}

function openModal(dateKey) { 
    const m = document.getElementById('logModal'); m.classList.remove('hidden'); 
    setTimeout(() => m.classList.add('active'), 10); 
    document.getElementById('entryDate').value = dateKey || new Date().toISOString().split('T')[0]; 
}

function closeModal(id) { 
    const m = document.getElementById(id); m.classList.remove('active'); 
    setTimeout(() => m.classList.add('hidden'), 200); 
}

function openSettings() { 
    document.getElementById('settingWeeklyGoal').value = settings.weeklyGoal;
    // Load current username
    if(window.db) {
        try {
            const usernameRes = window.db.exec("SELECT value FROM settings WHERE key='username'");
            if(usernameRes.length > 0 && usernameRes[0].values.length > 0) {
                document.getElementById('settingUsername').value = usernameRes[0].values[0][0];
            } else {
                document.getElementById('settingUsername').value = '';
            }
        } catch(e) {
            document.getElementById('settingUsername').value = '';
        }
    }
    const m = document.getElementById('settingsModal'); 
    m.classList.remove('hidden'); 
    setTimeout(() => m.classList.add('active'), 10);
}

function saveSettings() {
    settings.weeklyGoal = parseInt(document.getElementById('settingWeeklyGoal').value) || 300;
    window.db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('weeklyGoal', ?)", [settings.weeklyGoal]);
    
    // Save username if provided
    const username = document.getElementById('settingUsername').value.trim();
    if(username) {
        window.db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('username', ?)", [username]);
        // Update display immediately
        const userNameDisplay = document.getElementById('userNameDisplay');
        if(userNameDisplay) userNameDisplay.innerText = username;
    }
    
    window.saveDB();
    closeModal('settingsModal');
    refreshAll();
    if(username) {
        showToast("Settings saved!", "success");
    }
}

function saveLog() {
    const date = document.getElementById('entryDate').value;
    const time = parseInt(document.getElementById('timeSpent').value) || 0;
    const name = document.getElementById('problemName').value;
    const plat = document.getElementById('platform').value;
    const diff = document.getElementById('difficulty').value;
    const tags = document.getElementById('tags').value;
    const desc = document.getElementById('description').value;

    if(!date || !name) return alert("Date and Problem Name required");

    const newEntry = { time, difficulty: diff }; 
    
    window.db.run("INSERT INTO logs (date, time, problem, platform, difficulty, tags, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
        [date, time, name, plat, diff, tags, desc, new Date().toISOString()]);
    
    updateQuests(newEntry);
    window.saveDB();
    closeModal('logModal');
    refreshAll();
    soundManager.playSuccess();
    showToast("ENTRY SAVED", "success");
    createParticles(document.getElementById('newLogBtn'));
    document.getElementById('logForm').reset();
}

function deleteLog(id) {
    if(confirm("Delete log?")) { 
        window.db.run("DELETE FROM logs WHERE id=?", [id]); 
        window.saveDB(); refreshAll(); 
    }
}

// --- ANALYTICS ---
function processStats(rows) {
    let s = { 
        total: 0, minutes: 0, xp: 0, streak: 0, 
        platCounts: {}, hard: 0, easy: 0, medium: 0, 
        weekMinutes: 0, tagCounts: {}, weekendProblems: 0, 
        maxSessionTime: 0, uniqueTopics: new Set()
    };
    let dates = new Set();
    const today = new Date();
    // Calculate start of week (Sunday = 0, Monday = 1, etc.)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    rows.forEach(r => {
        // r indices: 0=id, 1=date, 2=time, 3=problem, 4=platform, 5=difficulty, 6=tags, 7=description
        s.total++; 
        s.minutes += r[2]; 
        dates.add(r[1]);
        s.platCounts[r[4]] = (s.platCounts[r[4]] || 0) + 1;
        
        // Difficulty counts
        if (r[5] === 'Easy') s.easy++;
        else if (r[5] === 'Medium') s.medium++;
        else if (r[5] === 'Hard') s.hard++;
        
        // Max session time
        if (r[2] > s.maxSessionTime) s.maxSessionTime = r[2];
        
        // Weekend detection (Saturday = 6, Sunday = 0)
        const logDate = new Date(r[1] + 'T00:00:00'); // Ensure time is 00:00:00 for accurate comparison
        const dayOfWeek = logDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            s.weekendProblems++;
        }
        
        // Tag processing
        if (r[6]) {
            const tags = r[6].toLowerCase().split(',').map(t => t.trim()).filter(t => t);
            tags.forEach(tag => {
                if (tag) {
                    // Normalize tag names
                    const normalizedTag = tag.replace(/\s+/g, ' ').trim();
                    s.tagCounts[normalizedTag] = (s.tagCounts[normalizedTag] || 0) + 1;
                    s.uniqueTopics.add(normalizedTag);
                }
            });
        }
        
        let diffXp = r[5] === 'Easy' ? 10 : (r[5] === 'Medium' ? 25 : 50); 
        s.xp += diffXp + r[2];
        
        // Check if log date is within current week (from Sunday to today)
        if (logDate >= startOfWeek) {
            s.weekMinutes += r[2];
        }
    });
    
    // Convert Set to count for badge checking
    s.uniqueTopicsCount = s.uniqueTopics.size;

    // Streak Calc
    const sortedDates = [...dates].sort();
    if (sortedDates.length > 0) {
        let currentStreak = 0; 
        let checkDate = new Date(); 
        let dateStr = checkDate.toISOString().split('T')[0];
        
        if (sortedDates.includes(dateStr)) { 
            currentStreak++; 
            checkDate.setDate(checkDate.getDate() - 1); 
            dateStr = checkDate.toISOString().split('T')[0]; 
        } else { 
            checkDate.setDate(checkDate.getDate() - 1); 
            dateStr = checkDate.toISOString().split('T')[0]; 
            if (!sortedDates.includes(dateStr)) currentStreak = 0; 
        }
        
        while (currentStreak > 0) { 
            if (sortedDates.includes(dateStr)) { 
                currentStreak++; 
                checkDate.setDate(checkDate.getDate() - 1); 
                dateStr = checkDate.toISOString().split('T')[0]; 
            } else break; 
        }
        s.streak = currentStreak;
    }
    return s;
}

function renderStats(search = "") {
    if(!window.db) return;
    const res = window.db.exec("SELECT * FROM logs ORDER BY date DESC");
    let rows = res.length ? res[0].values : [];
    let stats = processStats(rows);
    
    const update = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
    update('totalProblems', stats.total); 
    update('totalHours', (stats.minutes / 60).toFixed(1)); 
    update('currentStreak', stats.streak);
    
    const xp = stats.xp; 
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    update('userLevel', level); 
    update('xpText', `${Math.floor(xp)} / ${Math.pow(level,2)*100}`);
    document.getElementById('xpProgressBar').style.width = `${((xp - Math.pow(level-1,2)*100) / (Math.pow(level,2)*100 - Math.pow(level-1,2)*100)) * 100}%`;
    
    let rank = "IRON"; 
    if (xp > 1000) rank = "BRONZE"; if (xp > 3000) rank = "SILVER"; 
    if (xp > 7000) rank = "GOLD"; if (xp > 15000) rank = "PLATINUM"; if (xp > 30000) rank = "DIAMOND";
    update('rankName', rank);
    const rankEl = document.getElementById('rankName');
    if(rankEl) {
        let rankColor = '';
        let rankGlow = '';
        switch(rank) {
            case 'IRON':
                rankColor = 'text-gray-400';
                rankGlow = '0 0 10px rgba(156, 163, 175, 0.5)';
                break;
            case 'BRONZE':
                rankColor = 'text-orange-600';
                rankGlow = '0 0 10px rgba(234, 88, 12, 0.5)';
                break;
            case 'SILVER':
                rankColor = 'text-gray-300';
                rankGlow = '0 0 10px rgba(209, 213, 219, 0.5)';
                break;
            case 'GOLD':
                rankColor = 'text-yellow-500';
                rankGlow = '0 0 15px rgba(234, 179, 8, 0.6)';
                break;
            case 'PLATINUM':
                rankColor = 'text-cyan-400';
                rankGlow = '0 0 15px rgba(34, 211, 238, 0.6)';
                break;
            case 'DIAMOND':
                rankColor = 'text-blue-400';
                rankGlow = '0 0 20px rgba(96, 165, 250, 0.7)';
                break;
            default:
                rankColor = 'text-primary';
        }
        rankEl.className = `font-black text-lg uppercase ${rankColor}`;
        rankEl.style.textShadow = rankGlow;
        rankEl.style.transition = 'all 0.3s ease';
    }

    update('weeklyGoalDisplay', (settings.weeklyGoal/60).toFixed(1)); 
    update('weeklyHours', (stats.weekMinutes/60).toFixed(1) + "h");
    document.getElementById('weeklyProgressBar').style.width = `${Math.min(100, (stats.weekMinutes / settings.weeklyGoal) * 100)}%`;

    // Table Render
    const tbody = document.getElementById('activityTableBody');
    if(tbody) {
        // Clear existing content
        tbody.innerHTML = '';
        
        // Apply search filter if provided
        let filteredRows = rows;
        if(search && search.trim()) {
            filteredRows = rows.filter(r => {
                const problemName = (r[3] || '').toLowerCase();
                const platform = (r[4] || '').toLowerCase();
                const tags = (r[6] || '').toLowerCase();
                const searchLower = search.toLowerCase();
                return problemName.includes(searchLower) || 
                       platform.includes(searchLower) || 
                       tags.includes(searchLower);
            });
        }
        
        // Render only first 50 for perf
        const frag = document.createDocumentFragment();
        if(filteredRows.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="5" class="text-center py-4 text-mutedForeground font-bold">No logs found</td>';
            frag.appendChild(tr);
        } else {
            filteredRows.slice(0, 50).forEach(r => {
                const tr = document.createElement('tr');
                tr.className = "transition hover:bg-card";
                tr.innerHTML = `
                    <td class="font-mono font-bold text-mutedForeground">${r[1] || ''}</td>
                    <td class="font-bold text-foreground">${r[3] || ''}</td>
                    <td><span class="text-xs border-2 border-border px-1 font-bold ${r[5]==='Hard'?'text-destructive':(r[5]==='Medium'?'text-warning':'text-success')}">${r[5] || 'N/A'}</span></td>
                    <td class="text-right font-mono text-mutedForeground">${r[2] || 0}m</td>
                    <td class="text-right">
                        <button class="mr-2 hover:text-primary transition" onclick="viewLog(${r[0]})" title="View"><i class="fa-solid fa-eye"></i></button>
                        <button class="hover:text-destructive transition" onclick="deleteLog(${r[0]})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </td>`;
                frag.appendChild(tr);
            });
        }
        tbody.appendChild(frag);
    }
}

// --- BADGES & QUESTS ---
function renderBadges() {
    if(!window.db) return;
    const res = window.db.exec("SELECT * FROM logs");
    let stats = { 
        total: 0, minutes: 0, xp: 0, streak: 0, 
        platCounts: {}, hard: 0, easy: 0, medium: 0, 
        weekMinutes: 0, tagCounts: {}, weekendProblems: 0, 
        maxSessionTime: 0, uniqueTopicsCount: 0
    };
    if (res.length) stats = processStats(res[0].values);

    const container = document.getElementById('badgesContainer'); 
    if(!container) return;
    container.innerHTML = '';
    
    // Group badges by category
    const categories = {};
    BADGES.forEach(b => {
        if (!categories[b.category]) categories[b.category] = [];
        categories[b.category].push(b);
    });
    
    const frag = document.createDocumentFragment();
    const currentUnlocked = new Set();
    
    // Render badges grouped by category
    Object.keys(categories).forEach(category => {
        const categoryBadges = categories[category];
        categoryBadges.forEach(b => {
            const unlocked = b.check(stats);
            if (unlocked) currentUnlocked.add(b.id);
            
            const div = document.createElement('div');
            div.className = `badge-card p-3 flex flex-col items-center justify-center text-center ${unlocked ? 'badge-unlocked' : 'badge-locked'}`;
            div.innerHTML = `
                <div class="text-2xl mb-2 ${b.color}"><i class="fa-solid ${b.icon}"></i></div>
                <div class="text-[10px] font-bold text-foreground">${b.name}</div>
                <div class="text-[9px] text-mutedForeground mt-1">${b.desc}</div>
            `;
            
            // Check if this is a newly unlocked badge
            if (unlocked && !previousUnlockedBadges.has(b.id)) {
                setTimeout(() => {
                    soundManager.playComplete();
                    createParticles(div);
                    if (window.confetti) {
                        confetti({ 
                            particleCount: 150, 
                            spread: 80, 
                            origin: { y: 0.5 },
                            colors: ['#ff4444', '#ff6666', '#ffff44', '#44ff44']
                        });
                    }
                    showToast(`Badge Unlocked: ${b.name}!`, 'success');
                }, 100);
            }
            
            frag.appendChild(div);
        });
    });
    
    previousUnlockedBadges = currentUnlocked;
    container.appendChild(frag);
}

function generateDailyQuests() {
    if(!window.db || DAILY_ACTIVITIES.length === 0) return;
    const today = new Date().toDateString();
    const last = localStorage.getItem('lastQuestDate');
    
    if (last !== today) {
        // Pick exactly 3 random activities from different categories
        const categories = ['Core', 'Learning', 'Wellness', 'Quick', 'Review'];
        const selectedQuests = [];
        const usedCategories = new Set();
        
        // Ensure at least one from Core category
        const coreActivities = DAILY_ACTIVITIES.filter(a => a.category === 'Core');
        if(coreActivities.length > 0) {
            const randomCore = coreActivities[Math.floor(Math.random() * coreActivities.length)];
            selectedQuests.push({
                id: randomCore.id,
                text: randomCore.task,
                category: randomCore.category,
                duration: randomCore.duration,
                progress: 0,
                completed: 0
            });
            usedCategories.add('Core');
        }
        
        // Pick 2 more from other categories (total of 3 quests)
        const otherCategories = categories.filter(c => !usedCategories.has(c));
        const numToPick = 2; // Always 3 total (1 Core + 2 others)
        
        while(selectedQuests.length < 3 && otherCategories.length > 0) {
            const category = otherCategories[Math.floor(Math.random() * otherCategories.length)];
            const categoryActivities = DAILY_ACTIVITIES.filter(a => a.category === category);
            if(categoryActivities.length > 0) {
                const randomAct = categoryActivities[Math.floor(Math.random() * categoryActivities.length)];
                // Avoid duplicates
                if(!selectedQuests.find(q => q.id === randomAct.id)) {
                    selectedQuests.push({
                        id: randomAct.id,
                        text: randomAct.task,
                        category: randomAct.category,
                        duration: randomAct.duration,
                        progress: 0,
                        completed: 0
                    });
                    usedCategories.add(category);
                }
            }
            otherCategories.splice(otherCategories.indexOf(category), 1);
        }
        
        // Store in DB
        try {
            window.db.run("DELETE FROM quests WHERE date=?", [today]);
            selectedQuests.forEach(q => {
                window.db.run("INSERT INTO quests (type, target, progress, completed, text, date, diff) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                    ['activity', q.duration, q.progress, q.completed, q.text, today, q.category]);
            });
            window.saveDB();
            localStorage.setItem('lastQuestDate', today);
        } catch(e) {
            console.error("Quest DB error:", e);
        }
    }
}

function renderQuests() {
    if(!window.db) return;
    const today = new Date().toDateString();
    // Note: sql.js exec() doesn't support parameters, but toDateString() returns safe format
    let res = window.db.exec(`SELECT * FROM quests WHERE date='${today.replace(/'/g, "''")}'`);
    const c = document.getElementById('questsContainer');
    if(!c) return;
    c.innerHTML = '';
    
    if(!res.length || !res[0].values.length) {
        // Generate new quests if none exist for today
        generateDailyQuests();
        // Re-fetch after generation (avoid recursion, just fetch again)
        res = window.db.exec(`SELECT * FROM quests WHERE date='${today.replace(/'/g, "''")}'`);
        if(!res.length || !res[0].values.length) {
            c.innerHTML = '<div class="text-xs text-mutedForeground text-center py-2">No quests for today.</div>';
            return;
        }
    }
    
    const rows = res[0].values;
    const frag = document.createDocumentFragment();
    rows.forEach(r => {
        const [id, type, target, progress, completed, text, date, category] = r;
        const isComplete = completed === 1;
        const div = document.createElement('div');
        div.className = `quest-item flex justify-between items-center p-2 text-xs font-bold ${isComplete ? 'quest-completed' : 'cursor-pointer hover:bg-card/50 transition-colors'}`;
        div.dataset.questId = id;
        
        // Show category badge and task
        const categoryColors = {
            'Core': 'bg-primary text-primaryForeground',
            'Learning': 'bg-accent text-accentForeground',
            'Wellness': 'bg-secondary text-secondaryForeground',
            'Quick': 'bg-muted text-foreground',
            'Review': 'bg-muted text-foreground'
        };
        const catColor = categoryColors[category] || 'bg-muted text-foreground';
        
        // Determine if quest can be auto-tracked or needs manual completion
        const questText = text.toLowerCase();
        const isAutoTrackable = category === 'Core' && (
            questText.includes('leetcode') || 
            questText.includes('hackerrank') || 
            questText.includes('codeforces') || 
            questText.includes('problem') ||
            questText.includes('solve')
        );
        
        div.innerHTML = `
            <div class="flex items-center gap-2 flex-1">
                <span class="text-[8px] px-1 py-0.5 ${catColor} font-bold uppercase">${category || 'Task'}</span>
                <span class="flex-1">${text}</span>
            </div>
            <span class="font-mono text-mutedForeground">
                ${isComplete ? '✓' : (isAutoTrackable ? `${progress}/${target}m` : 'Click to complete')}
            </span>
        `;
        
        // Add click handler for manual completion (if not already complete)
        if (!isComplete) {
            div.addEventListener('click', () => completeQuest(id, text));
            div.title = 'Click to mark as complete';
        }
        
        frag.appendChild(div);
    });
    c.appendChild(frag);
}

function completeQuest(questId, questText) {
    if(!window.db) return;
    
    // Get current quest data
    const res = window.db.exec(`SELECT * FROM quests WHERE id=${questId}`);
    if(!res.length || !res[0].values.length) return;
    
    const [id, type, target, progress, completed, text, date, category] = res[0].values[0];
    if (completed === 1) return; // Already completed
    
    // Mark as complete
    window.db.run("UPDATE quests SET progress=?, completed=? WHERE id=?", [target, 1, id]);
    window.saveDB();
    
    // Play success sound and show toast
    soundManager.playComplete();
    showToast(`Quest Complete: ${text}`, 'success');
    
    // Confetti effect
    if (window.confetti) {
        confetti({ 
            particleCount: 100, 
            spread: 70, 
            origin: { y: 0.6 },
            colors: ['#ff4444', '#ff6666', '#ff8888', '#44ff44', '#66ff66']
        });
    }
    
    // Find and animate the quest item
    const questItems = document.querySelectorAll('.quest-item');
    questItems.forEach(item => {
        if (item.dataset.questId == questId) {
            createParticles(item);
            item.classList.add('quest-completed');
        }
    });
    
    // Re-render to update UI
    renderQuests();
}

function updateQuests(entry) {
    if(!window.db) return;
    const today = new Date().toDateString();
    const res = window.db.exec(`SELECT * FROM quests WHERE date='${today.replace(/'/g, "''")}'`);
    if(!res.length) return;
    const rows = res[0].values;
    
    rows.forEach(r => {
        let [id, type, target, progress, completed, text, date, category] = r;
        if (completed) return;

        // Only update quests that match the logged activity
        if (type === 'activity') {
            // Only update "Core" category quests when logging coding problems
            // Other categories (Learning, Wellness, Quick, Review) are manual tasks
            if (category === 'Core') {
                // Check if the quest text mentions problem solving
                const questText = text.toLowerCase();
                const isProblemQuest = questText.includes('leetcode') || 
                                     questText.includes('hackerrank') || 
                                     questText.includes('codeforces') || 
                                     questText.includes('problem') ||
                                     questText.includes('solve');
                
                // Only update if it's a problem-solving quest
                if (isProblemQuest) {
                    progress += parseInt(entry.time || 0);
                }
            }
            // For other categories, don't auto-update from coding logs
            // They should be manually completed
        } else {
            // Legacy quest types
            if (type === 'count') progress += 1;
            if (type === 'time') progress += parseInt(entry.time);
            if (type === 'diff' && entry.difficulty === category) progress += 1;
        }

        if (progress >= target) {
            progress = target; 
            completed = 1;
            soundManager.playComplete();
            showToast(`Quest Complete: ${text}`, 'success');
            if (window.confetti) {
                confetti({ 
                    particleCount: 100, 
                    spread: 70, 
                    origin: { y: 0.6 },
                    colors: ['#ff4444', '#ff6666', '#ff8888', '#44ff44', '#66ff66']
                });
            }
            // Find and animate the quest item
            const questItems = document.querySelectorAll('.quest-item');
            questItems.forEach(item => {
                if (item.textContent.includes(text)) {
                    createParticles(item);
                    item.classList.add('quest-completed');
                }
            });
        }
        window.db.run("UPDATE quests SET progress=?, completed=? WHERE id=?", [progress, completed, id]);
    });
    window.saveDB();
    renderQuests();
}

// --- VISUALS ---
function renderCalendar() {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth();
    document.getElementById('currentMonthYear').innerText = new Date(year, month).toLocaleDateString('default', { month: 'long', year: 'numeric' }).toUpperCase();
    const grid = document.getElementById('calendarGrid'); grid.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthStr = `${year}-${String(month+1).padStart(2,'0')}`;
    // Use parameterized query - note: LIKE with % requires string concatenation, but we validate monthStr
    const monthStrSafe = monthStr.replace(/[^0-9-]/g, ''); // Sanitize
    const res = window.db.exec(`SELECT date, count(*) as count FROM logs WHERE date LIKE '${monthStrSafe}%' GROUP BY date`);
    const logMap = {}; if(res.length) res[0].values.forEach(v => logMap[v[0]] = v[1]);

    const frag = document.createDocumentFragment();
    for (let i=0; i<firstDay; i++) frag.appendChild(document.createElement('div'));
    for (let day=1; day<=daysInMonth; day++) {
        const dateKey = `${monthStr}-${String(day).padStart(2,'0')}`; const count = logMap[dateKey] || 0;
        const cell = document.createElement('div');
        let intensity = 'intensity-0'; if (count > 0) intensity = 'intensity-1'; if (count > 2) intensity = 'intensity-2'; if (count > 4) intensity = 'intensity-3'; if (count > 6) intensity = 'intensity-4';
        cell.className = `cal-cell h-20 p-2 text-xs font-bold ${intensity} flex items-start justify-end cursor-pointer`; 
        cell.innerText = day; 
        cell.onclick = () => openModal(dateKey);
        frag.appendChild(cell);
    }
    grid.appendChild(frag);
}

function changeMonth(d) { currentDate.setMonth(currentDate.getMonth() + d); renderCalendar(); }

function updateCharts() {
    const diffCanvas = document.getElementById('difficultyChart'); const platCanvas = document.getElementById('platformChart');
    if (!diffCanvas || !platCanvas) return;
    
    const res = window.db.exec("SELECT difficulty, platform FROM logs");
    const diffCounts = { Easy:0, Medium:0, Hard:0 }; const platCounts = {};
    if (res.length) { res[0].values.forEach(r => { if(r[0]) diffCounts[r[0]]++; if(r[1]) platCounts[r[1]] = (platCounts[r[1]] || 0) + 1; }); }
    
    Chart.defaults.color = '#9ca3af'; Chart.defaults.font.family = 'Space Mono';

    if (difficultyChartInstance) difficultyChartInstance.destroy();
    difficultyChartInstance = new Chart(diffCanvas, { type: 'doughnut', data: { labels: Object.keys(diffCounts), datasets: [{ data: Object.values(diffCounts), backgroundColor: ['#C7F464', '#FFE66D', '#FF6B6B'], borderWidth: 2, borderColor: '#1E1E1E' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '70%' } });
    
    if (platformChartInstance) platformChartInstance.destroy();
    platformChartInstance = new Chart(platCanvas, { type: 'pie', data: { labels: Object.keys(platCounts), datasets: [{ data: Object.values(platCounts), backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#C7F464', '#FFFFFF'], borderWidth: 2, borderColor: '#1E1E1E' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } } });
}

function showToast(msg, type='success') {
    const t = document.createElement('div');
    t.className = `toast ${type==='success'?'border-l-[8px] border-l-green-500':''}`; t.innerHTML = msg.toUpperCase();
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.classList.add('active'), 10); setTimeout(() => t.remove(), 3000);
}

// Expose showToast globally
window.showToast = showToast;

// Tasks
function renderTasks() {
    const today = new Date().toISOString().split('T')[0]; 
    const res = window.db.exec(`SELECT * FROM tasks WHERE date='${today.replace(/'/g, "''")}'`);
    const c = document.getElementById('customTasksContainer'); c.innerHTML = '';
    if (!res.length) { c.innerHTML = '<div class="text-xs font-bold text-center py-2 text-mutedForeground">NO TASKS</div>'; return; }
    
    const frag = document.createDocumentFragment();
    res[0].values.forEach(r => {
        const div = document.createElement('div');
        div.className = "flex items-center gap-2 p-2 border-b border-border hover:bg-muted transition group";
        div.innerHTML = `<input type="checkbox" ${r[3] ? 'checked' : ''} onchange="toggleTask(${r[0]}, this.checked)" class="w-4 h-4 border-2 border-border bg-card text-primary focus:ring-0"><span class="flex-1 text-sm font-bold text-foreground ${r[3] ? 'line-through opacity-50' : ''}">${r[2]}</span><button onclick="deleteTask(${r[0]})" class="text-destructive opacity-0 group-hover:opacity-100 font-bold">&times;</button>`;
        frag.appendChild(div);
    });
    c.appendChild(frag);
}

function addCustomTask() { 
    const text = prompt("Task:"); 
    if (text && text.trim()) { 
        const today = new Date().toISOString().split('T')[0]; 
        window.db.run("INSERT INTO tasks (date, text, completed) VALUES (?, ?, 0)", [today, text.trim()]); 
        window.saveDB(); 
        renderTasks(); 
    } 
}
function toggleTask(id, status) { window.db.run("UPDATE tasks SET completed=? WHERE id=?", [status ? 1 : 0, id]); window.saveDB(); renderTasks(); }
function deleteTask(id) { window.db.run("DELETE FROM tasks WHERE id=?", [id]); window.saveDB(); renderTasks(); }

// View Log Detail
function viewLog(id) {
    // Sanitize id to prevent SQL injection (should be a number)
    const safeId = parseInt(id, 10);
    if (isNaN(safeId)) return;
    const res = window.db.exec(`SELECT * FROM logs WHERE id=${safeId}`);
    if(!res.length) return;
    const r = res[0].values[0];
    document.getElementById('viewLogContent').innerHTML = `
        <div class="space-y-4">
            <div>
                <div class="text-xs font-bold uppercase text-mutedForeground">Problem</div>
                <div class="font-black text-xl text-foreground">${r[3]}</div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <div class="text-xs font-bold text-mutedForeground">Platform</div>
                    <div class="font-bold text-foreground">${r[4]}</div>
                </div>
                <div>
                    <div class="text-xs font-bold text-mutedForeground">Diff</div>
                    <div class="font-bold text-foreground ${r[5]==='Hard'?'text-destructive':''}">${r[5]}</div>
                </div>
                <div>
                    <div class="text-xs font-bold text-mutedForeground">Time</div>
                    <div class="font-bold text-foreground">${r[2]}m</div>
                </div>
                <div>
                    <div class="text-xs font-bold text-mutedForeground">Date</div>
                    <div class="text-sm text-foreground">${r[1]}</div>
                </div>
            </div>
            <div>
                <div class="text-xs font-bold text-mutedForeground uppercase mb-1">Notes</div>
                <div class="bg-input border-2 border-border p-3 font-mono text-sm text-foreground">${r[7] || "No notes."}</div>
            </div>
        </div>
    `;
    const m = document.getElementById('viewLogModal');
    m.classList.remove('hidden');
    setTimeout(() => m.classList.add('active'), 10);
}

function completeOnboarding() {
    const name = document.getElementById('onboardingName').value || "Coder";
    window.db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('username', ?)", [name]);
    window.saveDB();
    const el = document.getElementById('userNameDisplay');
    if(el) el.innerText = name;
    closeModal('onboardingModal');
    showToast("Welcome, " + name + "!", "success");
}

// Expose functions globally
window.viewLog = viewLog;
window.deleteLog = deleteLog;
window.completeOnboarding = completeOnboarding;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Timer Vars
let timerInterval; let timerSeconds = 0; let isTimerRunning = false;

function toggleTimer() {
    const w = document.getElementById('focusTimer');
    if(w.classList.contains('collapsed')) { w.classList.remove('collapsed'); w.classList.add('expanded'); w.querySelector('.collapsed-view').style.display='none'; w.querySelector('.expanded-view').style.display='flex'; }
    else { w.classList.add('collapsed'); w.classList.remove('expanded'); w.querySelector('.collapsed-view').style.display='flex'; w.querySelector('.expanded-view').style.display='none'; }
}

function startFocusTimer() {
    if(isTimerRunning) return; isTimerRunning=true;
    document.getElementById('startTimerBtn').classList.add('hidden');
    document.getElementById('pauseTimerBtn').classList.remove('hidden');
    timerInterval = setInterval(() => {
        timerSeconds++;
        const m = Math.floor(timerSeconds/60).toString().padStart(2,'0');
        const s = (timerSeconds%60).toString().padStart(2,'0');
        document.getElementById('timerDisplay').innerText = `${m}:${s}`;
    }, 1000);
}

function pauseFocusTimer() {
    isTimerRunning=false; clearInterval(timerInterval);
    document.getElementById('startTimerBtn').classList.remove('hidden');
    document.getElementById('pauseTimerBtn').classList.add('hidden');
}

function stopFocusTimer() {
    isTimerRunning=false; clearInterval(timerInterval);
    const m = Math.ceil(timerSeconds/60); timerSeconds=0;
    document.getElementById('timerDisplay').innerText="00:00";
    document.getElementById('startTimerBtn').classList.remove('hidden');
    document.getElementById('pauseTimerBtn').classList.add('hidden');
    if(m > 0) {
        openModal();
        document.getElementById('timeSpent').value = m;
        showToast("Timer Stopped", "success");
    }
    toggleTimer();
}