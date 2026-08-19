/**
 * Craftor Core - 3-Step AI Onboarding Wizard JavaScript Engine
 */

(function () {
    'use strict';

    let currentArchetype = 'saas';
    let currentTheme = 'dark-gold';

    const defaultTitles = {
        'saas': 'AuraFlow AI — NextGen Platform',
        'fitness': 'IronForge Gym & Fitness Club',
        'restaurant': 'La Bella Artisan Cafe & Dining',
        'agency': 'PixelForge Digital Design Studio',
        'ecommerce': 'UrbanCraft E-Commerce Store',
        'infrastructure': 'Apex Infrastructure & Engineering'
    };

    window.craftorSelectArchetype = function (val, el) {
        currentArchetype = val;
        document.querySelectorAll('.craftor-archetype-card').forEach(function (card) {
            card.classList.remove('selected');
        });
        if (el) el.classList.add('selected');

        const titleInput = document.getElementById('wizard-site-title');
        if (titleInput && defaultTitles[val]) {
            titleInput.value = defaultTitles[val];
        }
    };

    window.craftorSelectTheme = function (val, el) {
        currentTheme = val;
        document.querySelectorAll('.craftor-theme-card').forEach(function (card) {
            card.classList.remove('selected');
        });
        if (el) el.classList.add('selected');
    };

    window.craftorGoToStep = function (stepNum) {
        for (let i = 1; i <= 3; i++) {
            const stepEl = document.getElementById('wizard-step-' + i);
            const indEl = document.getElementById('step-ind-' + i);
            if (stepEl) {
                stepEl.style.display = (i === stepNum) ? 'block' : 'none';
            }
            if (indEl) {
                const circle = indEl.querySelector('.craftor-step-circle');
                if (circle) {
                    circle.classList.remove('active', 'completed');
                    if (i === stepNum) {
                        circle.classList.add('active');
                        circle.innerText = i;
                    } else if (i < stepNum) {
                        circle.classList.add('completed');
                        circle.innerText = '✓';
                    } else {
                        circle.innerText = i;
                    }
                }
            }
        }
    };

    window.craftorExecuteWizardBuild = async function () {
        const titleInput = document.getElementById('wizard-site-title');
        const title = titleInput ? titleInput.value : 'My Craftor Website';
        const hasWoo = document.getElementById('wizard-opt-woo') ? document.getElementById('wizard-opt-woo').checked : false;
        const hasSeo = document.getElementById('wizard-opt-seo') ? document.getElementById('wizard-opt-seo').checked : true;

        const config = window.craftorWizardData || {};
        const endpoint = config.endpoint || '/wp-json/craftor/v1/wizard/generate';
        const nonce = config.nonce || '';
        const token = config.token || '';

        const btnBuild = document.getElementById('btn-start-build');
        const loadingArea = document.getElementById('wizard-loading-area');
        const actionsBar = document.getElementById('wizard-actions-bar');
        const successArea = document.getElementById('wizard-success-area');

        if (btnBuild) btnBuild.disabled = true;
        if (loadingArea) loadingArea.style.display = 'block';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce,
                    'X-Craftor-Token': token
                },
                body: JSON.stringify({
                    archetype: currentArchetype,
                    theme: currentTheme,
                    title: title,
                    create_woo_products: hasWoo,
                    inject_seo: hasSeo
                })
            });

            const data = await response.json();

            if (data.success && data.page_id) {
                if (loadingArea) loadingArea.style.display = 'none';
                if (actionsBar) actionsBar.style.display = 'none';
                if (successArea) successArea.style.display = 'block';

                const titleEl = document.getElementById('wizard-success-title');
                const descEl = document.getElementById('wizard-success-desc');
                const btnView = document.getElementById('btn-view-site');
                const btnEdit = document.getElementById('btn-edit-elementor');

                if (titleEl) titleEl.innerText = '🎉 "' + data.title + '" is Live!';
                if (descEl) descEl.innerText = 'Generated with ' + data.containers_count + ' native Elementor containers for archetype: ' + data.archetype.toUpperCase();
                if (btnView) btnView.href = data.page_url;
                if (btnEdit) btnEdit.href = data.editor_url;
            } else {
                alert('Generation Error: ' + (data.message || 'Unknown server error'));
                if (btnBuild) btnBuild.disabled = false;
                if (loadingArea) loadingArea.style.display = 'none';
            }
        } catch (err) {
            alert('Connection failed: ' + err.message);
            if (btnBuild) btnBuild.disabled = false;
            if (loadingArea) loadingArea.style.display = 'none';
        }
    };
})();
