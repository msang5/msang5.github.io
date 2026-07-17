/* Portfolio content loader and interaction layer. */

document.addEventListener('DOMContentLoaded', initializeApp);

const DATA_ROOT = 'data/';
const externalUrl = /^(https?:\/\/)/i;

async function getJson(file) {
    const response = await fetch(`${DATA_ROOT}${file}`);
    if (!response.ok) throw new Error(`Could not load ${file} (${response.status})`);
    return response.json();
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function safeUrl(value = '') {
    const url = String(value).trim();
    return /^(https?:|mailto:|tel:|#)/i.test(url) ? url : '#';
}

function safeAssetUrl(value = '') {
    const url = String(value).trim();
    return /^(https?:|assets\/)/i.test(url) ? url : '';
}

function linkAttributes(url) {
    return externalUrl.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
}

function humanize(value = '') {
    return String(value)
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function setText(id, value = '') {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

async function initializeApp() {
    const results = await Promise.allSettled([
        loadSiteConfig(), loadNavigation(), loadHero(), loadAbout(), loadExperience(),
        loadProjects(), loadSkills(), loadEducation(), loadContact(), loadFooter()
    ]);

    const failures = results.filter(result => result.status === 'rejected');
    failures.forEach(result => {
        console.error('Portfolio content failed to load:', result.reason);
    });
    if (failures.length) showContentError();

    initializeNavigation();
    initializeScrollEffects();
    initializeBackToTop();
}

function showContentError() {
    const status = document.getElementById('content-status');
    if (!status) return;
    status.textContent = 'Some portfolio content could not be loaded. Please refresh the page and try again.';
    status.hidden = false;
}

async function loadSiteConfig() {
    const data = await getJson('site-config.json');
    const meta = data.meta || data;
    document.title = meta.title || document.title;
    setMeta('description', meta.description);
    setMeta('author', meta.author);
    setMeta('keywords', meta.keywords);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);

    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
}

function setMeta(nameOrType, name, value) {
    let selector;
    let content;
    if (value === undefined) {
        selector = `meta[name="${nameOrType}"]`;
        content = name;
    } else {
        selector = `meta[${nameOrType}="${name}"]`;
        content = value;
    }
    if (content) document.querySelector(selector)?.setAttribute('content', content);
}

async function loadNavigation() {
    const data = await getJson('navigation.json');
    const brand = data.brand || {};
    const brandElement = document.getElementById('nav-brand');
    if (brandElement) {
        brandElement.textContent = brand.name || 'MS';
        brandElement.href = safeUrl(brand.href || '#home');
        brandElement.setAttribute('aria-label', `Go to ${brand.name || 'home'}`);
    }

    const menu = document.getElementById('nav-menu');
    const items = data.menuItems || [];
    if (menu) {
        menu.innerHTML = items.map(item => {
            const href = safeUrl(item.href);
            return `<li><a href="${escapeHtml(href)}" class="nav-link">${escapeHtml(item.text)}</a></li>`;
        }).join('');
    }
}

async function loadHero() {
    const data = await getJson('hero.json');
    const summary = data.summary || data.tagline || '';
    setText('hero-greeting', data.greeting);
    setText('hero-name', data.name);
    setText('hero-title', data.title);
    setText('hero-tagline', summary);
    setText('hero-description', data.description || '');

    const buttons = data.cta?.buttons || (Array.isArray(data.cta) ? data.cta : []);
    const cta = document.getElementById('hero-cta');
    if (cta) {
        cta.innerHTML = buttons.map(button => {
            const href = safeUrl(button.href);
            const type = button.type === 'secondary' ? 'secondary' : 'primary';
            return `<a href="${escapeHtml(href)}" class="btn btn-${type}"${linkAttributes(href)}>${escapeHtml(button.text)}</a>`;
        }).join('');
    }

    renderSocialLinks('hero-social', data.socialLinks || []);
    const stats = data.highlights || data.stats || [];
    const statsElement = document.getElementById('hero-stats');
    if (statsElement) {
        statsElement.innerHTML = stats.map(item => {
            const value = item.value ?? item.number ?? item.text ?? '';
            return `<div class="stat-item"><span class="stat-number">${escapeHtml(value)}</span><span class="stat-label">${escapeHtml(item.label)}</span></div>`;
        }).join('');
    }
}

function renderSocialLinks(id, links) {
    const element = document.getElementById(id);
    if (!element) return;
    element.innerHTML = links.map(link => {
        const url = safeUrl(link.url);
        return `<a href="${escapeHtml(url)}"${linkAttributes(url)} class="social-link" aria-label="${escapeHtml(link.platform)}"><i class="${escapeHtml(link.icon || 'fas fa-link')}" aria-hidden="true"></i></a>`;
    }).join('');
}

async function loadAbout() {
    const data = await getJson('about.json');
    setText('about-title', data.sectionTitle || 'About');
    const content = document.getElementById('about-content');
    if (content) content.innerHTML = (data.content || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');

    const highlights = document.getElementById('about-highlights');
    if (highlights) highlights.innerHTML = (data.highlights || []).map(item => `
        <article class="highlight-card">
            <i class="${escapeHtml(item.icon || 'fas fa-check')}" aria-hidden="true"></i>
            <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>
        </article>`).join('');
}

async function loadExperience() {
    const data = await getJson('experience.json');
    setText('experience-title', data.sectionTitle || 'Experience');
    const list = document.getElementById('experience-list');
    if (!list) return;
    list.innerHTML = (data.experiences || []).map(experience => {
        const points = experience.responsibilities || String(experience.description || '').split('\n').filter(Boolean);
        return `<article class="timeline-item">
            <div class="timeline-marker" aria-hidden="true"></div>
            <div class="timeline-card">
                <div class="timeline-heading"><div><h3>${escapeHtml(experience.title)}</h3><div class="company-identity">${safeAssetUrl(experience.logo) ? `<img class="company-logo" src="${escapeHtml(safeAssetUrl(experience.logo))}" alt="${escapeHtml(experience.company)} logo" loading="lazy">` : ''}<p class="timeline-company">${escapeHtml(experience.company)}</p></div></div><p class="timeline-period">${escapeHtml(experience.period)}</p></div>
                ${experience.location ? `<p class="timeline-location"><i class="fas fa-location-dot" aria-hidden="true"></i> ${escapeHtml(experience.location)}</p>` : ''}
                ${points.length ? `<ul class="impact-list">${points.map(point => `<li>${escapeHtml(String(point).replace(/^•\s*/, ''))}</li>`).join('')}</ul>` : ''}
            </div>
        </article>`;
    }).join('');
}

async function loadProjects() {
    const data = await getJson('projects.json');
    setText('projects-title', data.sectionTitle || 'Projects');
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    const projects = data.projects || data.items || [];
    grid.innerHTML = projects.map(project => {
        const tags = project.technologies || project.tags || [];
        const title = project.displayTitle || humanize(project.title);
        const repository = safeUrl(project.links?.github || project.github);
        const live = safeUrl(project.links?.live || project.demo);
        const hasRepository = repository !== '#';
        const hasDistinctLive = live !== '#' && live !== repository;
        const image = safeAssetUrl(project.image);
        return `<article class="work-card">
            ${image ? `<img class="work-image" src="${escapeHtml(image)}" alt="" loading="lazy" onerror="this.remove()">` : `<div class="work-image work-image-placeholder"><i class="${escapeHtml(project.icon || 'fas fa-chart-line')}" aria-hidden="true"></i></div>`}
            <div class="work-content">
                <p class="work-category">${escapeHtml(project.category || 'Data analytics')}</p>
                <h3 class="work-title">${escapeHtml(title)}</h3>
                <p class="work-description">${escapeHtml(project.description || '')}</p>
                ${tags.length ? `<div class="work-tags" aria-label="Tools used">${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                ${(hasRepository || hasDistinctLive) ? `<div class="project-links">
                    ${hasRepository ? `<a href="${escapeHtml(repository)}"${linkAttributes(repository)}><i class="fab fa-github" aria-hidden="true"></i> View repository</a>` : ''}
                    ${hasDistinctLive ? `<a href="${escapeHtml(live)}"${linkAttributes(live)}><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> View project</a>` : ''}
                </div>` : ''}
            </div>
        </article>`;
    }).join('');
}

async function loadSkills() {
    const data = await getJson('skills.json');
    setText('skills-title', data.sectionTitle || 'Skills');
    const grid = document.getElementById('skills-grid');
    if (!grid) return;
    grid.innerHTML = (data.categories || []).map(category => `
        <article class="skill-category">
            <div class="skill-category-header"><i class="${escapeHtml(category.icon || 'fas fa-toolbox')}" aria-hidden="true"></i><h3 class="skill-category-name">${escapeHtml(category.name || category.category)}</h3></div>
            <div class="skill-list">${(category.skills || []).map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}</div>
        </article>`).join('');
}

async function loadEducation() {
    const data = await getJson('education.json');
    setText('education-title', data.sectionTitle || 'Education');
    const list = document.getElementById('education-list');
    if (list) list.innerHTML = (data.education || []).map(item => `
        <article class="education-card"><i class="fas fa-graduation-cap" aria-hidden="true"></i><div><p class="education-period">${escapeHtml(item.period)}</p><h3>${escapeHtml(item.degree)}</h3><p class="education-school">${escapeHtml(item.school || item.institution)}</p>${item.details || item.description ? `<p class="education-details">${escapeHtml(item.details || item.description)}</p>` : ''}</div></article>`).join('');

    const certifications = document.getElementById('certifications');
    const items = data.certifications || [];
    if (certifications && items.length) {
        certifications.innerHTML = `<h3>${escapeHtml(data.certificationsTitle || 'Certifications')}</h3><ul>${items.map(item => `<li>${escapeHtml(item.name || item.title || item)}</li>`).join('')}</ul>`;
    }
}

async function loadContact() {
    const data = await getJson('contact.json');
    setText('contact-title', data.sectionTitle || 'Contact');
    setText('contact-subtitle', data.subtitle || '');
    const info = document.getElementById('contact-info');
    if (info) info.innerHTML = `
        ${data.email ? `<div class="contact-item"><i class="fas fa-envelope" aria-hidden="true"></i> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>` : ''}
        ${data.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${escapeHtml(data.location)}</div>` : ''}
        ${data.availability ? `<div class="contact-item"><i class="fas fa-clock" aria-hidden="true"></i> ${escapeHtml(data.availability)}</div>` : ''}`;
    renderSocialLinks('contact-social', data.socialLinks || []);
}

async function loadFooter() {
    const data = await getJson('footer.json');
    setText('footer-text', data.text || '');
    setText('footer-copyright', data.copyright || '');
    const links = document.getElementById('footer-links');
    if (links) links.innerHTML = (data.links || []).map(link => {
        const href = safeUrl(link.href || link.url);
        return `<a href="${escapeHtml(href)}"${linkAttributes(href)}>${escapeHtml(link.text)}</a>`;
    }).join('');
}

function initializeNavigation() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    const mobileMenu = window.matchMedia('(max-width: 968px)');
    const setMenuState = open => {
        const isMobile = mobileMenu.matches;
        const isOpen = isMobile && open;
        menu.classList.toggle('active', isOpen);
        menu.inert = isMobile && !isOpen;
        menu.setAttribute('aria-hidden', String(isMobile && !isOpen));
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    };
    const closeMenu = () => setMenuState(false);
    setMenuState(false);
    toggle.addEventListener('click', () => {
        setMenuState(!menu.classList.contains('active'));
    });
    menu.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    mobileMenu.addEventListener('change', () => setMenuState(false));

    const links = [...menu.querySelectorAll('.nav-link')];
    const observedSections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
        });
    }, { rootMargin: '-35% 0px -55% 0px' });
    observedSections.forEach(section => observer.observe(section));
}

function initializeScrollEffects() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    }), { threshold: 0.08 });
    document.querySelectorAll('main section:not(.hero-section)').forEach(section => observer.observe(section));
}

function initializeBackToTop() {
    const button = document.getElementById('back-to-top');
    if (!button) return;
    const updateVisibility = () => button.classList.toggle('visible', window.scrollY > 320);
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
