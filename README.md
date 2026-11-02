# UrbanPulse – Hyderabad Smart City Geospatial Intelligence

[![AWS Builder Center Challenge](https://img.shields.io/badge/AWS%20Builder%20Center-Map%20It%20Challenge-FF9900?logo=amazon-aws)](https://community.aws)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre-GL%20JS-396B94?logo=maplibre)](https://maplibre.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**UrbanPulse** is an interactive urban infrastructure intelligence platform for Greater Hyderabad, Telangana. It empowers urban planners, civic leaders, and citizens to analyze the spatial distribution, accessibility, and density of essential public services across the city—including healthcare facilities, multimodal transit hubs, emergency units, and urban green spaces.

Built for the **AWS Builder Center Weekend Challenge: Map It** (closing November 2, 2026), UrbanPulse demonstrates a production-grade, modular geospatial architecture integrating **MapLibre GL JS**, **Amazon Location Service**, and **Amazon S3**.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Project Overview & Key Features](#project-overview--key-features)
3. [Architecture Overview](#architecture-overview)
4. [AWS Architecture & Integration](#aws-architecture--integration)
   - [Implemented AWS Integrations](#implemented-aws-integrations)
   - [Planned / CloudFormation Backend](#planned--cloudformation-backend)
5. [Real Geographical Datasets & Data Transparency](#real-geographical-datasets--data-transparency)
6. [Technology Stack](#technology-stack)
7. [Local Setup & Installation](#local-setup--installation)
8. [Deployment Instructions](#deployment-instructions)
9. [UI Features & User Experience](#ui-features--user-experience)
10. [Attribution & Licenses](#attribution--licenses)

---

## Problem Statement

Greater Hyderabad is one of the fastest-growing metropolitan regions in South Asia, spanning over 650 square kilometers and housing over 10 million residents. As urban sprawl rapidly accelerates along the Outer Ring Road (ORR) and the western technology corridors (HITEC City, Gachibowli, Financial District), **equitable access to critical public infrastructure remains uneven**:

- **Healthcare Access**: Specialty government and empanelled tertiary hospitals remain heavily clustered in the historic central core (Koti, Nampally, Punjagutta, Secunderabad), while suburban fringes rely on primary health clinics (UPHCs) and private centers.
- **Multimodal Transit Integration**: Ensuring seamless first- and last-mile connectivity between the 3 Hyderabad Metro corridors, MMTS suburban rail lines, and TSRTC bus terminals requires fine-grained geospatial visualization.
- **Emergency Preparedness & Response**: Strategic positioning of fire stations and police stations is critical for rapid disaster and emergency response.

**UrbanPulse** addresses this challenge by aggregating real government GIS data and OpenStreetMap layers into a unified, high-performance spatial intelligence dashboard with real-time viewport analytics and kernel density heatmaps.

---

## Project Overview & Key Features

### 1. Interactive High-Performance Map
- **Geographic Center**: Centered on Hyderabad (`17.3850° N, 78.4867° E`), Zoom level 11.
- **MapLibre GL Engine**: 60 FPS WebGL vector rendering with 35° 3D isometric pitch toggle, smooth bearing rotation, and responsive pan/zoom.
- **Basemap Style Switcher**: Toggle dynamically between **Cyber Dark (Carto Dark Matter)**, **Navigation Light (Voyager)**, **OpenStreetMap Standard**, and **Amazon Location Service (Esri Dark Gray & HERE Explore)**.

### 2. 100% Real Geographical Open Data (578 Verified Records)
- **303 Healthcare Facilities**: 36 Major Government Hospitals, 121 Private Arogyasri Empanelled Hospitals, and 146 Primary Health Clinics (UPHCs).
- **116 Transit Nodes**: 25 Hyderabad Metro Stations (Red, Blue, Green lines), 31 MMTS Suburban Rail Stations, and 60 Major Bus Terminals & Interchanges.
- **86 Emergency Units**: 60 Police Stations and 26 Fire Stations across Hyderabad, Cyberabad, and Rachakonda.
- **63 Urban Parks & Green Spaces**: HMDA & GHMC public parks, urban forestry zones, and waterbody perimeters.
- **10 Premier Civic & University Landmarks**: GHMC HQ, HMDA Complex, Telangana Secretariat, Osmania University, HCU, IIIT-H, JNTUH, and State Central Library.
- *Zero synthetic or fake coordinates are used. All points are validated against the Hyderabad Metropolitan bounding box with spatial deduplication.*

### 3. Spatial Analytics & Kernel Density Heatmap
- **Continuous Density Heatmap**: WebGL-powered kernel density estimation (KDE) with configurable smoothing radius (15px to 60px) and density gradients.
- **Sector Isolation**: Focus heatmaps specifically on Healthcare, Transit, or Emergency response corridors.
- **Dynamic Viewport Telemetry**: Real-time counter of visible points and category breakdown that recalculates instantly on every map drag, zoom, and pitch change.

### 4. Smart City Directory & Search
- **Instant Search**: Type-ahead filter across facility names, addresses, and subcategories with automatic map centering.
- **Multi-Category Filter Matrix**: Toggle individual categories and subcategory badges simultaneously.
- **District / Zone Filtering**: Filter by Hyderabad, Ranga Reddy, Medchal-Malkajgiri, or Sangareddy.

### 5. Facility Detail Drawer
- Slide-out card with exact GPS coordinates (with one-click copy), address, operating status, hospital specialities, contact phone, data provenance, and quick links to Google Maps and OpenStreetMap.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                 UrbanPulse Client                                 |
|                               (React + TypeScript)                                |
+-----------------------------------------------------------------------------------+
       |                                   |                                |
       v                                   v                                v
+------------------+             +-------------------+             +----------------+
|  MapLibre GL JS  |             | Viewport Engine & |             | Recharts & KPI |
|  (WebGL Vector)  |             |  Spatial Filters  |             |   Analytics    |
+------------------+             +-------------------+             +----------------+
       ^                                   ^                                ^
       |                                   |                                |
+-----------------------------------------------------------------------------------+
|                             Modular Integration Layer                             |
+-----------------------------------------------------------------------------------+
       |                                                            |
       v                                                            v
+-------------------------------+                     +-----------------------------+
|   Map Provider Adapter        |                     |     S3 Data Loader          |
|  - Carto Dark Matter (Default)|                     |  - Amazon S3 Bucket Fetch   |
|  - OpenStreetMap Standard     |                     |  - Bundled GeoJSON Fallback |
|  - Amazon Location Service    |                     |  - GeoJSON Partition Cache  |
+-------------------------------+                     +-----------------------------+
       |                                                            |
       | (When API Key is configured)                               | (When S3 URL is provided)
       v                                                            v
+-----------------------------------------------+     +-----------------------------+
|            AWS Cloud Services                 |     |     Amazon Simple Storage   |
|         Amazon Location Service               |     |          Service (S3)       |
|  (VectorEsriDarkGrayCanvas / VectorHereExplore) |     | (GeoJSON Datasets Lake)     |
+-----------------------------------------------+     +-----------------------------+
```

---

## AWS Architecture & Integration

UrbanPulse was engineered to fulfill the requirements of the **AWS Builder Center Weekend Challenge: Map It**.

### Implemented AWS Integrations

1. **Amazon Location Service Provider Adapter** (`src/services/aws/mapProviderAdapter.ts`):
   - Integrates with the Amazon Location Maps API.
   - Generates signed/API key style descriptor URLs:
     `https://maps.geo.{region}.amazonaws.com/maps/v0/maps/{mapName}/style-descriptor?key={apiKey}`
   - Supports Amazon Location styles: `VectorEsriDarkGrayCanvas` and `VectorHereExplore`.
   - Incorporates automated fallback to high-contrast Dark Matter cartography when credentials are not supplied during local development.

2. **Amazon S3 Geospatial Data Lake Adapter** (`src/services/aws/s3DataLoader.ts`):
   - Fetches partitioned GeoJSON datasets (`datasets/hyderabad_infrastructure.geojson`) from an S3 bucket or CloudFront distribution.
   - Monitors request latency, status ('amazon-s3' vs 'local-static-asset'), and item counts.
   - Cleanly falls back to local pre-bundled GeoJSON when offline or unconfigured.

3. **In-App AWS Configuration & Architecture Dialog** (`src/components/Modals/AwsConfigModal.tsx`):
   - Accessible via the **AWS Architecture** header pill.
   - Validates live connectivity against the Amazon Location Service endpoint.
   - Allows judges or operators to enter an AWS API Key and test live map rendering without rebuilding the codebase.
   - Provides ready-to-deploy AWS CloudFormation templates.

### Planned / CloudFormation Backend

For production deployment on AWS infrastructure:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: UrbanPulse Hyderabad Geospatial Infrastructure Backend
Resources:
  UrbanPulseMap:
    Type: AWS::Location::Map
    Properties:
      MapName: UrbanPulseHyderabadMap
      Configuration:
        Style: VectorEsriDarkGrayCanvas
      Description: Hyderabad Smart City Dark Vector Style

  UrbanPulseApiKey:
    Type: AWS::Location::APIKey
    Properties:
      KeyName: UrbanPulseApiKey
      Restrictions:
        AllowActions:
          - 'geo:GetMap*'
        AllowResources:
          - !GetAtt UrbanPulseMap.Arn

  UrbanPulseDataBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: urbanpulse-hyderabad-geodata
      CorsConfiguration:
        CorsRules:
          - AllowedHeaders: ['*']
            AllowedMethods: [GET, HEAD]
            AllowedOrigins: ['*']
            MaxAge: 3600
```

---

## Real Geographical Datasets & Data Transparency

All spatial records in UrbanPulse originate from genuine open-government data and open GIS projects:

| Dataset | Record Count | Official Source | License |
| :--- | :---: | :--- | :--- |
| **Government Hospitals** | 36 | Telangana Health Dept / Lakeer Open Data | OGDL India |
| **Private Hospitals (Empanelled)** | 121 | Arogyasri Health Care Trust / Lakeer Open Data | OGDL India |
| **Primary Health Clinics (UPHCs)** | 146 | National Health Mission / Lakeer Open Data | OGDL India |
| **Hyderabad Metro Stations** | 25 | Hyderabad Metro Rail Limited (HMRL) | ODbL |
| **MMTS Suburban Rail Stations** | 31 | South Central Railway (SCR) | ODbL |
| **Major Bus Terminals & Hubs** | 60 | TSRTC / Lakeer Open GIS Data | OGDL India |
| **Police Stations** | 60 | Hyderabad, Cyberabad, Rachakonda Police | ODbL / Open Data |
| **Fire Stations** | 26 | Telangana State Disaster Response & Fire Services | ODbL / Open Data |
| **Public Parks & Green Spaces** | 63 | GHMC & HMDA Urban Forestry | OGDL India |
| **Civic & University Landmarks** | 10 | Survey of India / OpenStreetMap | ODbL |
| **TOTAL** | **578** | **Greater Hyderabad Metropolitan Area** | — |

### Data Processing Pipeline
A dedicated Python script (`scripts/fetch_and_process_data.py`) downloads the raw GeoJSON sources, cleans names, extracts telephone numbers and medical specialities, validates coordinates against the Hyderabad bounding box (`78.10°E - 78.75°E`, `17.15°N - 17.65°N`), corrects flipped latitude/longitude coordinates, removes duplicates within 100 meters, and outputs optimized GeoJSON feature collections.

---

## Technology Stack

- **Frontend Core**: React 18, TypeScript 5.7, Vite 6
- **Styling & UI**: Tailwind CSS 3.4 (Cyber Dark palette `#0B0F19`), Lucide React icons
- **Mapping & GIS**: MapLibre GL JS 5.0, GeoJSON specification
- **Analytics & Data Viz**: Recharts 2.15 (Responsive Bar, Donut, and KPI cards)
- **Cloud & Maps Adapter**: Amazon Location Service adapter, Amazon S3 data loader
- **Build & Optimization**: Rollup custom chunking (`vendor-map`, `vendor-charts`, `vendor-react`)

---

## Local Setup & Installation

### Prerequisites
- Node.js (v18.0.0 or higher, tested on Node v26)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/urbanpulse-hyderabad.git
cd urbanpulse-hyderabad
```

### 2. Install dependencies
```bash
npm install
```

### 3. (Optional) Configure AWS Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Amazon Location Service API Key or S3 Bucket URL if available. If left empty, the application automatically runs in local development mode using MapLibre GL and Carto Dark Matter.

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```
The optimized static build will be generated in the `dist/` directory.

---

## Deployment Instructions

### Deploy to Vercel (Recommended)
1. Fork or push this repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and select this repo.
3. Vercel automatically detects the Vite framework with `dist/` output.
4. (Optional) Set `VITE_AWS_LOCATION_API_KEY` in Environment Variables.
5. Click **Deploy**.

The repository includes a ready-to-use `vercel.json` with client-side rewrites and GeoJSON cache headers.

### Deploy to AWS S3 + CloudFront
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Sync the `dist/` folder to your S3 hosting bucket:
   ```bash
   aws s3 sync dist/ s3://your-urbanpulse-hosting-bucket --delete
   ```
3. Invalidate CloudFront distribution:
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

---

## UI Features & User Experience

- **Dockable / Collapsible Sidebar**: Left panel collapsible to a 64px icon bar for maximum map canvas area.
- **Live Viewport KPI Telemetry**: Dynamically counts mapped locations currently visible on screen as the map pans.
- **Marker Clustering**: Interactive clusters with dynamic sizing (Cyan `<15`, Emerald `15-40`, Amber `40-80`, Rose `80+`) and click-to-expand animation.
- **Kernel Density Heatmap**: Smooth WebGL raster visualization of infrastructure concentration.
- **Floating Controls**: Search input with instant fly-to, category quick chips, 3D tilt toggle, and style switcher.
- **Glassmorphism Design**: Dark Navy surfaces (`#0B0F19`, `#111827`) with glowing category accents and responsive layouts.

---

## Attribution & Licenses

- **Datasets**: Curated by [Lakeer Urban Data Non-Profit](https://github.com/Lakeer-org/hyderabad-open-gis-data), [OpenCity.in](https://opencity.in), Government of Telangana (Arogyasri Health Care Trust, HMDA, GHMC), and [OpenStreetMap](https://www.openstreetmap.org) contributors.
- **Map Vector Tiles**: CartoDB / OpenStreetMap contributors.
- **Application Code**: MIT License. Built for the AWS Builder Center Weekend Challenge: Map It.
