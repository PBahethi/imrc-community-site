"""Fetch real US Census Bureau county population/age/sex + centroid data and
write a static snapshot to site/locality-data.json for the Locality Map page.

Sources (public, no API key required):
 - Population Estimates Program vintage 2024 county age/sex files:
   https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/asrh/cc-est2024-agesex-<state-fips>.csv
 - 2023 Census Gazetteer county centroids:
   https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_counties_national.zip

This is a one-time/occasional refresh script (not run on every build) since the
underlying Census vintage only updates annually. Re-run it manually to refresh
site/locality-data.json.
"""
import csv, datetime, io, json, pathlib, urllib.request, zipfile
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parents[1]
AGESEX_URL = "https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/asrh/cc-est2024-agesex-{fips}.csv"
GAZ_URL = "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_counties_national.zip"
LATEST_YEAR_CODE = "6"  # -> 7/1/2024 population estimate, confirmed against co-est2024-alldata.csv POPESTIMATE2024
STATE_FIPS = ["01","02","04","05","06","08","09","10","11","12","13","15","16","17","18","19",
              "20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35",
              "36","37","38","39","40","41","42","44","45","46","47","48","49","50","51","53",
              "54","55","56"]

def fetch(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read()

def load_centroids():
    z = zipfile.ZipFile(io.BytesIO(fetch(GAZ_URL)))
    name = next(n for n in z.namelist() if n.endswith(".txt"))
    text = z.read(name).decode("latin-1")
    centroids = {}
    for row in csv.DictReader(io.StringIO(text), delimiter="\t"):
        row = {k.strip(): v.strip() for k, v in row.items()}
        centroids[row["GEOID"]] = (float(row["INTPTLAT"]), float(row["INTPTLONG"]))
    return centroids

def load_state_counties(fips):
    text = fetch(AGESEX_URL.format(fips=fips)).decode("latin-1")
    out = []
    for row in csv.DictReader(io.StringIO(text)):
        if row["SUMLEV"] != "050" or row["YEAR"] != LATEST_YEAR_CODE:
            continue
        pop = int(row["POPESTIMATE"])
        if pop <= 0:
            continue
        out.append({
            "fips": row["STATE"] + row["COUNTY"],
            "name": row["CTYNAME"],
            "state": row["STNAME"],
            "population": pop,
            "pctMale": round(int(row["POPEST_MALE"]) / pop * 100, 1),
            "pctFemale": round(int(row["POPEST_FEM"]) / pop * 100, 1),
            "medianAge": float(row["MEDIAN_AGE_TOT"]),
            "medianAgeMale": float(row["MEDIAN_AGE_MALE"]),
            "medianAgeFemale": float(row["MEDIAN_AGE_FEM"]),
        })
    return out

def build():
    centroids = load_centroids()
    print(f"Loaded {len(centroids)} county centroids.")
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(load_state_counties, STATE_FIPS))
    counties = [c for state_rows in results for c in state_rows]
    missing = 0
    for c in counties:
        latlng = centroids.get(c["fips"])
        if latlng is None:
            missing += 1
            continue
        c["lat"], c["lng"] = round(latlng[0], 4), round(latlng[1], 4)
    counties = [c for c in counties if "lat" in c]
    data = {
        "sourceYear": 2024,
        "source": "U.S. Census Bureau, Population Estimates Program (Vintage 2024) county"
                   " population/age/sex estimates; county centroids from the 2023 Census"
                   " Gazetteer Files. Aggregate counts only — no individual-level data.",
        "generated": datetime.date.today().isoformat(),
        "counties": counties,
    }
    (ROOT / "site/locality-data.json").write_text(json.dumps(data, ensure_ascii=False) + "\n")
    print(f"Built {len(counties)} counties ({missing} missing a centroid match).")

if __name__ == "__main__":
    build()
