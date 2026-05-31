Place local transparent device frame PNG mockups in this folder.

EasyFrame renders device mockups as three layers:
1. Canvas/background from EasyFrame presets.
2. Your transparent PNG device frame.
3. The selected media clipped into the frame's screen area.

Supported formats:
- PNG
- JPG/JPEG
- WEBP
- SVG

Recommended naming:
- iphone-15-pro.png
- macbook-pro.png
- ipad-air.png
- google-pixel.png
- browser-window.png

The app loads this folder through `/api/mockups/devices` and shows the files in the Devices section.

No JSON file is required. EasyFrame infers the screen placement from the filename:
- Names containing `iphone`, `phone`, or unknown device names use the phone screen placement.
- Names containing `pixel` or `android` use Android phone placement.
- Names containing `ipad` or `tablet` use tablet placement.
- Names containing `macbook` or `laptop` use laptop placement.
- Names containing `browser` or `window` use browser-window placement.
