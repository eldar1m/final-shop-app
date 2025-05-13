// assets/collection-ajax.js

document.addEventListener('DOMContentLoaded', () => {
    const sortSelect = document.getElementById('sort-by');
    const productsWrapper = document.querySelector('.collection-products');
    const paginationWrapper = document.querySelector('.pagination-wrapper');

    // 1. Core fetch + replace routine
    function fetchCollectionFragment(url) {
        fetch(url)
            .then(r => r.text())
            .then(html => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const newProducts = doc.querySelector('.collection-products');
                const newPagination = doc.querySelector('.pagination-wrapper');

                if (newProducts) productsWrapper.innerHTML = newProducts.innerHTML;
                if (newPagination) paginationWrapper.innerHTML = newPagination.innerHTML;
            })
            .catch(err => console.error('Collection AJAX error:', err));
    }

    // 2. Sort dropdown — same as before
    if (sortSelect) {
        sortSelect.removeAttribute('onchange');
        sortSelect.addEventListener('change', () => {
            const params = new URLSearchParams(window.location.search);
            params.set('sort_by', sortSelect.value);
            params.delete('page');
            fetchCollectionFragment(`${window.location.pathname}?${params}`);
        });
    }

    // 3. Always catch pagination clicks via document-level delegation
    document.addEventListener('click', e => {
        // look up the chain for any <a> inside your pagination wrapper
        const link = e.target.closest('.pagination-wrapper a');
        if (!link) return;
        e.preventDefault();
        fetchCollectionFragment(link.href);
    });
});
