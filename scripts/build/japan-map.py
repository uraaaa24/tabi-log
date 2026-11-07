"""Rebuild the offline geometry from the pinned dataofjapan GeoJSON.

python scripts/build/japan-map.py work/japan.geojson
Then run pnpm format. No network request is made by this script.
"""
import hashlib
import json
import sys
from pathlib import Path

source = Path(sys.argv[1]).read_bytes()
expected = 'b2fa31a9ce37c006904a06b8afcaeaf5ceeff40ae365eca167e09fbfff052f00'
if hashlib.sha256(source).hexdigest() != expected:
    raise SystemExit('Source checksum mismatch; review provenance before changing the map.')
data = json.loads(source)
result = []
for feature in sorted(data['features'], key=lambda f: f['properties']['id']):
    properties = feature['properties']
    polygons = feature['geometry']['coordinates']
    if feature['geometry']['type'] == 'Polygon':
        polygons = [polygons]
    rings = [ring for polygon in polygons for ring in polygon]
    projected = [[(round((x - 122) * 22, 2), round((46 - y) * 27, 2))
                  for x, y, *_ in ring] for ring in rings]
    main = max(projected, key=lambda ring: abs(sum(
        a[0] * b[1] - b[0] * a[1] for a, b in zip(ring, ring[1:]))))
    center = [round(sum(x for x, y in main) / len(main), 2),
              round(sum(y for x, y in main) / len(main), 2)]
    path = ' '.join('M' + ' L'.join(f'{x},{y}' for x, y in ring) + ' Z'
                    for ring in projected)
    result.append(dict(id=f"JP-{properties['id']:02}", name=properties['nam_ja'],
                       path=path, x=center[0], y=center[1]))
if len(result) != 47:
    raise SystemExit('Expected 47 prefectures.')
Path('src/features/map/domain/prefectures.json').write_text(
    json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n')
