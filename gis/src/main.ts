import { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';

const tileUrl = `${location.origin}/data/sentinel/before/{z}/{x}/{y}.png`;
console.log(tileUrl)

const map = new Map({
  container: 'map',
  center: [136.92, 37.05], // 能登半島
  zoom: 8,
  minZoom: 5,
  maxZoom: 12,
  maxBounds: [122, 20, 154, 50], // 表示可能エリア(日本周辺)
  style: {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      },
      ishikawa_section: {
        type: 'geojson',
        data: "/data/ishikawa-section.geojson",
      },
      shelter: {
        type: 'geojson',
        data: "/data/shelter.geojson",
      },
      chubu_natural: {
        type: 'geojson',
        data: "/data/natural.geojson",
      },
      dosekiryu: {
        type: 'raster',
        tiles: [
          'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki_data/17/{z}/{x}/{y}.png',
        ],
        minzoom: 2,
        maxzoom: 12,
        tileSize: 256,
        attribution:
          '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
      },
      tsunami: {
        type: 'raster',
        tiles: [
          'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png',
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution:
          '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
      },
      // sentinel_before: {
      //   type: 'image',
      //   url: '/sentinel/Noto_Median_Composite_Before_20240101_RGB.png',
      //   coordinates: [
      //     [136.59629496723144, 37.567545181878394], // top-left
      //     [137.38699208031343, 37.567545181878394], // top-right
      //     [137.38699208031343, 36.701120090345114], // bottom-right
      //     [136.59629496723144, 36.701120090345114], // bottom-left
      //   ],
      // },
      sentinel_before: {
        type: 'raster',
        tiles: ['/data/sentinel/before/{z}/{x}/{y}.png'],
        tileSize: 256,
      },
      // sentinel_after: {
      //   type: 'image',
      //   url: '/sentinel/Noto_Median_Composite_After_20240101_RGB.png',
      //   coordinates: [
      //     [136.59629496723144, 37.567545181878394], // top-left
      //     [137.38699208031343, 37.567545181878394], // top-right
      //     [137.38699208031343, 36.701120090345114], // bottom-right
      //     [136.59629496723144, 36.701120090345114], // bottom-left
      //   ],
      // },
      sentinel_after: {
        type: 'raster',
        tiles: ['/data/sentinel/after/{z}/{x}/{y}.png'],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: 'osm',
        type: 'raster',
        source: 'osm',
      },
    ],
  },
});

const layers: any = [
  {
    id: 'sentinel_before',
    type: 'raster',
    source: 'sentinel_before',
  },
  {
    id: 'sentinel_after',
    type: 'raster',
    source: 'sentinel_after',
  },
  {
    id: 'ishikawa_section_fill',
    type: 'fill',
    source: 'ishikawa_section',
    paint: {
      'fill-color': '#ffd700',
      'fill-opacity': 0.3,
    },
  },
  {
    id: 'ishikawa_section_line',
    type: 'line',
    source: 'ishikawa_section',
    paint: {
      'line-color': '#ffffff',
      'line-opacity': 0.8,
      'line-width': 1,
    },
  },
  {
    id: 'shelter',
    source: 'shelter',
    type: 'circle',
    paint: {
      'circle-color': '#ff6347',
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        5,
        0.05,
        12,
        0.8,
      ],
    },
  },
  {
    id: 'dosekiryu',
    type: 'raster',
    source: 'dosekiryu',
    paint: {
      'raster-opacity': 1
    },
  },
  {
    id: 'tsunami',
    type: 'raster',
    source: 'tsunami',
    paint: {
      'raster-opacity': 1
    },
  },
]

const opacity = new OpacityControl({
  baseLayers: {
    'sentinel_before': '光学画像（災害前）',
    'sentinel_after': '光学画像（災害後）',
  },
  overLayers: {
    'ishikawa_section_fill': '地域区画 (polygon)',
    'ishikawa_section_line': '地域区画 (line)',
    'dosekiryu': '土石流警戒区域',
    'tsunami': '津波警戒区域',
    'shelter': '避難所',
  },
});

map.on('load', () => {

  for (const layer of layers) {
    map.addLayer(layer);
  }

  map.addControl(opacity, 'top-left');
});

map.on('error', (e) => {
  console.error('Map error:', e.error);
});