// Travel Journal Application
class TravelJournal {
    constructor() {
        this.currentPage = 'home';
        this.journalData = {
            'santorini-2024': {
                title: 'Santorini Dreams', location: 'Santorini, Greece', date: 'March 15-22, 2024',
                image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                description: 'Seven magical days exploring the stunning island of Santorini, from the breathtaking sunsets in Oia to the volcanic beaches of Kamari.',
                highlights: ['Watched the most incredible sunset from Oia castle', 'Explored the ancient ruins of Akrotiri', 'Wine tasting at Santos Winery with caldera views', 'Swimming at Red Beach and Kamari Beach', 'Traditional Greek cooking class in Pyrgos'],
                companions: ['Sarah', 'Mike'], tags: ['Greece', 'Islands', 'Sunset', 'Wine', 'Beach', 'History'],
                totalPhotos: 347, favoriteMemory: 'Sitting on the edge of Oia watching the sun melt into the Aegean Sea while sharing a bottle of Assyrtiko wine.'
            },
            'japan-spring-2024': {
                title: 'Cherry Blossom Season', location: 'Kyoto, Japan', date: 'April 3-12, 2024',
                image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                description: 'An unforgettable journey through Japan during peak cherry blossom season, experiencing traditional culture and breathtaking natural beauty.',
                highlights: ['Hanami picnic under cherry blossoms in Maruyama Park', 'Early morning visit to Fushimi Inari shrine', 'Traditional tea ceremony in Gion district', 'Bamboo grove walk in Arashiyama', 'Golden Pavilion at sunrise'],
                companions: ['Emma'], tags: ['Japan', 'Cherry Blossoms', 'Culture', 'Temples', 'Traditional', 'Spring'],
                totalPhotos: 423, favoriteMemory: 'The serene moment of meditation in Ryoan-ji\'s rock garden as cherry petals danced in the morning breeze.'
            },
            'peru-adventure-2023': {
                title: 'Machu Picchu Adventure', location: 'Cusco, Peru', date: 'September 10-18, 2023',
                image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                description: 'An epic adventure through the Sacred Valley culminating in the breathtaking sunrise over Machu Picchu after completing the classic Inca Trail.',
                highlights: ['4-day Inca Trail trek with amazing guides', 'Sunrise over Machu Picchu from Huayna Picchu', 'Exploring Ollantaytambo fortress', 'Traditional weaving demonstration in Chinchero', 'Ceviche cooking class in Cusco'],
                companions: ['Alex', 'Jordan', 'Maya'], tags: ['Peru', 'Hiking', 'Ancient Ruins', 'Adventure', 'Mountains', 'Culture'],
                totalPhotos: 289, favoriteMemory: 'Standing at the Sun Gate at dawn, watching the first rays of sunlight illuminate the lost city of the Incas.'
            }
        };
        this.sections = [{ id: 1, content: '' }];
        this.photos = []; this.tags = []; this.locations = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showPage('home');
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const svg = sidebarToggle?.querySelector('svg');
        
        if (svg && sidebar) {
            const isCollapsed = sidebar.classList.contains('collapsed');
            svg.innerHTML = isCollapsed ? 
                '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>' :
                '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
        }
    }

