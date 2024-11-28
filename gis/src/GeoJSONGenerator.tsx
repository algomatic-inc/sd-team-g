import React, { useState } from 'react';
import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import type { Map, GeoJSONSource } from 'maplibre-gl';

interface GeoJSONGeneratorProps {
  map: Map;
}

export const GeoJSONGenerator: React.FC<GeoJSONGeneratorProps> = ({ map }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const GEOJSON_PROMPT = `
  以下の制約に従ってGeoJSONを生成してください：
  1. FeatureCollectionとして生成
  2. 能登半島周辺(緯度: 37.2-37.5, 経度: 136.9-137.2)の座標を使用
  3. Pointのみで表現
  4. 20個のPointを含む
  5. 20個のポイントは規則的に並ばずにランダムに散らしてください
  返答は必ずJSONのみにしてください。

  対象エリア: 能登半島の被害状況
  含めるべき情報: 建物被害、道路寸断、地滑り
  
  sampleJSON:
  """
  {
    "type": "FeatureCollection",
    "name": "17",
    "features": [
      { 
        "type": "Feature", 
        "geometry": { 
          "type": "Point", 
          "coordinates": [ 136.6481028, 36.55282538 ] 
        } 
      },
    ]
  }
  """  
  `;

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      type: {
        type: SchemaType.STRING,
        description: "Must be 'FeatureCollection'"
      },
      name: {
        type: SchemaType.STRING
      },
      features: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            type: {
              type: SchemaType.STRING,
              description: "Must be 'Feature'"
            },
            geometry: {
              type: SchemaType.OBJECT,
              properties: {
                type: {
                  type: SchemaType.STRING,
                  enum: ['Point', 'LineString', 'Polygon']
                },
                coordinates: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.NUMBER,
                  }
                }
              },
              required: ["type", "coordinates"]
            },
          },
          required: ["type", "geometry"]
        }
      }
    },
    required: ["type", "features"]
  };

  const generateAndAddToMap = async () => {
    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY); // Viteの環境変数を使用
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const result = await model.generateContent(GEOJSON_PROMPT);
      const response = result.response;
      const text = response.text();
      console.log(text)

      const geojson = JSON.parse(text);

      const sourceId = 'generated-geojson';
      if (map.getSource(sourceId)) {
        const source = map.getSource(sourceId) as GeoJSONSource;
        source.setData(geojson);
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson
        });

        // ポイントレイヤー
        map.addLayer({
          id: `${sourceId}-points`,
          type: 'circle',
          source: sourceId,
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              1,
              12,
              8,
            ],
            'circle-color': 'red',
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              0.8,
              12,
              0.8,
            ],
          }
        });
      }
    } catch (err) {
      setError('GeoJSONの生成に失敗しました');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
    position: 'fixed',
      top: '1rem',
      right: '1rem',
      background: 'white',
      padding: '1rem',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      width: '250px',
      zIndex: 1000
  }}>
  <h3 style={{
    margin: '0 0 0.5rem 0',
      fontSize: '1rem',
      fontWeight: 'bold'
  }}>
  被害状況の推論
  </h3>
  <button
  onClick={generateAndAddToMap}
  disabled={loading}
  style={{
    width: '100%',
      padding: '0.5rem',
      backgroundColor: loading ? '#ccc' : '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: loading ? 'not-allowed' : 'pointer'
  }}
>
  {loading ? '生成中...' : 'GeoJSONを生成'}
  </button>
  {error && (
    <p style={{
    marginTop: '0.5rem',
      color: '#dc3545',
      fontSize: '0.875rem'
  }}>
    {error}
    </p>
  )}
  </div>
);
};