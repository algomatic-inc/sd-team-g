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
      noto_public: {
        type: 'geojson',
        data: "/data/noto-public.geojson",
      },
      ishikawa_section: {
        type: 'geojson',
        data: "/data/ishikawa-section.geojson",
      },
      chubu_natural: {
        type: 'geojson',
        data: "/data/natural.geojson",
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
        id: 'ishikawa_section',
        type: 'fill',
        source: 'ishikawa_section',
        paint: {
          'fill-color': 'green',
          'fill-opacity': 0.5,
        },
      },
      {
        id: 'noto_public',
        type: 'fill',
        source: 'noto_public',
        paint: {
          'fill-color': 'blue',
          'fill-opacity': 0.8,
        },
      },
      {
        id: 'chubu_natural',
        type: 'circle',
        source: 'chubu_natural',
        paint: {
          'circle-radius': 3,
          'circle-color': 'red',
          'circle-opacity': 0.8,
        },
      },
    ],
  },
});

const opacity = new OpacityControl({
  baseLayers: {
    'sentinel_before': '光学画像（災害前）',
    'sentinel_after': '光学画像（災害後）',
  },
  overLayers: {
    'ishikawa_section': '地域区画',
    'noto_public': '公共施設',
    'chubu_natural': '自然',
  },
});

map.on('load', () => {
  console.log('load')
  map.addControl(opacity, 'top-left');
});

map.on('error', (e) => {
  console.error('Map error:', e.error);
});