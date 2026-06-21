"""
Extracts Labdoo Hubs and Edoovillages into two CSV files:

1. map_points.csv  -- one row per hub / per edoovillage, ready to paste
   into a TS/React array of {iso, lat, lng, type, count, label, info}

2. country_totals.csv -- one row per country, accumulating
   {iso, donated, received} across all hubs / edoovillages in that country

Hubs are treated as "donor" points (they collect/ship out devices).
Edoovillages are treated as "recipient" points (they receive devices).

Country -> ISO3 + lat/lng centroid lookup is needed because Edoovillages
have no coordinates in the source data (only Hubs do). The lookup below
was built once from `pycountry` + a public country-centroid dataset and
is embedded here so the script has no runtime network dependency.
"""

import csv
import pandas as pd

HUBS_PATH = "../../data/Hubs_geolocated_by_city.csv"
EDOOVILLAGES_PATH = "../../data/Edoovillages.csv"

MAP_POINTS_OUT = "../../data/map_points.csv"
COUNTRY_TOTALS_OUT = "../../data/country_totals.csv"

# name -> [iso3, lat, lng]  (country centroid, used for Edoovillages and as a fallback)
COUNTRY_LOOKUP = {
    "Afghanistan": ["AFG", 34.134, 66.5922],
    "Albania": ["ALB", 41.1417, 20.0611],
    "Algeria": ["DZA", 28.351, 2.6558],
    "Angola": ["AGO", -12.1674, 17.6518],
    "Argentina": ["ARG", -35.6973, -64.5324],
    "Armenia": ["ARM", 40.1784, 45.0549],
    "Australia": ["AUS", -25.6973, 134.0228],
    "Austria": ["AUT", 47.6319, 13.7978],
    "Bangladesh": ["BGD", 23.6737, 90.4321],
    "Belarus": ["BLR", 53.4679, 27.9643],
    "Belgium": ["BEL", 50.6182, 4.675],
    "Belize": ["BLZ", 17.2425, -88.6827],
    "Benin": ["BEN", 9.503, 2.3057],
    "Bolivia": ["BOL", -16.7312, -64.4521],
    "Bosnia and Herzegovina": ["BIH", 44.1442, 17.8347],
    "Brazil": ["BRA", -11.5246, -54.3552],
    "Bulgaria": ["BGR", 42.8204, 25.2517],
    "Burkina Faso": ["BFA", 12.1087, -1.6933],
    "Burundi": ["BDI", -3.2613, 29.8852],
    "Cambodia": ["KHM", 12.6992, 105.0397],
    "Cameroon": ["CMR", 6.2942, 12.9485],
    "Cape Verde": ["CPV", 15.0764, -23.634],
    "Central African Republic": ["CAF", 6.3314, 20.5207],
    "Chad": ["TCD", 15.2835, 18.4271],
    "Chile": ["CHL", -37.8294, -70.7686],
    "China": ["CHN", 38.0733, 104.6911],
    "Colombia": ["COL", 4.1878, -72.6445],
    "Congo (Brazzaville)": ["COG", -0.7294, 14.8797],
    "Congo (Kinshasa)": ["COD", -3.3386, 23.4198],
    "Costa Rica": ["CRI", 9.8635, -84.1467],
    "Croatia": ["HRV", 44.9119, 16.6258],
    "Cuba": ["CUB", 21.4762, -79.6982],
    "Czech Republic": ["CZE", 49.7492, 15.3833],
    "Denmark": ["DNK", 56.0012, 9.3787],
    "Dominican Republic": ["DOM", 18.7795, -70.435],
    "Ecuador": ["ECU", -1.5643, -78.463],
    "Egypt": ["EGY", 26.6052, 30.2401],
    "El Salvador": ["SLV", 13.758, -88.8591],
    "Ethiopia": ["ETH", 8.7294, 39.9149],
    "Finland": ["FIN", 65.0158, 25.6574],
    "France": ["FRA", 46.6424, 2.194],
    "Gabon": ["GAB", -0.6284, 11.8394],
    "Gambia": ["GMB", 13.4286, -15.3834],
    "Georgia": ["GEO", 42.1799, 43.3789],
    "Germany": ["DEU", 51.083, 10.4262],
    "Ghana": ["GHA", 7.9453, -1.2192],
    "Greece": ["GRC", 39.4201, 23.1104],
    "Guatemala": ["GTM", 15.8209, -90.3122],
    "Guinea": ["GIN", 10.256, -10.9869],
    "Guinea-Bissau": ["GNB", 11.9801, -14.9802],
    "Haiti": ["HTI", 18.8835, -72.8929],
    "Honduras": ["HND", 14.7404, -86.4925],
    "Hong Kong S.A.R., China": ["HKG", 22.3193, 114.1694],
    "Hungary": ["HUN", 47.2253, 19.3962],
    "India": ["IND", 23.5863, 81.173],
    "Indonesia": ["IDN", 0.1559, 113.9654],
    "Iran": ["IRN", 32.906, 54.2371],
    "Iraq": ["IRQ", 33.1051, 43.8325],
    "Ireland": ["IRL", 53.3049, -8.2411],
    "Israel": ["ISR", 31.5135, 35.0279],
    "Italy": ["ITA", 42.982, 12.7637],
    "Ivory Coast": ["CIV", 7.5368, -5.5717],
    "Jordan": ["JOR", 31.3871, 36.9573],
    "Kazakhstan": ["KAZ", 47.6415, 66.3759],
    "Kenya": ["KEN", 0.6899, 37.9531],
    "Kyrgyzstan": ["KGZ", 41.357, 74.1753],
    "Laos": ["LAO", 18.1173, 103.7638],
    "Latvia": ["LVA", 56.8139, 24.6937],
    "Lebanon": ["LBN", 33.9116, 35.8965],
    "Liberia": ["LBR", 6.5201, -9.259],
    "Luxembourg": ["LUX", 49.7752, 6.1032],
    "Macedonia": ["MKD", 41.594, 21.71],
    "Madagascar": ["MDG", -19.0416, 46.6849],
    "Malawi": ["MWI", -13.129, 34.2344],
    "Mali": ["MLI", 17.1681, -4.3464],
    "Marshall Islands": ["MHL", 7.3079, 168.7202],
    "Mauritania": ["MRT", 20.4667, -10.4951],
    "Mexico": ["MEX", 23.8744, -101.554],
    "Mongolia": ["MNG", 47.0864, 103.3987],
    "Montenegro": ["MNE", 42.7369, 19.2951],
    "Morocco": ["MAR", 28.6876, -8.8172],
    "Mozambique": ["MOZ", -17.5252, 35.2086],
    "Myanmar": ["MMR", 19.9012, 97.0889],
    "Namibia": ["NAM", -21.9086, 18.1645],
    "Nepal": ["NPL", 28.3009, 84.1339],
    "Netherlands": ["NLD", 52.1341, 5.5541],
    "New Zealand": ["NZL", -43.8277, 170.6904],
    "Nicaragua": ["NIC", 12.8936, -85.0161],
    "Nigeria": ["NGA", 9.6103, 8.1477],
    "Norway": ["NOR", 64.9778, 16.6703],
    "Pakistan": ["PAK", 30.1162, 69.0884],
    "Palestinian Territory": ["PSE", 31.9308, 35.2425],
    "Panama": ["PAN", 8.4395, -80.1443],
    "Paraguay": ["PRY", -23.4219, -58.3891],
    "Peru": ["PER", -8.5227, -74.1142],
    "Philippines": ["PHL", 15.5865, 121.8221],
    "Poland": ["POL", 52.0685, 19.4357],
    "Portugal": ["PRT", 39.6753, -7.9337],
    "Romania": ["ROU", 45.8245, 25.0942],
    "Russia": ["RUS", 59.0394, 98.6705],
    "Rwanda": ["RWA", -2.0147, 29.9194],
    "Senegal": ["SEN", 14.2289, -14.6109],
    "Serbia": ["SRB", 44.0268, 20.8568],
    "Sierra Leone": ["SLE", 8.5613, -11.7866],
    "Solomon Islands": ["SLB", -9.6131, 160.1648],
    "Somalia": ["SOM", 6.5245, 45.4004],
    "South Africa": ["ZAF", -28.5536, 24.7525],
    "South Korea": ["KOR", 36.4024, 127.7622],
    "South Sudan": ["SSD", 7.6578, 30.3852],
    "Spain": ["ESP", 28.2977, -16.538],  # note: centroid incl. Canary Islands
    "Sri Lanka": ["LKA", 7.6966, 80.6693],
    "Sudan": ["SDN", 15.6706, 29.9515],
    "Swaziland": ["SWZ", -26.5625, 31.5107],
    "Sweden": ["SWE", 62.7342, 17.0624],
    "Switzerland": ["CHE", 46.7368, 8.2869],
    "Syria": ["SYR", 35.0975, 38.5117],
    "Taiwan": ["TWN", 23.6978, 120.9605],
    "Tajikistan": ["TJK", 38.5693, 70.9422],
    "Tanzania": ["TZA", -6.3558, 34.8183],
    "Thailand": ["THA", 13.6622, 101.0868],
    "Togo": ["TGO", 8.6607, 0.8991],
    "Tonga": ["TON", -21.1593, -175.2042],
    "Tunisia": ["TUN", 34.0864, 9.6559],
    "Turkey": ["TUR", 38.9321, 35.5689],
    "U.S. Virgin Islands": ["VIR", 17.738, -64.7616],
    "Uganda": ["UGA", 1.2822, 32.3437],
    "Ukraine": ["UKR", 48.6575, 31.2738],
    "United Arab Emirates": ["ARE", 24.1825, 54.2792],
    "United Kingdom": ["GBR", 53.9784, -2.8529],
    "United States": ["USA", 38.8208, -96.3316],
    "Uruguay": ["URY", -32.782, -56.0192],
    "Uzbekistan": ["UZB", 41.4879, 63.8548],
    "Vanuatu": ["VUT", -15.1891, 166.8491],
    "Venezuela": ["VEN", 7.1483, -66.3649],
    "Vietnam": ["VNM", 16.5173, 105.9134],
    "Western Sahara": ["ESH", 24.2155, -12.8858],
    "Zambia": ["ZMB", -13.1628, 27.7552],
    "Zimbabwe": ["ZWE", -18.927, 29.7178],
}
# "xx" appears in the source data as a placeholder for unknown/global
# entries (e.g. "@PlanetEarth" grassroots projects) and has no real
# country to geocode -- those rows are skipped.


