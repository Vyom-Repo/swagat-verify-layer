from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from geopy.distance import geodesic
from pillow_heif import register_heif_opener

register_heif_opener()

def get_exif_data(image_path: str) -> dict:
    """Extracts and decodes EXIF metadata from an image file."""
    image = Image.open(image_path)
    exif_data = {}
    info = image._getexif()
    
    if not info:
        return exif_data

    for tag, value in info.items():
        decoded = TAGS.get(tag, tag)
        if decoded == "GPSInfo":
            gps_data = {}
            for t in value:
                sub_decoded = GPSTAGS.get(t, t)
                gps_data[sub_decoded] = value[t]
            exif_data[decoded] = gps_data
        else:
            exif_data[decoded] = value
            
    return exif_data

def _convert_to_degrees(value: tuple) -> float:
    """Converts GPS coordinates from DMS format to Decimal Degrees."""
    def safe_float(v):
        try:
            return float(v)
        except ZeroDivisionError:
            return 0.0
            
    degrees = safe_float(value[0])
    minutes = safe_float(value[1])
    seconds = safe_float(value[2])
    
    return degrees + (minutes / 60.0) + (seconds / 3600.0)

def extract_lat_lon(image_path: str):
    """Retrieves decimal latitude and longitude from image EXIF data."""
    exif_data = get_exif_data(image_path)
    gps_info = exif_data.get("GPSInfo")
    
    if gps_info and "GPSLatitude" in gps_info and "GPSLongitude" in gps_info:
        lat = _convert_to_degrees(gps_info["GPSLatitude"])
        lon = _convert_to_degrees(gps_info["GPSLongitude"])
        
        if gps_info.get("GPSLatitudeRef") == "S": 
            lat = -lat
        if gps_info.get("GPSLongitudeRef") == "W": 
            lon = -lon
            
        return lat, lon
        
    return None, None

def verify_location(image_path: str, target_lat: float, target_lon: float, max_distance_meters: int = 50):
    """
    Validates if an image was taken within a specified radius of target coordinates.
    Returns: (is_valid: bool, status_message: str, actual_coords: tuple)
    """
    photo_lat, photo_lon = extract_lat_lon(image_path)
    
    if photo_lat is None or photo_lon is None:
        return False, "Verification Failed: No GPS data found in image.", None

    photo_coords = (photo_lat, photo_lon)
    target_coords = (target_lat, target_lon)
    
    distance = geodesic(photo_coords, target_coords).meters
    is_valid = distance <= max_distance_meters
    
    return is_valid, f"Distance offset: {round(distance, 2)} meters", photo_coords