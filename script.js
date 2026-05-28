console.log("Website Loaded");

const STORAGE_KEY = 'myWebsiteSectionData';
const RESUME_KEY = 'myWebsiteResume';

/* Particle Background Animation */
function initParticles() {
	const container = document.getElementById('particles-container');
	console.log("Particle container:", container);
	if (!container) {
		console.error("Particles container not found!");
		return;
	}

	const colors = ['cyan', 'magenta', 'purple', 'green'];
	const particleCount = 80;
	let created = 0;

	function createParticle() {
		const particle = document.createElement('div');
		const colorClass = colors[Math.floor(Math.random() * colors.length)];
		particle.className = `particle ${colorClass}`;
		
		const size = Math.random() * 150 + 30; // 30-180px
		const xPos = Math.random() * window.innerWidth;
		const duration = Math.random() * 25 + 20; // 20-45 seconds
		const delay = Math.random() * 2; // 0-2 second stagger
		const tx = (Math.random() - 0.5) * 400; // -200 to 200px horizontal drift

		particle.style.width = size + 'px';
		particle.style.height = size + 'px';
		particle.style.left = xPos + 'px';
		particle.style.top = window.innerHeight + 100 + 'px'; // Start below viewport
		particle.style.setProperty('--tx', tx + 'px');
		particle.style.animation = `float-up ${duration}s linear ${delay}s forwards, fade-out ${duration}s linear ${delay}s forwards`;

		container.appendChild(particle);
		created++;
		console.log(`Particle ${created} created (${colorClass}, size: ${size.toFixed(0)}px, duration: ${duration.toFixed(1)}s)`);

		// Remove and recreate particle after animation completes
		setTimeout(() => {
			if (particle.parentNode) particle.remove();
			createParticle();
		}, (duration + delay) * 1000 + 100);
	}

	// Initial particle creation
	for (let i = 0; i < particleCount; i++) {
		setTimeout(createParticle, i * 40);
	}
	console.log("Particle initialization started, scheduling", particleCount, "particles");
}


