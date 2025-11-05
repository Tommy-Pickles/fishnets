(function () {
  const cfg = window.SITE_CONFIG || {};

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }

  const logoImg = document.getElementById('logo-image');
  if (logoImg && cfg.logoUrl) logoImg.src = cfg.logoUrl;
  setText('business-name', cfg.businessName);

  // Floating call button
  const floatingCall = document.getElementById('floating-call');
  if (cfg.phoneNumber && floatingCall) {
    floatingCall.href = `tel:${cfg.phoneNumber.replace(/\s|\(|\)|-/g, '')}`;
  } else if (floatingCall) {
    floatingCall.setAttribute('hidden', '');
  }

  // Social links (optional)
  // Intentionally not rendering by default in this demo

  // Hero/About: show business name as title, blurb below
  setText('headline', cfg.businessName);
  setText('tagline', cfg.tagline);
  setText('hours-summary', cfg.hoursSummary);
  const cover = document.getElementById('cover-image');
  if (cover && cfg.coverImageUrl) cover.src = cfg.coverImageUrl;

  // Hero Get Directions button
  const ctaDirections = document.getElementById('cta-directions');
  if (ctaDirections && cfg.addressLines && cfg.addressLines.length) {
    const addressQuery = encodeURIComponent(cfg.addressLines.join(', '));
    const isApple = /iPhone|iPad|Macintosh/.test(navigator.userAgent);
    const appleUrl = `https://maps.apple.com/?q=${addressQuery}`;
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
    ctaDirections.href = isApple ? appleUrl : googleUrl;
  } else if (ctaDirections) {
    ctaDirections.setAttribute('hidden', '');
  }

  function renderMenuSection(targetId, items) {
    const heading = document.getElementById(targetId);
    if (!heading || !Array.isArray(items)) return;
    // Find the next sibling menu-container div
    let container = heading.nextElementSibling;
    while (container && !container.classList.contains('menu-container')) {
      container = container.nextElementSibling;
    }
    if (!container) return;
    container.innerHTML = items.map(item => {
      const price = item.price ? `<div class=\"price\">${item.price}</div>` : '';
      const desc = item.description ? `<div class=\"desc\">${item.description}</div>` : '';
      return `<div class=\"card\"><div class=\"card-body\"><div class=\"title\">${item.title || ''}</div>${desc}${price}</div></div>`;
    }).join('');
  }
  if (cfg.menu) {
    renderMenuSection('menu-fried-food', cfg.menu.friedFood);
    renderMenuSection('menu-burgers', cfg.menu.burgers);
    renderMenuSection('menu-mammoth-burgers', cfg.menu.mammothBurgers);
    renderMenuSection('menu-salads', cfg.menu.salads);
    renderMenuSection('menu-value-deals', cfg.menu.valueDeals);
    renderMenuSection('menu-kids-deals', cfg.menu.kidsDeals);
    renderMenuSection('menu-family-platter', cfg.menu.familyPlatter);
    renderMenuSection('menu-extras', cfg.menu.extras);
  }

  // Contact buttons
  const btnAddress = document.getElementById('btn-address');
  const btnEmail = document.getElementById('btn-email');
  const btnPhone = document.getElementById('btn-phone');
  const btnAddressText = document.getElementById('btn-address-text');
  const btnEmailText = document.getElementById('btn-email-text');
  const btnPhoneText = document.getElementById('btn-phone-text');
  if (btnAddress && cfg.addressLines && cfg.addressLines.length) {
    const addressQuery = encodeURIComponent(cfg.addressLines.join(', '));
    const isApple = /iPhone|iPad|Macintosh/.test(navigator.userAgent);
    const appleUrl = `https://maps.apple.com/?q=${addressQuery}`;
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
    btnAddress.href = isApple ? appleUrl : googleUrl;
    if (btnAddressText) btnAddressText.textContent = cfg.addressLines[0];
  } else if (btnAddress) { btnAddress.setAttribute('hidden', ''); }

  if (btnEmail && cfg.email) { btnEmail.href = `mailto:${cfg.email}`; if (btnEmailText) btnEmailText.textContent = cfg.email; } else if (btnEmail) { btnEmail.setAttribute('hidden', ''); }
  if (btnPhone && cfg.phoneNumber) { btnPhone.href = `tel:${cfg.phoneNumber.replace(/\s|\(|\)|-/g, '')}`; if (btnPhoneText) btnPhoneText.textContent = cfg.phoneNumber; } else if (btnPhone) { btnPhone.setAttribute('hidden', ''); }

  const hoursEl = document.getElementById('contact-hours');
  if (hoursEl && Array.isArray(cfg.openingHours)) {
    hoursEl.textContent = cfg.openingHours.map(h => `${h.day}: ${h.hours}`).join('\n');
  }

  // Reviews rendering
  const reviewsSummary = document.getElementById('reviews-summary');
  const reviewsList = document.getElementById('reviews-list');
  if (cfg.reviews && reviewsSummary) {
    const rating = cfg.reviews.overallRating || 0;
    const total = cfg.reviews.totalReviews || 0;
    const star = '★';
    const hollow = '☆';
    const fullStars = Math.round(rating);
    const starsText = star.repeat(fullStars) + hollow.repeat(5 - fullStars);
    reviewsSummary.textContent = `Google rating ${rating.toFixed(1)} / 5 (${total} reviews)`;
  }
  if (cfg.reviews && reviewsList && Array.isArray(cfg.reviews.items)) {
    reviewsList.innerHTML = cfg.reviews.items.map(r => {
      const stars = '★'.repeat(Math.max(0, Math.min(5, r.stars || 0)));
      return `<div class="review-card">
        <div class="review-stars">${stars}</div>
        <div class="review-text">${(r.text || '')}</div>
        <div class="review-author">${r.author || ''}</div>
      </div>`;
    }).join('');
  }

  // Live Google Places reviews (if configured)
  async function loadPlacesReviews() {
    const g = window.GOOGLE_PLACES || {};
    if (!g.apiKey || !g.placeId) return;
    try {
      const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(g.placeId)}`;
      const fieldMask = 'rating,userRatingsTotal,reviews';
      const res = await fetch(`${url}?fields=${encodeURIComponent(fieldMask)}`, {
        headers: {
          'X-Goog-Api-Key': g.apiKey,
          'X-Goog-FieldMask': fieldMask
        }
      });
      if (!res.ok) throw new Error('Failed to fetch Google Places');
      const data = await res.json();
      if (reviewsSummary && typeof data.rating === 'number') {
        const rating = data.rating;
        const total = data.userRatingsTotal || 0;
        reviewsSummary.textContent = `Google rating ${rating.toFixed(1)} / 5 (${total} reviews)`;
      }
      if (reviewsList && Array.isArray(data.reviews)) {
        reviewsList.innerHTML = data.reviews.slice(0, 6).map(r => {
          const stars = '★'.repeat(Math.round(r.rating || 0));
          const text = (r.text && (r.text.text || r.text)) || '';
          const author = (r.authorAttribution && r.authorAttribution.displayName) || '';
          return `<div class=\"review-card\">\n            <div class=\"review-stars\">${stars}</div>\n            <div class=\"review-text\">${text}</div>\n            <div class=\"review-author\">${author}</div>\n          </div>`;
        }).join('');
      }
    } catch (e) {
      // Silently fall back to static reviews on error
    }
  }
  loadPlacesReviews();

  // Smooth scroll and logo to top
  document.documentElement.style.scrollBehavior = 'smooth';
  const logoLink = document.getElementById('logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', '#home');
    });
  }
})();



