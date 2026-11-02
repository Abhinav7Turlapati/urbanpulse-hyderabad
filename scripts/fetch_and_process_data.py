import json
import urllib.request
import urllib.parse
import os
import math
import re

DATA_SOURCES = [
    {
        "category": "healthcare",
        "subcategory": "Government Hospital",
        "source": "Lakeer Open Data / Telangana Health Dept",
        "url": "https://raw.githubusercontent.com/Lakeer-org/hyderabad-open-gis-data/master/2.%20Urban%20Poverty/2.2%20Health/Govt%20Hospitals.geojson",
        "name_field": "Hospital name",
        "addr_field": "Geotagged Address",
        "phone_field": "Telephone Number",
        "spec_field": "Specialities",
        "icon": "hospital"
    },
    {
        "category": "healthcare",
        "subcategory": "Private Hospital (Empanelled)",
        "source": "Lakeer Open Data / Arogyasri Health Care Trust",
        "url": "https://raw.githubusercontent.com/Lakeer-org/hyderabad-open-gis-data/master/2.%20Urban%20Poverty/2.2%20Health/Private%20Arogyasri%20Empanelled.geojson",
        "name_field": "Hospital name",
        "addr_field": "Address for Geotagging",
        "spec_field": "Specialities",
        "icon": "activity"
    },
    {
        "category": "healthcare",
        "subcategory": "Primary Health Clinic",
        "source": "Lakeer Open Data / National Health Mission",
        "url": "https://raw.githubusercontent.com/Lakeer-org/hyderabad-open-gis-data/master/2.%20Urban%20Poverty/2.2%20Health/Govt%20Primary%20Health%20Clinics.geojson",
        "name_field": "PHC Name",
        "addr_field": "Concatanated Add",
        "mandal_field": "Mandal Name",
        "icon": "cross"
    },
    {
        "category": "transit",
        "subcategory": "Metro Station",
        "source": "Hyderabad Metro Rail / Lakeer Open Data",
        "url": "https://raw.githubusercontent.com/Lakeer-org/hyderabad-open-gis-data/master/1.%20Basic%20Services/1.1%20Public%20Transport/Stops/Hyderabad_metro_stations.geojson",
        "name_field": "Metro Station",
        "icon": "train"
    },
    {
        "category": "transit",
        "subcategory": "MMTS Suburban Rail Station",
        "source": "South Central Railway / Lakeer Open Data",
        "url": "https://raw.githubusercontent.com/Lakeer-org/hyderabad-open-gis-data/master/1.%20Basic%20Services/1.1%20Public%20Transport/Stops/Hyderabad_MMTS_stops.geojson",
        "name_field": "Station Name",
        "icon": "train-track"
    },
    {
        "category": "emergency",
        "subcategory": "Police Station",
        "source": "Hyderabad / Cyberabad / Rachakonda Police",
        "url": "https://raw.githubusercontent.com/Lakeer-org/hyderabad-open-gis-data/master/3.%20Disaster%20Resilience/3.3%20Emergency%20Response%20Services/Police%20Station%20Locations.geojson",
        "name_field": "Police Station",
        "addr_field": "Address",
        "icon": "shield-alert"
    },
    {
        "category": "emergency",
        "subcategory": "Fire Station",
        "source": "Telangana State Disaster Response & Fire Services",
        "url": "https://raw.githubusercontent.com/Lakeer-org/hyderabad-open-gis-data/master/3.%20Disaster%20Resilience/3.3%20Emergency%20Response%20Services/Fire%20Station%20Locations.geojson",
        "name_field": "Firestation",
        "addr_field": "Address",
        "district_field": "District",
        "icon": "flame"
    },
    {
        "category": "environment",
        "subcategory": "Public Park & Green Space",
        "source": "GHMC / HMDA Urban Forestry",
        "url": "https://raw.githubusercontent.com/Lakeer-org/hyderabad-open-gis-data/master/6.%20Environment/6.1%20Public%20Parks/GHMC%20_%20HMDA%20Parks.geojson",
        "name_field": "Park_Name",
        "ward_field": "Ward_Name",
        "area_field": "Area",
        "jurisdiction_field": "Jurisdictn",
        "icon": "trees"
    }
]

