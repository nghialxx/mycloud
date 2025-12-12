// ============================================================
// CONFIGURATION
// ============================================================
const API_URL = 'https://temp-storage-api.gooners.workers.dev';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ============================================================
// AUTHENTICATION SYSTEM
// ============================================================

// Get stored token
function getToken() {
    return sessionStorage.getItem('token');
}

// Check if user is logged in
function isLoggedIn() {
    return getToken() !== null;
}

// Login with API
async function login(password) {
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await res.json();

        if (res.ok) {
            sessionStorage.setItem('token', data.token);
            return { success: true };
        } else {
            return { success: false, error: data.error || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Check your connection.' };
    }
}

// Logout
function logout() {
    sessionStorage.removeItem('token');
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

    const token = getToken();
    if (!token) {
        showToast('Not authenticated', 'error');
        logout();
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
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (res.status === 401) {
            showToast('Session expired. Please login again.', 'error');
            logout();
            return false;
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Upload failed');
        }

        // Simulate progress
        progressFill.style.width = '100%';

        setTimeout(() => {
            progressDiv.style.display = 'none';
        }, 500);

        showToast('File uploaded successfully', 'success');
        return true;

    } catch (error) {
        console.error('Upload error:', error);
        progressDiv.style.display = 'none';
        showToast(error.message || 'Upload failed. Try again.', 'error');
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
    const token = getToken();

    if (!token) {
        logout();
        return;
    }

    filesList.innerHTML = '<div class="loading">Loading files...</div>';

    try {
        const res = await fetch(`${API_URL}/files`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            showToast('Session expired. Please login again.', 'error');
            logout();
            return;
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to load files');
        }

        // API returns array directly, not wrapped in { files: [...] }
        const files = Array.isArray(data) ? data : (data.files || []);

        console.log('Loaded files:', files);
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
        showToast(error.message || 'Failed to load files', 'error');
    }
}

function createFileItem(file) {
    console.log('Creating file item:', file);
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
    const token = getToken();
    if (!token) {
        logout();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/download/${encodeURIComponent(filename)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            showToast('Session expired. Please login again.', 'error');
            logout();
            return;
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Download failed');
        }

        // Trigger download using the signed URL
        const link = document.createElement('a');
        link.href = data.url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Download started', 'success');

    } catch (error) {
        console.error('Download error:', error);
        showToast(error.message || 'Download failed. Try again.', 'error');
    }
}

// ============================================================
// FILE DELETE
// ============================================================

async function deleteFile(filename) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
        return;
    }

    const token = getToken();
    if (!token) {
        logout();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/delete/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            showToast('Session expired. Please login again.', 'error');
            logout();
            return;
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Delete failed');
        }

        showToast('File deleted successfully', 'success');
        await loadFiles();

    } catch (error) {
        console.error('Delete error:', error);
        showToast(error.message || 'Could not delete file. Try again.', 'error');
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

        // Disable button during login
        unlockBtn.disabled = true;
        unlockBtn.textContent = 'Logging in...';

        // Login via API
        const result = await login(password);

        unlockBtn.disabled = false;
        unlockBtn.textContent = 'Unlock';

        if (result.success) {
            showMainApp();
        } else {
            loginError.textContent = result.error || 'Incorrect password';
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
