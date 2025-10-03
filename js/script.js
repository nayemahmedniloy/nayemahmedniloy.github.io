// script.js
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Navigation toggle for mobile
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Smooth scrolling for nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
        navLinks.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (
        !navToggle.contains(e.target) && 
        !navLinks.contains(e.target) &&
        navLinks.classList.contains('active')
    ) {
        navLinks.classList.remove('active');
    }
});

// Close mobile menu when resizing to desktop view
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

// Hero animations
gsap.from('.hero-img', { duration: 1, scale: 0.8, opacity: 0, y: 50, ease: 'back.out(1.7)' });
gsap.from('.hero-title', { duration: 1, opacity: 0, y: 30, delay: 0.2 });
gsap.from('.hero-subtitle', { duration: 1, opacity: 0, y: 30, delay: 0.4 });
gsap.from('.hero-hook', { duration: 1, opacity: 0, y: 30, delay: 0.6 });
gsap.from('.cta-btn', { duration: 1, opacity: 0, y: 30, delay: 0.8 });

// Parallax for clouds
gsap.to('.cloud1', {
    y: -50,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
    }
});

// Section animations
const sections = document.querySelectorAll('.section');

sections.forEach(section => {
    gsap.from(section.querySelectorAll('*'), {
        duration: 1,
        opacity: 0,
        y: 50,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });
});

// Timeline icons animation
gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
        duration: 0.8,
        scale: 0.5,
        rotation: 180,
        opacity: 0,
        delay: i * 0.2,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: item,
            start: 'top 90%'
        }
    });
});

// Card expand
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        const expand = card.querySelector('.card-expand');
        expand.style.maxHeight = expand.style.maxHeight ? null : expand.scrollHeight + 'px';
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });
});

// Skills constellation hover
const starNodes = document.querySelectorAll('.star-node');
const skillCardsContainer = document.querySelector('.skill-cards');

const skillData = {
    'Python': { level: 'Expert', desc: 'Advanced Python for AI and ML pipelines.' },
    'PyTorch': { level: 'Expert', desc: 'Deep learning frameworks mastery.' },
    'Django': { level: 'Advanced', desc: 'Backend web development.' },
    'Kotlin': { level: 'Advanced', desc: 'Android app development.' },
    'Java': { level: 'Advanced', desc: 'Core programming and OOP.' },
    'React Native': { level: 'Advanced', desc: 'Cross-platform mobile apps.' },
    'Expo': { level: 'Advanced', desc: 'React Native tooling.' },
    'JS': { level: 'Expert', desc: 'JavaScript for web interactivity.' },
    'C/C++': { level: 'Advanced', desc: 'System-level programming.' },
    'HTML/CSS': { level: 'Expert', desc: 'Frontend foundations.' },
    'MySQL': { level: 'Advanced', desc: 'Relational databases.' },
    'MongoDB': { level: 'Advanced', desc: 'NoSQL databases.' },
    'Firebase': { level: 'Advanced', desc: 'Cloud services and auth.' }
};

starNodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
        const skill = node.dataset.skill;
        const data = skillData[skill];
        if (data) {
            // Animate line glow
            const lines = document.querySelectorAll('.line');
            gsap.to(lines, { stroke: '#ffffff', duration: 0.3 });

            // Show card
            let card = document.querySelector(`[data-skill="${skill}"]`);
            if (!card) {
                card = document.createElement('div');
                card.className = 'card';
                card.dataset.skill = skill;
                card.innerHTML = `
                    <h4>${skill}</h4>
                    <p><strong>${data.level}</strong> - ${data.desc}</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.level === 'Expert' ? 90 : 70}%"></div>
                    </div>
                `;
                skillCardsContainer.appendChild(card);
            }
            gsap.to(card, { opacity: 1, y: 0, duration: 0.3 });
        }
    });

    node.addEventListener('mouseleave', () => {
        gsap.to(document.querySelectorAll('.line'), { stroke: '#ff8c00', duration: 0.3 });
        gsap.to(skillCardsContainer.children, { opacity: 0, y: 20, duration: 0.3 });
    });
});

// Projects fetch and display
const username = 'nayemahmedniloy';
const apiUrl = `https://api.github.com/users/${username}/repos`;
const projectsGrid = document.getElementById('projects-grid');
const loading = projectsGrid.querySelector('.loading');
const error = projectsGrid.querySelector('.error');

let repos = JSON.parse(localStorage.getItem('repos')) || [];
let sortBy = 'stars';

function fetchRepos() {
    fetch(apiUrl, { headers: { 'User-Agent': 'portfolio-app' } })
        .then(response => {
            if (!response.ok) throw new Error('API rate limit or error');
            return response.json();
        })
        .then(data => {
            // Filter out forks, limit to 12, sort by stars
            repos = data.filter(repo => !repo.fork).slice(0, 12).sort((a, b) => b.stars - a.stars);
            localStorage.setItem('repos', JSON.stringify(repos));
            displayProjects(repos);
            loading.classList.add('hidden');
        })
        .catch(err => {
            console.error(err);
            if (repos.length) {
                displayProjects(repos);
            } else {
                loading.classList.add('hidden');
                error.classList.remove('hidden');
            }
        });
}

function displayProjects(reposToShow) {
    projectsGrid.innerHTML = reposToShow.map(repo => `
        <div class="project-card">
            <h3>${repo.name}</h3>
            <p>${repo.description || 'No description available.'}</p>
            ${repo.language ? `<span class="project-badge">${repo.language}</span>` : ''}
            <div class="project-meta">
                <span>⭐ ${repo.stargazers_count}</span>
                <span>🍴 ${repo.forks_count}</span>
                <span>Updated: ${new Date(repo.updated_at).toLocaleDateString()}</span>
            </div>
            <a href="${repo.html_url}" target="_blank" rel="noopener" class="cta-btn" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;">View on GitHub</a>
        </div>
    `).join('');
}

function sortProjects(criteria) {
    sortBy = criteria;
    let sorted = [...repos];
    if (criteria === 'stars') {
        sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else {
        sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }
    displayProjects(sorted);
}

document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sortProjects(btn.dataset.sort);
    });
});

const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = repos.filter(repo => 
        (repo.language && repo.language.toLowerCase().includes(query)) ||
        repo.name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query))
    );
    displayProjects(filtered);
});

// Load projects on page load
document.addEventListener('DOMContentLoaded', fetchRepos);

// Form validation (basic)
document.querySelector('.contact-form').addEventListener('submit', (e) => {
    const email = e.target.email.value;
    if (!email.includes('@')) {
        e.preventDefault();
        alert('Please enter a valid email.');
    }
});

// Intersection Observer for lazy animations (fallback)
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.8 });
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.timeline-item, .card, .project-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        observer.observe(el);
    });
}

// Handle no JS
if (document.documentElement.hasAttribute('data-nojs')) {
    document.documentElement.removeAttribute('data-nojs');
}