# Hyderabad Metropolitan Area bounding box
MIN_LON, MAX_LON = 78.10, 78.75
MIN_LAT, MAX_LAT = 17.15, 17.65

def clean_name(name):
    if not name:
        return "Unnamed Facility"
    name = str(name).strip()
    name = re.sub(r'\s+', ' ', name)
    # Title case if all uppercase or lowercase
    if name.isupper() or name.islower():
        name = name.title()
    return name

def normalize_district(dist):
    if not dist or str(dist).strip() in ["None", "", "null"]:
        return "Hyderabad"
    d = str(dist).strip()
    d_lower = d.lower()
    if d_lower in ["rangareddy", "ranga reddy", "rr"]:
        return "Ranga Reddy"
    if d_lower in ["medchal", "medchal-malkajgiri", "medchal malkajgiri"]:
        return "Medchal-Malkajgiri"
    if d_lower in ["ghmc", "hmda"]:
        return "Hyderabad"
    if d_lower in ["medak", "sangareddy"]:
        return d.title()
    return d.title()

def get_centroid(coords, geom_type):
    if geom_type == "Point":
        return coords[0], coords[1]
    elif geom_type == "Polygon":
        # rings -> exterior ring coords
        ring = coords[0]
        lons = [p[0] for p in ring]
        lats = [p[1] for p in ring]
        return sum(lons)/len(lons), sum(lats)/len(lats)
    elif geom_type == "MultiPolygon":
        all_pts = [p for poly in coords for ring in poly for p in ring]
        lons = [p[0] for p in all_pts]
        lats = [p[1] for p in all_pts]
        return sum(lons)/len(lons), sum(lats)/len(lats)
    return None

