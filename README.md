# Just RSS

Just RSS was created so that people would have a RSS client that could run on their smart phone. Designed for people with less than 50 feeds but still want to use RSS without self hosting or a subscription (You can add more feeds, it may just be slow depending on your phone).

Core pillars:

- Open Source (Yah!)
- All processing done on-device
- No Ads
- No Subscription
- Distraction free

The intention is to keep Just RSS a simple app with as few features as possible, however the open source nature means that you are able to fork it and add your dream feature if that's what you want and that's cool too.

## Beta Access

[![Google Play](./docs/en_google_play_download.png)](https://play.google.com/store/apps/details?id=com.frostcube.justrss)[![Testflight](./docs/testflight.png)](https://testflight.apple.com/join/WsfbPUH1)

![Just RSS Feed Page](./docs/just_rss_feed.png)

# Developer Getting Started

```bash
npm install -g @ionic/cli native-run cordova-res
npm install -g @angular/cli
```

## Building

### Web

The local proxy currently re-writes address such as `https://www.theverge.com/` and makes them available with debugging CORS headers and then remaps them to local address. For instance the verge is available here: `http://localhost:8100/verge`

Command to run with proxy enabled for debugging: 
```
ionic serve -- --proxy-config proxy.conf.json
```

RSS local feeds:
```
http://localhost:8100/polygon/feed/
http://localhost:8100/verge/rss/index.xml
```

### Android and iOS

To rebuild assets (icon and splash screen) run:

```
npx capacitor-assets generate
```

For naming details see the relevant [Capacitor Guide](https://capacitorjs.com/docs/guides/splash-screens-and-icons)

Sync web bundle (www) to platform:
```
ionic cap copy
```

Changes to native plugins:
```
ionic cap sync
```

### Android

Open project in Android Studio:
```
ionic cap open android
```

### iOS

Open project in XCode:
```
ionic cap open ios
```

### RSS Feed Samples

```text
https://derme.coffee/index.xml
https://news.ycombinator.com/rss
https://www.polygon.com/feed/
https://www.theverge.com/rss/index.xml
https://feeds.megaphone.fm/vergecast
```