def country_iso(name: str) -> str | None:
    entry = COUNTRY_LOOKUP.get(name)
    return entry[0] if entry else None


def country_centroid(name: str) -> tuple[float, float] | None:
    entry = COUNTRY_LOOKUP.get(name)
    return (entry[1], entry[2]) if entry else None


def short_hub_label(hub_field: str) -> str:
    """'Spain | Barcelona | Labdoo Hub Barcelona @LaSalle' -> 'Labdoo Hub Barcelona @LaSalle'"""
    parts = [p.strip() for p in str(hub_field).split("|")]
    return parts[-1] if parts else str(hub_field)


def build_map_points():
    hubs = pd.read_csv(HUBS_PATH)
    ev = pd.read_csv(EDOOVILLAGES_PATH)

    rows = []

    # --- Hubs -> donor points (precise lat/lng already in the data) ---
    for _, r in hubs.iterrows():
        iso = country_iso(r["Country"])
        if iso is None or pd.isna(r["Latitude"]) or pd.isna(r["Longitude"]):
            continue
        rows.append({
            "iso": iso,
            "lat": round(float(r["Latitude"]), 4),
            "lng": round(float(r["Longitude"]), 4),
            "type": "donor",
            "count": int(r["Delivered (D)"]),
            "label": short_hub_label(r["Hub"]),
            "info": f"{r['Country']} hub, {r['% Completed']}% completed, "
                    f"{r['Needed (N)']} needed",
        })

    # --- Edoovillages -> recipient points (no own coords, use country centroid) ---
    for _, r in ev.iterrows():
        iso = country_iso(r["Country"])
        centroid = country_centroid(r["Country"])
        if iso is None or centroid is None:
            continue
        lat, lng = centroid
        rows.append({
            "iso": iso,
            "lat": lat,
            "lng": lng,
            "type": "recipient",
            "count": int(r["Delivered (D)"]),
            "label": str(r["Edoovillage"])[:60],
            "info": f"{r['Country']}, {r['Status']}, "
                    f"{r['Number of students']} students",
        })

    return pd.DataFrame(rows)


