Place local transparent device frame mockup files in this folder.

EasyFrame renders device mockups as three layers:
1. Canvas/background from EasyFrame presets.
2. The selected media clipped into the device screen.
3. Your transparent PNG device frame above the media.

Supported formats:
- PNG
- JPG/JPEG
- WEBP
- SVG

Recommended naming:
- iphone-15-pro.png
- macbook-pro.png
- ipad-air.png

The app loads this folder through `/api/mockups/devices` and shows the files in the Devices section.

For accurate screen placement, add a JSON file next to the frame with the same base name:

```json
{
  "name": "iPhone 15 Pro",
  "frameWidth": 393,
  "frameHeight": 852,
  "screen": {
    "x": 7.2,
    "y": 3.2,
    "width": 85.6,
    "height": 93.6,
    "radius": 8
  }
}
```

All `screen` values are percentages relative to the full PNG frame. If no JSON file is provided, EasyFrame uses a default phone-style screen area.