document.addEventListener('DOMContentLoaded', function () {
	initParticles();
	const savedContent = loadSavedContent();
	restoreSavedContent(savedContent);
	attachDeleteButtons();
	restoreSavedResume();

	// wire file inputs for resume upload
	document.querySelectorAll('.resume-input').forEach(function (input) {
		input.addEventListener('change', function () {
			handleFileSelected(this);
		});
	});

	document.addEventListener('keydown', function (e) {
		if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('toggle')) {
			e.preventDefault();
			handleToggle(e.target);
		}
	});

	document.addEventListener('click', function (e) {
		const saveBtn = e.target.closest('.save-btn');
		const itemSave = e.target.closest('.item-save-btn');
		const itemEdit = e.target.closest('.item-edit-btn');
		const viewBtn = e.target.closest('.view-btn');
		const uploadBtn = e.target.closest('.upload-btn');
		const downloadBtn = e.target.closest('.download-btn');
		const removeResumeBtn = e.target.closest('.remove-resume-btn');
		const editBtn = e.target.closest('.edit-btn');
		const addBtn = e.target.closest('.add-btn');
		const deleteBtn = e.target.closest('.delete-btn');
		const toggleHeader = e.target.closest('.toggle');

		if (viewBtn) {
			e.preventDefault();
			handleView(viewBtn);
			return;
		}

		if (itemEdit) {
			e.preventDefault();
			handleItemEdit(itemEdit);
			return;
		}

		if (editBtn) {
			e.preventDefault();
			handleEdit(editBtn);
			return;
		}

		if (addBtn) {
			e.preventDefault();
			handleAdd(addBtn);
			return;
		}

		if (itemSave) {
			e.preventDefault();
			handleItemSave(itemSave);
			return;
		}

		if (saveBtn) {
			e.preventDefault();
			handleSave(saveBtn);
			return;
		}

		if (uploadBtn) {
			e.preventDefault();
			handleUpload(uploadBtn);
			return;
		}

		if (downloadBtn) {
			e.preventDefault();
			handleDownload(downloadBtn);
			return;
		}

		if (removeResumeBtn) {
			e.preventDefault();
			handleRemoveResume(removeResumeBtn);
			return;
		}

		if (deleteBtn) {
			e.preventDefault();
			handleDelete(deleteBtn);
			return;
		}

		if (toggleHeader) {
			e.preventDefault();
			handleToggle(toggleHeader);
		}
	});

	document.querySelectorAll('section').forEach(function (section) {
		const content = section.querySelector('.content');
		if (!content) return;
		content.addEventListener('input', function () {
			saveSectionContent(section);
		});
	});

	function handleToggle(header) {
		const section = header.closest('section');
		const content = section.querySelector('.content');
		if (!content) return;
		const isHidden = content.classList.toggle('hidden');
		header.setAttribute('aria-expanded', String(!isHidden));
		const viewBtn = section.querySelector('.view-btn');
		if (viewBtn) viewBtn.setAttribute('aria-pressed', String(!isHidden));
	}

	function handleView(btn) {
		const section = btn.closest('section');
		const content = section.querySelector('.content');
		const header = section.querySelector('.toggle');
		if (!content) return;
		const isHidden = content.classList.toggle('hidden');
		btn.setAttribute('aria-pressed', String(!isHidden));
		if (header) header.setAttribute('aria-expanded', String(!isHidden));
	}

	function handleEdit(btn) {
		const section = btn.closest('section');
		const content = section.querySelector('.content');
		if (!content) return;
		// if edit btn is inside an education card, edit only that card
		const card = btn.closest('.education-card');
		if (card) {
			const list = card.querySelector('.education-list');
			const isEditingCard = btn.dataset.editing === 'true';
			if (!isEditingCard) {
				card.classList.remove('hidden');
				if (list) list.contentEditable = 'true';
				btn.textContent = 'Save';
				btn.dataset.editing = 'true';
				list && list.focus();
			} else {
				if (list) list.contentEditable = 'false';
				btn.textContent = 'Edit';
				btn.dataset.editing = 'false';
				saveSectionContent(section);
			}

return;
		}

		const isEditing = btn.dataset.editing === 'true';
		if (!isEditing) {
			content.classList.remove('hidden');
			const viewButton = section.querySelector('.view-btn');
			if (viewButton) viewButton.setAttribute('aria-pressed', 'true');
			content.contentEditable = 'true';
			btn.textContent = 'Save';
			btn.dataset.editing = 'true';
			content.focus();
		} else {
			content.contentEditable = 'false';
			btn.textContent = 'Edit';
			btn.dataset.editing = 'false';
			saveSectionContent(section);
		}
	}

	function handleAdd(btn) {
		const section = btn.closest('section');
		const content = section.querySelector('.content');
		const type = section.dataset.section;
		if (!content) return;
		content.classList.remove('hidden');
		let newEl;
		// if add clicked inside an education card, add to that card's list
		const card = btn.closest('.education-card');
		if (card) {
			const list = card.querySelector('.education-list');
			if (list) {
				newEl = createEducationEntry({ institution: 'New Institution', course: 'New Course', year: '' });
				list.appendChild(newEl);
				// set card into edit mode
				const editBtn = card.querySelector('.edit-btn');
				if (editBtn) { editBtn.textContent = 'Save'; editBtn.dataset.editing = 'true'; }
				const saveBtn = card.querySelector('.save-btn');
				if (saveBtn) saveBtn.style.display = 'inline-block';
				list.contentEditable = 'true';
				saveSectionContent(section);
				const range = document.createRange();
				range.selectNodeContents(newEl);
				range.collapse(false);
				const sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				newEl.focus();
				return;
			}
		}
		if (type === 'projects') {
			const list = section.querySelector('.projects-list');
			if (list) {
				newEl = document.createElement('li');
				newEl.className = 'project';
				newEl.innerHTML = '<h3>New Project</h3><p>Project description...</p>';
				appendDelete(newEl);
				list.appendChild(newEl);
			} else {
				newEl = document.createElement('div');
				newEl.className = 'project';
				newEl.innerHTML = '<h3>New Project</h3><p>Project description...</p>';
				appendDelete(newEl);
				content.appendChild(newEl);
			}
		} else if (type === 'skills') {
			const list = section.querySelector('.skills-list');
			if (list) {
				newEl = document.createElement('li');
				newEl.className = 'skill';
				newEl.textContent = 'New skill';
				appendDelete(newEl);
				list.appendChild(newEl);
			} else {
				newEl = document.createElement('div');
				newEl.className = 'skill';
				newEl.textContent = 'New skill';
				appendDelete(newEl);
				content.appendChild(newEl);
			}
		} else if (type === 'education') {
			// Add new education item to the College list by default
			// top-level Add (no specific card): prefer achievements list, then college
			const list = section.querySelector('.achievements-list') || section.querySelector('.college-list') || section.querySelector('.education-list');
			if (list) {
				newEl = createEducationEntry({ institution: 'New Institution', course: '', year: '' });
				list.appendChild(newEl);
			} else {
				newEl = document.createElement('div');
				newEl.className = 'education-item';
				newEl.textContent = 'New education item';
				appendDelete(newEl);
				content.appendChild(newEl);
			}
		} else {
			newEl = document.createElement('div');
			newEl.className = 'info-box';
			newEl.innerHTML = '<p>New info...</p>';
			appendDelete(newEl);
			content.appendChild(newEl);
		}
		const editBtn = section.querySelector('.edit-btn');
		if (editBtn) {
			editBtn.textContent = 'Save';
			editBtn.dataset.editing = 'true';
		}
		content.contentEditable = 'true';
		const viewButton = section.querySelector('.view-btn');
		if (viewButton) viewButton.setAttribute('aria-pressed', 'true');
		saveSectionContent(section);
		const range = document.createRange();
		range.selectNodeContents(newEl);
		range.collapse(false);
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
		newEl.focus();
	}

	function appendDelete(el) {
		if (el.querySelector && el.querySelector('.delete-btn')) return;
		const d = document.createElement('button');
		d.type = 'button';
		d.className = 'delete-btn';
		d.setAttribute('aria-label', 'Delete item');
		d.textContent = '✖';
		el.appendChild(d);
	}

		function createEducationEntry(opts) {
			const li = document.createElement('li');
			li.className = 'education-item education-entry';
			const fields = document.createElement('div');
			fields.className = 'entry-fields';
			const inst = document.createElement('span');
			inst.className = 'institution';
			inst.textContent = opts.institution || '';
			fields.appendChild(inst);
			if (opts.course !== undefined) {
				const course = document.createElement('span');
				course.className = 'course';
				course.textContent = opts.course || '';
				fields.appendChild(course);
			}
			if (opts.year !== undefined) {
				const year = document.createElement('span');
				year.className = 'year';
				year.textContent = opts.year || '';
				fields.appendChild(year);
			}
			li.appendChild(fields);
			const actions = document.createElement('div');
			actions.className = 'item-actions';
			const edit = document.createElement('button');
			edit.type = 'button';
			edit.className = 'item-edit-btn';
			edit.textContent = 'Edit';
			actions.appendChild(edit);
			const save = document.createElement('button');
			save.type = 'button';
			save.className = 'item-save-btn';
			save.textContent = 'Save';
			save.style.display = 'none';
			actions.appendChild(save);
			const del = document.createElement('button');
			del.type = 'button';
			del.className = 'delete-btn';
			del.textContent = '✖';
			actions.appendChild(del);
			li.appendChild(actions);
			return li;
		}

	function attachDeleteButtons() {
		// Add delete buttons to existing items (skip fixed items)
		document.querySelectorAll('.info-box, .projects-list .project, .contact-list dd, .skills-list .skill, .education-list li').forEach(function (el) {
			if (el.classList && el.classList.contains('fixed')) return;
			appendDelete(el);
		});
	}

		function handleDelete(btn) {
			const item = btn.closest('.info-box, .project, dd, .education-item, .skill, .education-entry');
			if (!item) return;
			const section = btn.closest('section');
			// If deleting a contact dd, also remove preceding dt if present
			if (item.tagName === 'DD') {
				const prev = item.previousElementSibling;
				if (prev && prev.tagName === 'DT') prev.remove();
				item.remove();
			} else {
				item.remove();
			}
			if (section) saveSectionContent(section);
		}

		function handleItemEdit(btn) {
			const entry = btn.closest('.education-entry');
			if (!entry) return;
			const fields = entry.querySelector('.entry-fields');
			if (!fields) return;
			fields.contentEditable = 'true';
			fields.focus();
			btn.style.display = 'none';
			const save = entry.querySelector('.item-save-btn');
			if (save) save.style.display = 'inline-block';
		}

		function handleItemSave(btn) {
			const entry = btn.closest('.education-entry');
			const section = btn.closest('section');
			if (!entry) return;
			const fields = entry.querySelector('.entry-fields');
			if (fields) fields.contentEditable = 'false';
			btn.style.display = 'none';
			const edit = entry.querySelector('.item-edit-btn');
			if (edit) edit.style.display = 'inline-block';
			if (section) saveSectionContent(section);
		}

		function handleSave(btn) {
			const card = btn.closest('.education-card');
			const section = btn.closest('section');
			if (card) {
				const list = card.querySelector('.education-list');
				if (list) list.contentEditable = 'false';
				const editBtn = card.querySelector('.edit-btn');
				if (editBtn) { editBtn.textContent = 'Edit'; editBtn.dataset.editing = 'false'; }
				btn.style.display = 'none';
				if (section) saveSectionContent(section);
				return;
			}

			if (!section) return;
			const content = section.querySelector('.content');
			if (content) {
				content.contentEditable = 'false';
				const editBtn = section.querySelector('.edit-btn');
				if (editBtn) { editBtn.textContent = 'Edit'; editBtn.dataset.editing = 'false'; }
				btn.style.display = 'none';
				saveSectionContent(section);
			}
		}


	/* Resume upload/download handling */

	function handleUpload(btn) {
		const section = btn.closest('section');
		if (!section) return;
		const input = section.querySelector('.resume-input');
		if (input) input.click();
	}

	function handleFileSelected(input) {
		const file = input.files && input.files[0];
		if (!file) return;
		if (file.type !== 'application/pdf') return alert('Please select a PDF file.');
		const reader = new FileReader();
		reader.onload = function (e) {
			const dataURL = e.target.result;
			const obj = { name: file.name, data: dataURL };
			try {
				localStorage.setItem(RESUME_KEY, JSON.stringify(obj));
			} catch (err) {
				console.warn('Failed to save resume to localStorage:', err);
			}
			restoreSavedResume();
		};
		reader.readAsDataURL(file);
	}

	function handleDownload(btn) {
		const res = loadSavedResume();
		if (!res || !res.data) return;
		const dataURL = res.data;
		const arr = dataURL.split(',');
		const mime = arr[0].match(/:(.*?);/)[1];
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) u8arr[n] = bstr.charCodeAt(n);
		const blob = new Blob([u8arr], { type: mime });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = res.name || 'resume.pdf';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	function loadSavedResume() {
		try {
			return JSON.parse(localStorage.getItem(RESUME_KEY) || 'null');
		} catch (err) {
			return null;
		}
	}

	function restoreSavedResume() {
		const res = loadSavedResume();
		const section = document.querySelector('section[data-section="resume"]');
		if (!section) return;
		const nameEl = section.querySelector('.resume-name');
		const iframe = section.querySelector('.resume-preview');
		const downloadBtn = section.querySelector('.download-btn');
		const removeBtn = section.querySelector('.remove-resume-btn');
		if (res && res.data) {
			if (nameEl) nameEl.textContent = res.name || 'Resume';
			if (iframe) { iframe.src = res.data; iframe.style.display = 'block'; }
			if (downloadBtn) downloadBtn.disabled = false;
			if (removeBtn) removeBtn.disabled = false;
		} else {
			if (nameEl) nameEl.textContent = 'No resume uploaded.';
			if (iframe) { iframe.src = ''; iframe.style.display = 'none'; }
			if (downloadBtn) downloadBtn.disabled = true;
			if (removeBtn) removeBtn.disabled = true;
		}
	}

	function handleRemoveResume(btn) {
		const section = btn.closest('section');
		// remove from storage
		localStorage.removeItem(RESUME_KEY);
		restoreSavedResume();
		if (section) {
			const nameEl = section.querySelector('.resume-name');
			if (nameEl) nameEl.textContent = 'No resume uploaded.';
		}
	}

});

function loadSavedContent() {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
	} catch (error) {
		console.warn('Failed to load saved content:', error);
		return {};
	}
}

function saveSectionContent(section) {
	const type = section.dataset.section;
	const content = section.querySelector('.content');
	if (!type || !content) return;
	const storage = loadSavedContent();
	storage[type] = content.innerHTML;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

function restoreSavedContent(savedContent) {
	Object.keys(savedContent).forEach(function (type) {
		const section = document.querySelector(`section[data-section="${type}"]`);
		if (!section) return;
		const content = section.querySelector('.content');
		if (content) content.innerHTML = savedContent[type];
	});
}
