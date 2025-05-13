const SECTION_ID = 'collection-products';

document.addEventListener('DOMContentLoaded', () => {
    bindCollectionEvents();

    document.addEventListener('click', (e) => {
        const link = e.target.closest('.pagination-wrapper a');
        if (!link) return;
        e.preventDefault();
        const url = new URL(link.href);
        const params = new URLSearchParams(url.search);
        fetchAndReplaceSection(params);
    });
});

function fetchAndReplaceSection(params) {
    const fetchUrl = `${window.location.pathname}?sections=${SECTION_ID}&${params.toString()}`;
    fetch(fetchUrl)
        .then(res => res.json())
        .then(data => {
            const html = data[SECTION_ID];
            const section = document.getElementById(`shopify-section-${SECTION_ID}`);
            if (section) {
                section.innerHTML = html;
                bindCollectionEvents();
            }
        });
}

function bindCollectionEvents() {
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.removeEventListener('change', handleSortChange);
        sortSelect.addEventListener('change', handleSortChange);
    }

    document.querySelectorAll('.open-variant-overlay').forEach(btn => {
        btn.removeEventListener('click', handleOverlayToggle);
        btn.addEventListener('click', handleOverlayToggle);
    });

    document.querySelectorAll('.quick-add-form').forEach(form => {
        form.removeEventListener('submit', handleQuickAdd);
        form.addEventListener('submit', handleQuickAdd);
    });

    document.querySelectorAll('.variant-form').forEach(form => {
        form.removeEventListener('submit', handleVariantAdd);
        form.addEventListener('submit', handleVariantAdd);
    });

    document.querySelectorAll('.close-variant-overlay').forEach(btn => {
        btn.removeEventListener('click', handleOverlayClose);
        btn.addEventListener('click', handleOverlayClose);
    });

    document.querySelectorAll('.variant-overlay').forEach(overlay => {
        overlay.removeEventListener('click', handleOverlayOutside);
        overlay.addEventListener('click', handleOverlayOutside);
    });
}

function handleSortChange(e) {
    const params = new URLSearchParams(window.location.search);
    params.set('sort_by', e.target.value);
    params.delete('page');
    fetchAndReplaceSection(params);
}

function handleOverlayToggle(e) {
    e.preventDefault();
    const id = e.currentTarget.getAttribute('data-product-id');
    const overlay = document.getElementById(`variant-overlay-${id}`);
    if (overlay) overlay.classList.add('active');
}

function handleOverlayClose(e) {
    const overlay = e.currentTarget.closest('.variant-overlay');
    if (overlay) overlay.classList.remove('active');
}

function handleOverlayOutside(e) {
    const content = e.currentTarget.querySelector('.variant-overlay-content');
    if (!content.contains(e.target)) {
        e.currentTarget.classList.remove('active');
    }
}

function handleQuickAdd(e) {
    e.preventDefault();
    const form = e.currentTarget;
    fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
    })
        .then(res => res.json())
        .then(() => openCartDrawer())
        .catch(err => console.error('Quick-add error:', err));
}

function handleVariantAdd(e) {
    e.preventDefault();
    const form = e.currentTarget;
    fetch('/cart/add.js', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
    })
        .then(res => res.json())
        .then(() => {
            const overlay = form.closest('.variant-overlay');
            if (overlay) overlay.classList.remove('active');
            openCartDrawer();
        })
        .catch(err => console.error('Variant add error:', err));
}

function openCartDrawer() {
    fetch('/cart.js')
        .then(res => res.json())
        .then(cart => {
            if (typeof renderCart === 'function') {
                renderCart(cart);
            }
            document.getElementById('cart-drawer')?.classList.add('active');
            document.querySelector('.cart-drawer-overlay')?.classList.add('active');
        });
}
