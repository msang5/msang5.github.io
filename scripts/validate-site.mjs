import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const json = path => JSON.parse(read(path));
const fail = message => { throw new Error(message); };
const requireCondition = (condition, message) => { if (!condition) fail(message); };

const html = read('../index.html');
const nav = json('../data/navigation.json');
const hero = json('../data/hero.json');
const projects = json('../data/projects.json').projects;
const experience = json('../data/experience.json').experiences;
const education = json('../data/education.json').education;
const skills = json('../data/skills.json').categories;
const config = json('../data/site-config.json').meta;

const sectionIds = new Set([...html.matchAll(/<section id="([^"]+)"/g)].map(([, id]) => id));
requireCondition(config.title && config.description && config.author, 'Site metadata is incomplete.');
requireCondition(nav.menuItems.every(item => item.href.startsWith('#') && sectionIds.has(item.href.slice(1))), 'A navigation item targets a missing section.');
requireCondition(hero.cta.buttons.every(button => !button.href.startsWith('#') || sectionIds.has(button.href.slice(1))), 'A hero CTA targets a missing section.');
requireCondition(experience.length > 0, 'At least one experience entry is required.');
requireCondition(education.length > 0, 'At least one education entry is required.');
requireCondition(skills.every(category => category.name && category.skills?.length), 'Every skill category needs a name and skills.');
requireCondition(projects.length > 0, 'At least one project is required.');
requireCondition(projects.every(project => project.title && project.description && (project.links?.github || project.github)), 'Every project needs a title, description, and repository link.');
requireCondition(projects.every(project => project.image && existsSync(new URL(`../${project.image}`, import.meta.url))), 'Every project image must exist locally.');
requireCondition(experience.every(role => !role.logo || existsSync(new URL(`../${role.logo}`, import.meta.url))), 'A configured company logo is missing.');

console.log(`Validated ${sectionIds.size} sections, ${projects.length} projects, ${experience.length} roles, and ${skills.length} skill groups.`);