    setupEventListeners() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        sidebarToggle?.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            this.updateToggleIcon();
        });

        document.addEventListener('click', (e) => {
            // Close sidebar when clicking outside on mobile
            if (window.innerWidth <= 768) {
                const isClickInsideSidebar = sidebar.contains(e.target);
                const isClickOnToggle = sidebarToggle.contains(e.target);
                if (!isClickInsideSidebar && !isClickOnToggle && !sidebar.classList.contains('collapsed')) {
                    sidebar.classList.add('collapsed');
                    this.updateToggleIcon();
                }
            }
            
            // Navigation
            const navItem = e.target.closest('[data-page]');
            if (navItem) {
                e.preventDefault();
                this.showPage(navItem.dataset.page);
            }

            const journalEntry = e.target.closest('[data-journal]');
            if (journalEntry) {
                e.preventDefault();
                this.showJournal(journalEntry.dataset.journal);
            }
        });

        this.setupCreateJournalListeners();
        this.setupModalListeners();
        this.setupThemeToggle();
    }

    setupCreateJournalListeners() {
        // Add section
        const addSectionBtn = document.getElementById('addSection');
        addSectionBtn?.addEventListener('click', () => {
            this.addSection();
        });

        // Upload photo
        const uploadPhotoBtn = document.getElementById('uploadPhoto');
        const photoInput = document.getElementById('photoInput');
        
        uploadPhotoBtn?.addEventListener('click', () => {
            photoInput?.click();
        });

        photoInput?.addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });

        // Add tag
        const addTagBtn = document.getElementById('addTag');
        const tagInput = document.getElementById('tagInput');
        
        addTagBtn?.addEventListener('click', () => {
            this.addTag();
        });

        tagInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTag();
            }
        });

        // Save journal
        const saveJournalBtn = document.getElementById('saveJournal');
        saveJournalBtn?.addEventListener('click', () => {
            this.saveJournal();
        });

        // Map setup
        const setupMapBtn = document.getElementById('setupMap');
        setupMapBtn?.addEventListener('click', () => {
            this.showMapModal();
        });
    }

    setupModalListeners() {
        const modal = document.getElementById('mapModal');
        const modalClose = document.getElementById('modalClose');
        const initializeMapBtn = document.getElementById('initializeMap');

        modalClose?.addEventListener('click', () => {
            this.hideMapModal();
        });

        initializeMapBtn?.addEventListener('click', () => {
            this.initializeMap();
        });

        // Close modal on outside click
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideMapModal();
            }
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const body = document.body;
        
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme') || 'light';
        body.classList.toggle('dark', savedTheme === 'dark');
        
        themeToggle?.addEventListener('click', () => {
            body.classList.toggle('dark');
            const isDark = body.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Update theme toggle icon
            this.updateThemeIcon(isDark);
        });
        
        // Set initial icon
        this.updateThemeIcon(body.classList.contains('dark'));
    }

    updateThemeIcon(isDark) {
        const themeToggle = document.getElementById('themeToggle');
        const svg = themeToggle?.querySelector('svg');
        
        if (svg) {
            if (isDark) {
                // Show sun icon for dark mode
                svg.innerHTML = `
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                `;
            } else {
                // Show moon icon for light mode
                svg.innerHTML = `
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                `;
            }
        }
    }

    showPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-page="${page}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update sidebar journal entries
        document.querySelectorAll('.journal-entry').forEach(entry => {
            entry.classList.remove('active');
        });
    }

    showJournal(journalId) {
        const journal = this.journalData[journalId];
        if (!journal) {
            this.showToast('Journal not found', 'The journal entry you\'re looking for doesn\'t exist.', 'error');
            return;
        }

        this.renderJournalPage(journal);
        this.showPage('journal');
    }

    renderJournalPage(journal) {
        const journalPage = document.getElementById('journal-page');
        if (!journalPage) return;

        journalPage.innerHTML = `
            <!-- Hero Section -->
            <div class="journal-hero">
                <img src="${journal.image}" alt="${journal.title}">
                <div class="journal-hero-overlay"></div>
                <div class="journal-hero-content">
                    <h1 class="journal-hero-title">${journal.title}</h1>
                    <div class="journal-hero-meta">
                        <div class="journal-hero-meta-item">
                            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            ${journal.location}
                        </div>
                        <div class="journal-hero-meta-item">
                            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            ${journal.date}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="container">
                <!-- Stats -->
                <div class="journal-stats">
                    <div class="journal-stat">
                        <svg class="journal-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                        <p class="journal-stat-number">${journal.totalPhotos}</p>
                        <p class="journal-stat-label">Photos Captured</p>
                    </div>
                    <div class="journal-stat">
                        <svg class="journal-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <p class="journal-stat-number">${journal.highlights.length}</p>
                        <p class="journal-stat-label">Highlights</p>
                    </div>
                    <div class="journal-stat">
                        <svg class="journal-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p class="journal-stat-number">${journal.companions.length}</p>
                        <p class="journal-stat-label">Travel Companions</p>
                    </div>
                </div>

                <!-- Description -->
                <div class="journal-content">
                    <div class="journal-section">
                        <h2 class="journal-section-title">About This Journey</h2>
                        <p class="journal-section-content">${journal.description}</p>
                    </div>

                    <!-- Highlights -->
                    <div class="journal-section">
                        <h2 class="journal-section-title">Trip Highlights</h2>
                        <ul class="journal-highlights">
                            ${journal.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                        </ul>
                    </div>

                    <!-- Companions -->
                    ${journal.companions.length > 0 ? `
                    <div class="journal-section">
                        <h2 class="journal-section-title">Travel Companions</h2>
                        <div class="journal-companions">
                            ${journal.companions.map(companion => `<span class="tag">${companion}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Favorite Memory -->
                    <div class="journal-favorite">
                        <h2 class="journal-favorite-title">Favorite Memory</h2>
                        <p class="journal-favorite-content">"${journal.favoriteMemory}"</p>
                    </div>

                    <!-- Tags -->
                    <div class="journal-section">
                        <h2 class="journal-section-title">Tags</h2>
                        <div class="journal-tags">
                            ${journal.tags.map(tag => `<span class="journal-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    addSection() {
        const sectionsContainer = document.getElementById('sectionsContainer');
        if (!sectionsContainer) return;

        const sectionCount = sectionsContainer.children.length + 1;
        const sectionHTML = `
            <div class="section-item">
                <div class="section-header">
                    <span class="section-label">Section ${sectionCount}</span>
                    ${sectionCount > 1 ? `
                    <button class="btn btn-sm" onclick="this.parentElement.parentElement.remove()">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    ` : ''}
                </div>
                <textarea class="form-textarea" placeholder="Write about your experience..."></textarea>
            </div>
        `;

        sectionsContainer.insertAdjacentHTML('beforeend', sectionHTML);
    }

    handlePhotoUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Invalid file type', 'Please select an image file', 'error');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('File too large', 'Please select an image smaller than 10MB', 'error');
            return;
        }

        // Create preview URL
        const url = URL.createObjectURL(file);
        this.addPhoto(url);
    }

    addPhoto(url, caption = '') {
        const photosContainer = document.getElementById('photosContainer');
        if (!photosContainer) return;

        // Remove empty state if it exists
        const emptyState = photosContainer.querySelector('.photos-empty');
        if (emptyState) {
            emptyState.remove();
        }

        // Add photos grid if it doesn't exist
        if (!photosContainer.querySelector('.photos-grid')) {
            photosContainer.innerHTML = '<div class="photos-grid"></div>';
        }

        const photosGrid = photosContainer.querySelector('.photos-grid');
        const photoId = Date.now();
        
        const photoHTML = `
            <div class="photo-item" data-photo-id="${photoId}">
                <img src="${url}" alt="Travel photo">
                <div class="photo-overlay">
                    <button class="btn btn-sm" onclick="this.closest('.photo-item').remove()">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                ${caption ? `<div class="photo-caption">${caption}</div>` : ''}
            </div>
        `;

        photosGrid.insertAdjacentHTML('beforeend', photoHTML);
        this.photos.push({ id: photoId, url, caption });
        this.showToast('Photo added!', 'Your photo has been added to the journal', 'success');
    }

    addTag() {
        const tagInput = document.getElementById('tagInput');
        const tagsContainer = document.getElementById('tagsContainer');
        
        if (!tagInput || !tagsContainer) return;

        const tagText = tagInput.value.trim();
        if (!tagText || this.tags.includes(tagText)) {
            return;
        }

        this.tags.push(tagText);
        
        const tagHTML = `
            <div class="tag-item">
                ${tagText}
                <button class="tag-remove" onclick="this.parentElement.remove(); app.removeTag('${tagText}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;

        tagsContainer.insertAdjacentHTML('beforeend', tagHTML);
        tagInput.value = '';
    }

    removeTag(tagText) {
        this.tags = this.tags.filter(tag => tag !== tagText);
    }

    saveJournal() {
        const title = document.getElementById('tripTitle')?.value.trim();
        const location = document.getElementById('tripLocation')?.value.trim();
        const date = document.getElementById('tripDate')?.value;

        if (!title) {
            this.showToast('Title required', 'Please add a title for your journal', 'error');
            return;
        }

        // Get sections content
        const sections = Array.from(document.querySelectorAll('.section-item textarea')).map(textarea => textarea.value.trim());

        // Here you would save to your backend/database
        const journalData = {
            title,
            location,
            date,
            sections,
            photos: this.photos,
            tags: this.tags,
            locations: this.locations
        };

        console.log('Saving journal:', journalData);
        this.showToast('Journal saved!', 'Your travel journal has been saved successfully', 'success');
        
        // Reset form
        this.resetCreateForm();
    }

    resetCreateForm() {
        // Reset form fields
        document.getElementById('tripTitle').value = '';
        document.getElementById('tripLocation').value = '';
        document.getElementById('tripDate').value = '';
        
        // Reset sections
        const sectionsContainer = document.getElementById('sectionsContainer');
        if (sectionsContainer) {
            sectionsContainer.innerHTML = `
                <div class="section-item">
                    <div class="section-header">
                        <span class="section-label">Section 1</span>
                    </div>
                    <textarea class="form-textarea" placeholder="Write about your experience..."></textarea>
                </div>
            `;
        }

        // Reset photos
        const photosContainer = document.getElementById('photosContainer');
        if (photosContainer) {
            photosContainer.innerHTML = `
                <div class="photos-empty">
                    <svg class="photos-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <p class="photos-empty-text">No photos added yet</p>
                    <p class="photos-empty-subtext">Click "Upload Photo" to add your first image</p>
                </div>
            `;
        }

        // Reset tags
        const tagsContainer = document.getElementById('tagsContainer');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
        }

        // Reset data
        this.sections = [{ id: 1, content: '' }];
        this.photos = [];
        this.tags = [];
        this.locations = [];
    }

    showMapModal() {
        const modal = document.getElementById('mapModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideMapModal() {
        const modal = document.getElementById('mapModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    initializeMap() {
        const tokenInput = document.getElementById('mapboxToken');
        const token = tokenInput?.value.trim();
        
        if (!token) {
            this.showToast('Token required', 'Please enter a valid Mapbox token', 'error');
            return;
        }

        // Here you would initialize the map with the token
        // For now, we'll just show a success message
        this.showToast('Map loaded!', 'You can now add locations to your journal', 'success');
        this.hideMapModal();
        
        // Update map placeholder
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="map-placeholder">
                    <svg class="map-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <h3 class="map-placeholder-title">Map Ready</h3>
                    <p class="map-placeholder-text">Click to add locations to your journey</p>
                    <button class="btn btn-outline" onclick="app.addLocation()">Add Location</button>
                </div>
            `;
        }
    }

    addLocation() {
        // This would open a dialog to add a location
        // For now, we'll just show a placeholder
        this.showToast('Location added', 'Location has been added to your journey', 'success');
    }

    showToast(title, description, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-description">${description}</div>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TravelJournal();
});

// Handle responsive sidebar
function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        sidebar.classList.add('mobile');
    } else {
        sidebar.classList.remove('collapsed');
        sidebar.classList.remove('mobile');
    }
    
    // Update toggle icon
    if (window.app) {
        window.app.updateToggleIcon();
    }
}

window.addEventListener('resize', handleResize);
handleResize(); // Initial call