def build_country_totals(map_points: pd.DataFrame):
    donated = (
        map_points[map_points["type"] == "donor"]
        .groupby("iso")["count"].sum()
        .rename("donated")
    )
    received = (
        map_points[map_points["type"] == "recipient"]
        .groupby("iso")["count"].sum()
        .rename("received")
    )
    totals = pd.concat([donated, received], axis=1).fillna(0).reset_index()
    totals["donated"] = totals["donated"].astype(int)
    totals["received"] = totals["received"].astype(int)
    return totals.sort_values("iso")


def write_map_points_csv(df: pd.DataFrame, path: str):
    """Writes plain CSV, but quoted so it can be pasted almost directly
    into a TS array if you want -- see write_map_points_ts() for that."""
    df.to_csv(path, index=False, quoting=csv.QUOTE_MINIMAL)


def write_map_points_ts(df: pd.DataFrame, path: str):
    """Optional: write the array literally in the TSX object-line format
    shown in the request, in case you want to copy-paste it directly."""
    with open(path, "w", encoding="utf-8") as f:
        for _, r in df.iterrows():
            info = str(r["info"]).replace('"', "'")
            label = str(r["label"]).replace('"', "'")
            f.write(
                f'  {{ iso: "{r["iso"]}", lat: {r["lat"]}, lng: {r["lng"]}, '
                f'type: "{r["type"]}", count: {r["count"]}, '
                f'label: "{label}", info: "{info}" }},\n'
            )


if __name__ == "__main__":
    import os
    os.makedirs("/mnt/user-data/outputs", exist_ok=True)

    map_points = build_map_points()
    write_map_points_csv(map_points, MAP_POINTS_OUT)

    country_totals = build_country_totals(map_points)
    country_totals.to_csv(COUNTRY_TOTALS_OUT, index=False)

    # optional extra: the same map points as raw TS object lines
    write_map_points_ts(map_points, "/mnt/user-data/outputs/map_points.ts.txt")

    print(f"map_points: {len(map_points)} rows -> {MAP_POINTS_OUT}")
    print(f"country_totals: {len(country_totals)} rows -> {COUNTRY_TOTALS_OUT}")