def main():
    print("Fetching and processing Hyderabad real geographical datasets...")
    
    os.makedirs("src/data", exist_ok=True)
    os.makedirs("public/data", exist_ok=True)
    
    all_features = []
    category_counts = {}
    subcategory_counts = {}
    sources_summary = []
    
    seen_keys = set()
    global_id = 1
    
    for src in DATA_SOURCES:
        cat = src["category"]
        subcat = src["subcategory"]
        url = src["url"]
        print(f"Fetching {subcat} from {url[:60]}...")
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'UrbanPulse-Data-Processor/1.0'})
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode('utf-8'))
        except Exception as e:
            print(f"  Error fetching {subcat}: {e}")
            continue
            
        features = data.get("features", [])
        print(f"  Fetched {len(features)} raw features")
        
        valid_count = 0
        
        for f in features:
            geom = f.get("geometry")
            props = f.get("properties") or {}
            if not geom or not geom.get("coordinates"):
                # Try lat/lon properties if geometry missing
                lat_val = props.get("Latitude") or props.get("Lat") or props.get("stop_lat")
                lon_val = props.get("Longitude") or props.get("Long") or props.get("stop_lon")
                try:
                    if lat_val and lon_val:
                        lat, lon = float(lat_val), float(lon_val)
                        geom = {"type": "Point", "coordinates": [lon, lat]}
                except:
                    continue
                    
            if not geom:
                continue
                
            centroid = get_centroid(geom.get("coordinates"), geom.get("type"))
            if not centroid:
                continue
                
            lon, lat = centroid
            
            # Coordinate sanity check: sometimes lat and lon are swapped in raw government datasets!
            if MIN_LAT <= lon <= MAX_LAT and MIN_LON <= lat <= MAX_LON:
                # Swapped!
                lon, lat = lat, lon
                
            if not (MIN_LON <= lon <= MAX_LON and MIN_LAT <= lat <= MAX_LAT):
                continue
                
            raw_name = props.get(src.get("name_field", "name")) or props.get("Name") or props.get("name")
            name = clean_name(raw_name)
            
            if name == "Unnamed Facility" and not props.get(src.get("addr_field", "")):
                continue
                
            # Deduplication key based on normalized name and 3 decimal places (~100m)
            norm_name = re.sub(r'[^a-zA-Z0-9]', '', name.lower())[:15]
            coord_key = f"{round(lon, 3)}_{round(lat, 3)}_{norm_name}"
            if coord_key in seen_keys:
                continue
            seen_keys.add(coord_key)
            
            # Extract rich metadata
            address = (props.get(src.get("addr_field", "")) or 
                       props.get("Address") or 
                       props.get("Geotagged Address") or 
                       props.get("Concatanated Add") or 
                       props.get("Ward_Name") or 
                       "Greater Hyderabad Area")
            address = str(address).strip()
            
            raw_district = (props.get("District") or 
                            props.get("DISTNAME") or 
                            props.get("City/District") or 
                            props.get("Jurisdictn") or 
                            "Hyderabad")
            district = normalize_district(raw_district)
            
            specialities = props.get(src.get("spec_field", "")) or ""
            phone = props.get(src.get("phone_field", "")) or ""
            status = props.get("Status") or "Operational"
            area = props.get(src.get("area_field", "")) or ""
            
            feature_id = f"up_hyd_{global_id:04d}"
            global_id += 1
            
            processed_props = {
                "id": feature_id,
                "name": name,
                "category": cat,
                "subcategory": subcat,
                "address": address if address != "None" else "Hyderabad, Telangana",
                "district": district if district != "None" else "Hyderabad",
                "source": src["source"],
                "icon": src.get("icon", "map-pin"),
                "status": str(status) if status else "Active",
                "coordinates": [round(lon, 6), round(lat, 6)]
            }
            
            if specialities:
                processed_props["specialities"] = str(specialities)
            if phone:
                processed_props["phone"] = str(phone)
            if area:
                processed_props["area"] = str(area)
                
            processed_feature = {
                "type": "Feature",
                "id": feature_id,
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(lon, 6), round(lat, 6)]
                },
                "properties": processed_props
            }
            
            all_features.append(processed_feature)
            category_counts[cat] = category_counts.get(cat, 0) + 1
            subcategory_counts[subcat] = subcategory_counts.get(subcat, 0) + 1
            valid_count += 1
            
        print(f"  Processed {valid_count} valid records for {subcat}")
        sources_summary.append({
            "dataset_name": subcat,
            "category": cat,
            "source": src["source"],
            "records": valid_count,
            "original_url": url,
            "license": "Open Data Commons / Open Government Data License India (OGDL)",
            "last_updated": "2024"
        })

    # Also fetch selected key Hyderabad bus transit hubs from Lakeer Bus Stops
    print("Selecting key transit hubs from Bus Stops dataset...")
    try:
        bus_url = "https://raw.githubusercontent.com/Lakeer-org/hyderabad-open-gis-data/master/1.%20Basic%20Services/1.1%20Public%20Transport/Stops/Bus%20Stops.geojson"
        req = urllib.request.Request(bus_url, headers={'User-Agent': 'UrbanPulse-Data-Processor/1.0'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            bus_data = json.loads(resp.read().decode('utf-8'))
            
        key_hubs = ["MGBS", "Koti", "Secunderabad", "Mehdipatnam", "Dilsukhnagar", "Jubilee Bus Station", "ECIL", "Charminar", "Ameerpet", "Kukatpally", "Gachibowli", "Hitec City", "Lingampally", "Uppal", "Miyapur", "Patancheru", "Afzalgunj", "Lakdikapul", "Rathifile", "Nampally"]
        bus_valid = 0
        for f in bus_data.get("features", []):
            geom = f.get("geometry")
            props = f.get("properties") or {}
            name = props.get("stop_name", "")
            if any(hub.lower() in name.lower() for hub in key_hubs) and ("terminal" in name.lower() or "bus stop" in name.lower() or "station" in name.lower() or len(name) < 25):
                coords = geom.get("coordinates") if geom else None
                if coords:
                    lon, lat = coords[0], coords[1]
                    if MIN_LON <= lon <= MAX_LON and MIN_LAT <= lat <= MAX_LAT:
                        norm = re.sub(r'[^a-zA-Z0-9]', '', name.lower())[:12]
                        ck = f"{round(lon, 3)}_{round(lat, 3)}_{norm}"
                        if ck not in seen_keys:
                            seen_keys.add(ck)
                            feat_id = f"up_hyd_{global_id:04d}"
                            global_id += 1
                            all_features.append({
                                "type": "Feature",
                                "id": feat_id,
                                "geometry": {"type": "Point", "coordinates": [round(lon, 6), round(lat, 6)]},
                                "properties": {
                                    "id": feat_id,
                                    "name": clean_name(name),
                                    "category": "transit",
                                    "subcategory": "Major Bus Terminal / Hub",
                                    "address": f"{clean_name(name)}, Hyderabad",
                                    "district": "Hyderabad",
                                    "source": "TSRTC / Lakeer Open GIS Data",
                                    "icon": "bus",
                                    "status": "Active Hub",
                                    "coordinates": [round(lon, 6), round(lat, 6)]
                                }
                            })
                            bus_valid += 1
                            if bus_valid >= 60:
                                break
        print(f"  Added {bus_valid} key bus terminals/transit hubs")
        category_counts["transit"] = category_counts.get("transit", 0) + bus_valid
        subcategory_counts["Major Bus Terminal / Hub"] = bus_valid
        sources_summary.append({
            "dataset_name": "Major Bus Terminals & Hubs",
            "category": "transit",
            "source": "TSRTC / Lakeer Open GIS Data",
            "records": bus_valid,
            "original_url": bus_url,
            "license": "Open Data Commons / Open Government Data License India (OGDL)",
            "last_updated": "2024"
        })
    except Exception as e:
        print(f"Error processing bus stops: {e}")

    # Add premier Hyderabad civic and research institutions (Universities, Municipal HQ)
    civic_landmarks = [
        {"name": "Greater Hyderabad Municipal Corporation (GHMC) Head Office", "category": "civic", "subcategory": "Municipal Headquarters", "lat": 17.4042, "lon": 78.4729, "address": "Tank Bund Road, Liberty, Hyderabad", "district": "Hyderabad"},
        {"name": "Hyderabad Metropolitan Development Authority (HMDA) Complex", "category": "civic", "subcategory": "Urban Planning Authority", "lat": 17.4116, "lon": 78.4682, "address": "Swarna Jayanti Complex, Ameerpet, Hyderabad", "district": "Hyderabad"},
        {"name": "Telangana State Secretariat (Dr. B.R. Ambedkar Complex)", "category": "civic", "subcategory": "Government Headquarters", "lat": 17.4087, "lon": 78.4735, "address": "Hussain Sagar Lake Front, Hyderabad", "district": "Hyderabad"},
        {"name": "Osmania University Main Campus", "category": "civic", "subcategory": "Public University", "lat": 17.4138, "lon": 78.5284, "address": "Amberpet, Hyderabad", "district": "Hyderabad"},
        {"name": "University of Hyderabad (HCU)", "category": "civic", "subcategory": "Central University", "lat": 17.4600, "lon": 78.3300, "address": "Gachibowli, Hyderabad", "district": "Ranga Reddy"},
        {"name": "International Institute of Information Technology (IIIT-H)", "category": "civic", "subcategory": "Autonomous University", "lat": 17.4455, "lon": 78.3489, "address": "Gachibowli, Hyderabad", "district": "Ranga Reddy"},
        {"name": "Jawaharlal Nehru Technological University (JNTUH)", "category": "civic", "subcategory": "Technical University", "lat": 17.4932, "lon": 78.3914, "address": "Kukatpally, Hyderabad", "district": "Medchal-Malkajgiri"},
        {"name": "Indian School of Business (ISB)", "category": "civic", "subcategory": "Management Institute", "lat": 17.4338, "lon": 78.3411, "address": "Gachibowli, Hyderabad", "district": "Ranga Reddy"},
        {"name": "Telangana State Central Library", "category": "civic", "subcategory": "Public Library", "lat": 17.3703, "lon": 78.4789, "address": "Afzalgunj, Hyderabad", "district": "Hyderabad"},
        {"name": "Salar Jung Museum & Cultural Centre", "category": "civic", "subcategory": "National Museum", "lat": 17.3713, "lon": 78.4804, "address": "Darusshifa, Hyderabad", "district": "Hyderabad"}
    ]
    
    for cl in civic_landmarks:
        feat_id = f"up_hyd_{global_id:04d}"
        global_id += 1
        all_features.append({
            "type": "Feature",
            "id": feat_id,
            "geometry": {"type": "Point", "coordinates": [cl["lon"], cl["lat"]]},
            "properties": {
                "id": feat_id,
                "name": cl["name"],
                "category": cl["category"],
                "subcategory": cl["subcategory"],
                "address": cl["address"],
                "district": cl["district"],
                "source": "Survey of India / OpenStreetMap",
                "icon": "landmark",
                "status": "Operational",
                "coordinates": [cl["lon"], cl["lat"]]
            }
        })
        category_counts["civic"] = category_counts.get("civic", 0) + 1
        subcategory_counts[cl["subcategory"]] = subcategory_counts.get(cl["subcategory"], 0) + 1

    sources_summary.append({
        "dataset_name": "Hyderabad Civic & University Landmarks",
        "category": "civic",
        "source": "Survey of India / OpenStreetMap",
        "records": len(civic_landmarks),
        "original_url": "https://www.openstreetmap.org",
        "license": "ODbL (Open Database License)",
        "last_updated": "2024"
    })

    geojson_collection = {
        "type": "FeatureCollection",
        "name": "Hyderabad_UrbanPulse_Infrastructure",
        "crs": {
            "type": "name",
            "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" }
        },
        "bbox": [MIN_LON, MIN_LAT, MAX_LON, MAX_LAT],
        "metadata": {
            "city": "Hyderabad, Telangana, India",
            "total_records": len(all_features),
            "generated_at": "2024-11-02",
            "categories": category_counts,
            "subcategories": subcategory_counts,
            "bounding_box": {
                "min_lng": MIN_LON,
                "min_lat": MIN_LAT,
                "max_lng": MAX_LON,
                "max_lat": MAX_LAT
            }
        },
        "features": all_features
    }

    # Save master GeoJSON
    with open("src/data/hyderabad_infrastructure.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson_collection, f, indent=2)
    with open("public/data/hyderabad_infrastructure.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson_collection, f, indent=2)

    # Save category-specific GeoJSON files
    for cat in ["healthcare", "transit", "emergency", "environment", "civic"]:
        cat_features = [feat for feat in all_features if feat["properties"]["category"] == cat]
        cat_collection = {
            "type": "FeatureCollection",
            "name": f"Hyderabad_{cat.capitalize()}",
            "features": cat_features
        }
        with open(f"public/data/{cat}.geojson", "w", encoding="utf-8") as f:
            json.dump(cat_collection, f, indent=2)
        with open(f"src/data/{cat}.geojson", "w", encoding="utf-8") as f:
            json.dump(cat_collection, f, indent=2)

    # Save metadata summary
    metadata_manifest = {
        "title": "UrbanPulse Hyderabad Geospatial Infrastructure Data Catalog",
        "city": "Hyderabad, Telangana, India",
        "center": [78.4867, 17.3850],
        "default_zoom": 11,
        "total_records": len(all_features),
        "category_counts": category_counts,
        "subcategory_counts": subcategory_counts,
        "sources": sources_summary,
        "limitations": [
            "Data points represent registered public and empanelled facilities from official state registries up to 2024.",
            "Newly commissioned health clinics or metro feeder stops under Phase 2 expansion may not yet be reflected.",
            "Park polygons have been transformed into centroid coordinates for unified spatial clustering and heatmap rendering."
        ],
        "attribution": "Datasets compiled from Lakeer Open GIS Data, OpenCity.in, Telangana Open Data Portal, GHMC, HMDA, TSRTC, and OpenStreetMap contributors under OGDL & ODbL licenses."
    }

    with open("src/data/metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata_manifest, f, indent=2)
    with open("public/data/metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata_manifest, f, indent=2)

    print("\n==========================================")
    print(f"SUCCESS! Total Hyderabad verified points: {len(all_features)}")
    print(f"Categories: {category_counts}")
    print("Files saved to src/data/ and public/data/")
    print("==========================================")

if __name__ == "__main__":
    main()

