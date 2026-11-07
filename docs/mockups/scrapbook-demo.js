// Layout proposal for HTML mocks only. This is not mobile-app code or persistence.
(() => {
  const sample = (id, kind, asset, alt) => ({ id, kind, asset, alt });
  const scenes = {
    mixed: [
      sample('mountain', 'landscape', 'mountain', '秋の山と湖'),
      sample('forest', 'portrait', 'forest', '紅葉の散歩道'),
      sample('forest-two', 'portrait', 'forest', '縦長写真の別サンプル'),
      sample('street', 'landscape', 'street', '木造の町並み'),
      sample('forest-three', 'portrait', 'forest', '縦長写真が1枚だけ残る例'),
      sample('lake', 'landscape', 'lake', '朝の湖'),
    ],
    landscape: [
      sample('mountain', 'landscape', 'mountain', '秋の山と湖'),
      sample('street', 'landscape', 'street', '木造の町並み'),
      sample('lake', 'landscape', 'lake', '朝の湖'),
    ],
    portrait: [
      sample('forest', 'portrait', 'forest', '紅葉の散歩道'),
      sample('forest-two', 'portrait', 'forest', '縦長写真の別サンプル'),
      sample('forest-three', 'portrait', 'forest', '縦長写真の3枚目'),
      sample('forest-four', 'portrait', 'forest', '縦長写真の4枚目'),
    ],
  };

  function hash(id) {
    let value = 2166136261;
    for (const char of id) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
    return value >>> 0;
  }

  function appearance(photo) {
    const seed = hash(photo.id);
    return {
      width: (photo.fraction ?? preferredFraction(photo)) * 100,
      tilt: ((seed % 41) - 20) / 10,
      tape: seed % 2 ? 'green' : 'brown',
      align: seed % 2 ? 'right' : 'left',
    };
  }

  function preferredFraction(photo) {
    const variation = (hash(`size:${photo.id}`) % 101) / 100;
    return photo.kind === 'landscape' ? 0.56 + variation * 0.15 : 0.30 + variation * 0.14;
  }

  function preparePhotos(items) {
    const prepared = [];
    for (let index = 0; index < items.length; index += 2) {
      const nearby = items.slice(index, index + 2);
      const widths = nearby.map(preferredFraction);
      const scale = Math.min(1, 0.98 / widths.reduce((sum, width) => sum + width, 0));
      nearby.forEach((photo, offset) => {
        prepared.push({ ...photo, fraction: widths[offset] * scale, group: Math.floor(index / 2) });
      });
    }
    return prepared;
  }

  // Candidate geometry for the HTML study, not a production layout/virtualization engine.
  function packFrames(frames, width) {
    const placed = [];
    const margin = 12;
    let previousTop = margin;
    for (const frame of frames) {
      const nudgeLeft = hash(`left:${frame.id}`) % 6;
      const nudgeRight = hash(`right:${frame.id}`) % 6;
      const gap = 18 + hash(`gap:${frame.id}`) % 9;
      const candidates = [margin + nudgeLeft, width - margin - frame.width - nudgeRight].map((left, side) => {
        let top = previousTop;
        for (const prior of placed) {
          const intersects = left < prior.left + prior.width + 16 && left + frame.width + 16 > prior.left;
          if (intersects) top = Math.max(top, prior.top + prior.height + gap);
        }
        return { ...frame, left, top, side };
      });
      candidates.sort((a, b) => a.top - b.top || Number(a.side !== hash(`side:${frame.id}`) % 2) - Number(b.side !== hash(`side:${frame.id}`) % 2));
      const selected = candidates[0];
      placed.push(selected);
      previousTop = selected.top;
    }
    return placed;
  }

  // Exposed only to allow a lightweight smoke check of the mock's rules.
  globalThis.ScrapbookMock = { appearance, preparePhotos, packFrames, scenes };
  const preview = document.querySelector('#scrapbookPreview');
  const target = document.querySelector('#scrapbookPhotos') || preview;
  if (!target) return;
  const scenario = document.querySelector('#layoutScenario');
  const status = document.querySelector('#layoutStatus');
  let photos = preparePhotos(scenes.mixed);
  if (preview) photos = photos.slice(0, 2);
  let added = 0;

  function positionCards() {
    const width = target.clientWidth;
    if (!width || !photos.length) return;
    const frames = [...target.querySelectorAll('a[data-photo]')].map((card, index) => {
      const photo = photos[index];
      const frameWidth = Math.max(1, (width - 64) * (photo.fraction ?? preferredFraction(photo)));
      card.style.width = `${frameWidth}px`;
      const frameHeight = card.offsetHeight;
      const angle = Math.abs(appearance(photo).tilt) * Math.PI / 180;
      const rotatedWidth = frameWidth * Math.cos(angle) + frameHeight * Math.sin(angle);
      const rotatedHeight = frameWidth * Math.sin(angle) + frameHeight * Math.cos(angle);
      return {
        id: photo.id,
        width: rotatedWidth,
        height: rotatedHeight + 16,
        insetX: (rotatedWidth - frameWidth) / 2,
        insetY: (rotatedHeight - frameHeight) / 2 + 12,
      };
    });
    const positions = packFrames(frames, width);
    target.querySelectorAll('a[data-photo]').forEach((card, index) => {
      const position = positions[index];
      card.style.left = `${position.left + position.insetX}px`;
      card.style.top = `${position.top + position.insetY}px`;
    });
    target.style.height = `${Math.max(0, ...positions.map(item => item.top + item.height)) + 12}px`;
  }

  function render(message = '') {
    const fragment = document.createDocumentFragment();
    for (const [index, photo] of photos.entries()) {
      const style = appearance(photo);
      const card = document.createElement('a');
      card.className = 'photo';
      card.href = `assets/${photo.asset}.svg`;
      card.dataset.photo = photo.id;
      card.dataset.photoOrder = index;
      card.dataset.tape = style.tape;
      card.style.setProperty('--photo-tilt', `${style.tilt}deg`);
      const image = document.createElement('img');
      image.src = card.href;
      image.alt = photo.alt;
      image.width = photo.kind === 'portrait' ? 420 : 600;
      image.height = photo.kind === 'portrait' ? 600 : photo.asset === 'lake' ? 300 : 420;
      image.addEventListener('load', positionCards);
      const caption = document.createElement('span');
      caption.textContent = String(index + 1).padStart(2, '0');
      card.append(image, caption);
      fragment.append(card);
    }
    target.replaceChildren(fragment);
    target.hidden = photos.length === 0;
    positionCards();
    if (status) status.textContent = `${photos.length}枚。${message}`;
  }

  scenario?.addEventListener('change', () => {
    photos = preparePhotos(scenes[scenario.value]);
    added = 0;
    render('組み合わせの例を切り替えました。');
  });
  document.querySelectorAll('[data-layout-action]').forEach(button => {
    button.addEventListener('click', () => {
      switch (button.dataset.layoutAction) {
        case 'landscape':
        case 'portrait': {
          const kind = button.dataset.layoutAction;
          const next = sample(`added-${++added}`, kind, kind === 'portrait' ? 'forest' : 'lake', '追加した仮の写真');
          const last = photos.at(-1);
          const lastGroupSize = last ? photos.filter(photo => photo.group === last.group).length : 0;
          if (last && lastGroupSize === 1) {
            const pair = preparePhotos([last, next]).map(photo => ({ ...photo, group: last.group }));
            photos.splice(-1, 1, ...pair);
          } else {
            photos.push({ ...next, fraction: preferredFraction(next), group: last ? last.group + 1 : 0 });
          }
          render('末尾に追加しました。末尾が1枚だった場合は、その写真も収まるように幅を調整します。');
          break;
        }
        case 'remove':
          photos.shift();
          render('先頭を削除して前に詰めました。残った写真の幅・傾きは維持します。');
          break;
        case 'reopen':
          render('同じ内容を再表示しました。再抽選はしていません。');
          break;
        case 'reset':
          photos = preparePhotos(scenes[scenario.value]);
          added = 0;
          render('元の例に戻しました。');
          break;
      }
    });
  });
  let observedWidth = 0;
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      if (width !== observedWidth) { observedWidth = width; positionCards(); }
    }).observe(target);
  }
  render('幅・位置・傾き・余白に変化を付ける案です。開き直しても再抽選しません。');
})();
