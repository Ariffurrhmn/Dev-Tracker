// Database Handling Logic
let db;
const SQL_CONFIG = { locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` };

// Initialize Database
async function initDB() {
    try {
        const SQL = window.SQL || await initSqlJs(SQL_CONFIG);
        if (!window.SQL) window.SQL = SQL;
        const savedDb = localStorage.getItem('devTrackerDB');
        
        if (savedDb) {
            const u8 = new Uint8Array(JSON.parse(savedDb));
            db = new SQL.Database(u8);
            // Run Migrations (Safely)
            try { db.run("SELECT * FROM quests LIMIT 1"); } catch { db.run("CREATE TABLE IF NOT EXISTS quests (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, target INTEGER, progress INTEGER, completed INTEGER, text TEXT, date TEXT, diff TEXT)"); saveDB(); }
            try { db.run("SELECT description FROM logs LIMIT 1"); } catch { db.run("ALTER TABLE logs ADD COLUMN description TEXT"); saveDB(); }
            try { db.run("SELECT * FROM tasks LIMIT 1"); } catch { db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, text TEXT, completed INTEGER)"); saveDB(); }
            try { db.run("SELECT * FROM daily_activities LIMIT 1"); } catch { 
                db.run("CREATE TABLE IF NOT EXISTS daily_activities (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT, task TEXT, duration INTEGER)"); 
                initializeDailyActivities();
                saveDB(); 
            }
        } else {
            db = new SQL.Database();
            db.run("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, time INTEGER, problem TEXT, platform TEXT, difficulty TEXT, tags TEXT, description TEXT, created_at TEXT)");
            db.run("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)");
            db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, text TEXT, completed INTEGER)");
            db.run("CREATE TABLE IF NOT EXISTS quests (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, target INTEGER, progress INTEGER, completed INTEGER, text TEXT, date TEXT, diff TEXT)");
            db.run("CREATE TABLE IF NOT EXISTS daily_activities (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT, task TEXT, duration INTEGER)");
            initializeDailyActivities();
            saveDB();
        }
        
        // Always set window.db after initialization
        window.db = db;

        // Check Onboarding Status - Only show on first use (when no username exists)
        const usernameRes = db.exec("SELECT value FROM settings WHERE key='username'");
        const hasUsername = usernameRes.length > 0;
        
        if (!hasUsername) {
            // First time use - show onboarding
            document.getElementById('onboardingModal').classList.remove('hidden');
            setTimeout(() => document.getElementById('onboardingModal').classList.add('active'), 10);
        } else {
            // Username exists - display it
            const el = document.getElementById('userNameDisplay');
            if(el) el.innerText = usernameRes[0].values[0][0];
        }

        // Load Weekly Goal
        const goalRes = db.exec("SELECT value FROM settings WHERE key='weeklyGoal'");
        if (goalRes.length && window.settings) window.settings.weeklyGoal = parseInt(goalRes[0].values[0][0]);

    } catch (err) {
        console.error("DB Init Failed:", err);
        alert("Database initialization failed. Please refresh or clear local data.");
    }
}

// Save to LocalStorage
function saveDB() {
    if(!db) return;
    const data = db.export();
    const arr = Array.from(data);
    try {
        localStorage.setItem('devTrackerDB', JSON.stringify(arr));
    } catch (e) {
        if (window.showToast) {
            window.showToast("Database too large for browser storage. Please Export Backup.", "error");
        } else {
            alert("Database too large for browser storage. Please Export Backup.");
        }
    }
}

// Export/Import
function exportDB() {
    if(!db) return;
    const data = db.export();
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `devtracker_backup_${new Date().toISOString().split('T')[0]}.sqlite`;
    a.click();
}

function importDB(input) {
    const file = input.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = async function() {
        try {
            if (!window.SQL) {
                window.SQL = await initSqlJs(SQL_CONFIG);
            }
            const u8 = new Uint8Array(r.result);
            db = new window.SQL.Database(u8);
            window.db = db;
            saveDB();
            location.reload();
        } catch(e) {
            alert("Invalid SQLite file.");
        }
    }
    r.readAsArrayBuffer(file);
}

// Expose importDB
window.importDB = importDB;

// Clear all user data
function clearAllData() {
    if (!confirm("⚠️ WARNING: This will delete ALL your data including logs, settings, quests, and tasks. This cannot be undone!\n\nAre you absolutely sure?")) {
        return;
    }
    
    if (!confirm("Last chance! This will permanently delete everything. Continue?")) {
        return;
    }
    
    try {
        // Clear localStorage
        localStorage.removeItem('devTrackerDB');
        localStorage.removeItem('lastQuestDate');
        
        // Show confirmation
        if (window.showToast) {
            window.showToast("All data cleared. Reloading...", "success");
        }
        
        // Reload page to reinitialize with fresh database
        setTimeout(() => {
            location.reload();
        }, 1000);
    } catch (e) {
        console.error("Error clearing data:", e);
        alert("Error clearing data. Please try again.");
    }
}

// Expose clearAllData
window.clearAllData = clearAllData;

// Initialize Daily Activities
function initializeDailyActivities() {
    const activities = [
        // Core Coding Activities
        { category: 'Core', task: 'Solve 1 LeetCode/HackerRank problem (Easy/Medium/Hard)', duration: 45 },
        { category: 'Core', task: 'Spend 45 minutes building a feature for a personal project', duration: 45 },
        { category: 'Core', task: 'Clean up code in an old project for 30 minutes', duration: 30 },
        { category: 'Core', task: 'Find and fix a bug in an open-source repo or your own code', duration: 30 },
        { category: 'Core', task: 'Sketch a system architecture for a theoretical app', duration: 30 },
        { category: 'Core', task: 'Review someone else\'s code (or your own from a month ago)', duration: 20 },
        
        // Learning & Growth
        { category: 'Learning', task: 'Read 1 page of official docs for a tool you use', duration: 15 },
        { category: 'Learning', task: 'Read a technical blog post on Hashnode or Medium', duration: 20 },
        { category: 'Learning', task: 'Watch a 20-minute tutorial on a new concept', duration: 20 },
        { category: 'Learning', task: 'Learn a new ES6+ feature or Python trick and use it', duration: 15 },
        { category: 'Learning', task: 'Learn 3 new terminal commands', duration: 10 },
        
        // Wellness & Soft Skills
        { category: 'Wellness', task: 'Take a 15-minute walk without your phone', duration: 15 },
        { category: 'Wellness', task: 'Drink a full glass of water before starting', duration: 1 },
        { category: 'Wellness', task: 'Adjust your chair and monitor height', duration: 5 },
        { category: 'Wellness', task: 'Comment on a tech post on LinkedIn or Twitter/X', duration: 10 },
        { category: 'Wellness', task: 'Write 3 lines about what you learned yesterday', duration: 5 },
        
        // Quick Wins
        { category: 'Quick', task: 'Clear your unread emails/notifications', duration: 10 },
        { category: 'Quick', task: 'Add one bullet point to your CV/Portfolio', duration: 10 },
        { category: 'Quick', task: 'Push a small change to GitHub to keep the streak alive', duration: 5 },
        { category: 'Quick', task: 'Learn one new IDE keyboard shortcut', duration: 5 },
        
        // Weekly/Monthly Review
        { category: 'Review', task: 'What went well this week? What didn\'t?', duration: 15 },
        { category: 'Review', task: 'Set goals for the next week', duration: 10 },
        { category: 'Review', task: 'Ensure your local projects are pushed to remote', duration: 10 }
    ];
    
    // Check if activities already exist
    const existing = db.exec("SELECT COUNT(*) as count FROM daily_activities");
    if (existing.length && existing[0].values[0][0] > 0) return;
    
    // Insert all activities
    activities.forEach(act => {
        db.run("INSERT INTO daily_activities (category, task, duration) VALUES (?, ?, ?)", [act.category, act.task, act.duration]);
    });
}

// Expose initDB to window
window.initDB = initDB;