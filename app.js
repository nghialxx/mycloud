// ============================================================
// CONFIGURATION - USER MUST REPLACE THESE VALUES
// ============================================================
const SUPABASE_URL = 'https://pvxyporcjqavwpehglag.supabase.co';  
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eHlwb3JjanFhdndwZWhnbGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDE4NjQsImV4cCI6MjA3MTA3Nzg2NH0.aSc08LE1pq-soFq-IB5Z_f1bEvffn82QmaEzLy1qcD8';         
const BUCKET_NAME = 'files';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Hardcoded password hash (SHA-256 of "password")
const AUTH_HASH = 'cd1575bf99398a48ae4f51e6618d2a89af7e8f16fdc89598acaf385b1b460679';

// ============================================================
// SUPABASE CLIENT
// ============================================================
let supabase;

try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
    console.error('Failed to initialize Supabase:', error);
}

// ============================================================
// AUTHENTICATION SYSTEM
// ============================================================

// SHA-256 hashing function
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if user is logged in (session)
function isLoggedIn() {
    return sessionStorage.getItem('authenticated') === 'true';
}

// Verify password against hardcoded hash
async function verifyPassword(password) {
    const hash = await hashPassword(password);
    return hash === AUTH_HASH;
}

// Logout
function logout() {
    sessionStorage.removeItem('authenticated');
    showLoginScreen();
}

// Show/hide screens
function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('password-input').value = '';
    document.getElementById('login-error').style.display = 'none';
}

function showMainApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    loadFiles();
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================
// FILE UTILITIES
// ============================================================

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function generateUniqueFilename(filename) {
    const timestamp = Date.now();
    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDotIndex === -1) {
        return `${filename}_${timestamp}`;
    }

    const name = filename.substring(0, lastDotIndex);
    const ext = filename.substring(lastDotIndex);
    return `${name}_${timestamp}${ext}`;
}

// ============================================================
// FILE UPLOAD
// ============================================================

async function uploadFile(file) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        showToast('File exceeds 50MB limit', 'error');
        return false;
    }

    // Show progress
    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    progressDiv.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = `Uploading ${file.name}...`;

    try {
        // Check if file already exists
        const { data: existingFiles } = await supabase.storage
            .from(BUCKET_NAME)
            .list('', { search: file.name });

        let filename = file.name;
        if (existingFiles && existingFiles.length > 0) {
            filename = generateUniqueFilename(file.name);
        }

        // Upload file
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Simulate progress (Supabase doesn't provide upload progress)
        progressFill.style.width = '100%';

        setTimeout(() => {
            progressDiv.style.display = 'none';
        }, 500);

        showToast('File uploaded successfully', 'success');
        return true;

    } catch (error) {
        console.error('Upload error:', error);
        progressDiv.style.display = 'none';

        if (error.message.includes('not found')) {
            showToast('Storage not configured. Check Supabase setup.', 'error');
        } else {
            showToast('Upload failed. Try again.', 'error');
        }
        return false;
    }
}

async function handleFileSelection(files) {
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    // Upload files sequentially
    for (const file of fileArray) {
        await uploadFile(file);
    }

    // Refresh file list after all uploads
    await loadFiles();
}

// ============================================================
// FILE LIST
// ============================================================

async function loadFiles() {
    const filesList = document.getElementById('files-list');
    const filesCount = document.getElementById('files-count');

    filesList.innerHTML = '<div class="loading">Loading files...</div>';

    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list('', {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) throw error;

        // Filter out directory markers
        const files = data.filter(file => file.name && file.id);

        filesCount.textContent = `Files (${files.length})`;

        if (files.length === 0) {
            filesList.innerHTML = '<div class="empty-state">No files yet. Upload your first file!</div>';
            return;
        }

        filesList.innerHTML = '';

        files.forEach(file => {
            const fileItem = createFileItem(file);
            filesList.appendChild(fileItem);
        });

    } catch (error) {
        console.error('Load files error:', error);
        filesList.innerHTML = '<div class="empty-state">Failed to load files. Check your connection.</div>';

        if (error.message.includes('not found')) {
            showToast('Storage not configured. Check Supabase setup.', 'error');
        } else {
            showToast('Failed to load files', 'error');
        }
    }
}

function createFileItem(file) {
    const div = document.createElement('div');
    div.className = 'file-item';

    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';

    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = file.name;

    const fileMeta = document.createElement('div');
    fileMeta.className = 'file-meta';

    const fileSize = document.createElement('span');
    fileSize.textContent = formatFileSize(file.metadata?.size || 0);

    const fileDate = document.createElement('span');
    fileDate.textContent = formatDate(file.created_at);

    fileMeta.appendChild(fileSize);
    fileMeta.appendChild(fileDate);

    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileMeta);

    const actions = document.createElement('div');
    actions.className = 'file-actions';

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn-secondary btn-small';
    downloadBtn.textContent = 'Download';
    downloadBtn.onclick = () => downloadFile(file.name);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-small';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteFile(file.name);

    actions.appendChild(downloadBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(fileInfo);
    div.appendChild(actions);

    return div;
}

// ============================================================
// FILE DOWNLOAD
// ============================================================

async function downloadFile(filename) {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filename, 60);

        if (error) throw error;

        // Trigger download
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Download started', 'success');

    } catch (error) {
        console.error('Download error:', error);
        showToast('Download failed. Try again.', 'error');
    }
}

// ============================================================
// FILE DELETE
// ============================================================

async function deleteFile(filename) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
        return;
    }

    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filename]);

        if (error) throw error;

        showToast('File deleted successfully', 'success');
        await loadFiles();

    } catch (error) {
        console.error('Delete error:', error);
        showToast('Could not delete file. Try again.', 'error');
    }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state
    if (isLoggedIn()) {
        showMainApp();
    } else {
        showLoginScreen();
    }

    // Login form
    const passwordInput = document.getElementById('password-input');
    const unlockBtn = document.getElementById('unlock-btn');
    const loginError = document.getElementById('login-error');

    unlockBtn.addEventListener('click', async () => {
        const password = passwordInput.value;

        if (!password) {
            loginError.textContent = 'Please enter a password';
            loginError.style.display = 'block';
            return;
        }

        // Verify password
        const isValid = await verifyPassword(password);
        if (isValid) {
            sessionStorage.setItem('authenticated', 'true');
            showMainApp();
        } else {
            loginError.textContent = 'Incorrect password';
            loginError.style.display = 'block';
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            unlockBtn.click();
        }
    });

    passwordInput.addEventListener('input', () => {
        loginError.style.display = 'none';
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);

    // File upload - drag and drop
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFileSelection(e.target.files);
        e.target.value = ''; // Reset input
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFileSelection(e.dataTransfer.files);
    });

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', loadFiles);
});
