// =============================================
// PREMIUM DARK PORTFOLIO - MAIN JS
// STANDARDIZED VERSION - Compatible with aesthetic-portfolio JSON structure
// =============================================

document.addEventListener('DOMContentLoaded', () => initializeApp());

async function initializeApp() {
    try {
        await Promise.all([
            loadSiteConfig(),
            loadNavigation(),
            loadHero(),
            loadAbout(),
            loadExperience(),
            loadProjects(),
            loadSkills(),
            loadEducation(),
            loadContact(),
            loadFooter()
        ]);
        initializeNavigation();
        initializeScrollEffects();
        initializeBackToTop();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

async function loadSiteConfig() {
    try {
        const data = await fetch('data/site-config.json').then(r => r.json());
        document.title = data.title;
        document.querySelector('meta[name="description"]').content = data.description;
        document.querySelector('meta[name="author"]').content = data.author;
    } catch (error) {
        console.error('Error loading site config:', error);
    }
}

async function loadNavigation() {
    try {
        const data = await fetch('data/navigation.json').then(r => r.json());
        document.getElementById('nav-brand').textContent = data.brand.name;
        document.getElementById('nav-menu').innerHTML = data.menuItems.map(item =>
            `<li><a href="${item.href}" class="nav-link">${item.text}</a></li>`
        ).join('');
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
}

async function loadHero() {
    try {
        const data = await fetch('data/hero.json').then(r => r.json());

        // Support both old and new structure
        const greeting = data.greeting || '';
        const name = data.name || '';
        const title = data.title || '';
        const summary = data.summary || data.tagline || '';
        const description = data.description || '';

        document.getElementById('hero-greeting').textContent = greeting;
        document.getElementById('hero-name').textContent = name;
        document.getElementById('hero-title').textContent = title;
        document.getElementById('hero-tagline').textContent = summary;
        document.getElementById('hero-description').textContent = description || summary;

        // Handle CTA - support both structures
        const ctaElement = document.getElementById('hero-cta');
        if (ctaElement) {
            let buttons = [];
            if (data.cta && data.cta.buttons) {
                // New structure: { buttons: [...] }
                buttons = data.cta.buttons;
            } else if (Array.isArray(data.cta)) {
                // Old structure: [...]
                buttons = data.cta;
            }

            ctaElement.innerHTML = buttons.map(btn =>
                `<a href="${btn.href}" class="btn btn-${btn.type}">${btn.text}</a>`
            ).join('');
        }

        const socialElement = document.getElementById('hero-social');
        if (socialElement && data.socialLinks) {
            socialElement.innerHTML = data.socialLinks.map(link =>
                `<a href="${link.url}" target="_blank" class="social-link" aria-label="${link.platform}"><i class="${link.icon}"></i></a>`
            ).join('');
        }

        // Handle stats/highlights - support both
        const statsElement = document.getElementById('hero-stats');
        if (statsElement) {
            const highlights = data.highlights || data.stats || [];
            statsElement.innerHTML = highlights.map(item => {
                // Support both formats
                const number = item.number || item.text || '';
                const label = item.label || '';
                return `<div class="stat-item"><span class="stat-number">${number}</span><span class="stat-label">${label}</span></div>`;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading hero:', error);
    }
}

async function loadAbout() {
    try {
        const data = await fetch('data/about.json').then(r => r.json());
        document.getElementById('about-title').textContent = data.sectionTitle;
        document.getElementById('about-content').innerHTML = data.content.map(p => `<p>${p}</p>`).join('');
        document.getElementById('about-highlights').innerHTML = data.highlights.map(h =>
            `<div class="highlight-card"><i class="${h.icon}"></i><h3>${h.title}</h3><p>${h.description}</p></div>`
        ).join('');
    } catch (error) {
        console.error('Error loading about:', error);
    }
}

// NEW: Load work experience (STANDARDIZED)
async function loadExperience() {
    try {
        const data = await fetch('data/experience.json').then(r => r.json());
        // Experience section rendering - template may not have this section
        console.log('Experience data loaded:', data);
    } catch (error) {
        console.error('Error loading experience:', error);
    }
}

// Load projects (STANDARDIZED - was part of loadWork)
async function loadProjects() {
    try {
        const data = await fetch('data/projects.json').then(r => r.json());
        const workTitle = document.getElementById('work-title');
        if (workTitle) workTitle.textContent = data.sectionTitle || 'Featured Work';

        const workGrid = document.getElementById('work-grid');
        const projects = data.projects || data.items || [];

        if (workGrid && projects.length > 0) {
            workGrid.innerHTML = projects.map(project => {
                // Support both "technologies" and "tags"
                const tags = project.technologies || project.tags || [];

                return `<div class="work-card">
                    <div class="work-image" style="background-image: url('${project.image}')">
                        <div class="work-icon"><i class="${project.icon}"></i></div>
                    </div>
                    <div class="work-content">
                        <p class="work-category">${project.category}</p>
                        <h3 class="work-title">${project.title}</h3>
                        <p class="work-description">${project.description}</p>
                        <div class="work-tags">
                            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function loadSkills() {
    try {
        const data = await fetch('data/skills.json').then(r => r.json());
        document.getElementById('skills-title').textContent = data.sectionTitle;
        document.getElementById('skills-grid').innerHTML = data.categories.map(cat =>
            `<div class="skill-category">
                <div class="skill-category-header">
                    <i class="${cat.icon}"></i>
                    <h3 class="skill-category-name">${cat.name}</h3>
                </div>
                <div class="skill-list">
                    ${cat.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>`
        ).join('');
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

// NEW: Load education (STANDARDIZED)
async function loadEducation() {
    try {
        const data = await fetch('data/education.json').then(r => r.json());
        // Education section rendering - template may not display this
        console.log('Education data loaded (not displayed in this template):', data);
    } catch (error) {
        console.error('Error loading education:', error);
    }
}

async function loadContact() {
    try {
        const data = await fetch('data/contact.json').then(r => r.json());
        document.getElementById('contact-title').textContent = data.sectionTitle;
        document.getElementById('contact-subtitle').textContent = data.subtitle;
        document.getElementById('contact-info').innerHTML = `
            <div class="contact-item"><i class="fas fa-envelope"></i> <a href="mailto:${data.email}">${data.email}</a></div>
            <div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${data.location}</div>
            <div class="contact-item"><i class="fas fa-clock"></i> ${data.availability}</div>
        `;
        document.getElementById('contact-social').innerHTML = data.socialLinks.map(link =>
            `<a href="${link.url}" target="_blank" class="social-link" aria-label="${link.platform}"><i class="${link.icon}"></i></a>`
        ).join('');
    } catch (error) {
        console.error('Error loading contact:', error);
    }
}

async function loadFooter() {
    try {
        const data = await fetch('data/footer.json').then(r => r.json());
        document.getElementById('footer-text').textContent = data.text;
        document.getElementById('footer-copyright').textContent = data.copyright;
        document.getElementById('footer-links').innerHTML = data.links.map(link =>
            `<a href="${link.href}">${link.text}</a>`
        ).join('');
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => navMenu.classList.remove('active'));
        });
    }
}

function initializeScrollEffects() {
    const sections = document.querySelectorAll('section');
    const observerOptions = { threshold: 0.1, rootMargin: '-50px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, observerOptions);
    sections.forEach(section => observer.observe(section));
}

function initializeBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
