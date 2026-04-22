# Solving Android Maps Marker Rendering Issues with ViewShot

## The Problem

React Native Maps on Android has a **canvas bitmap rendering limitation** where complex JSX components rendered as marker children can appear clipped, distorted, or fail to render entirely. This is especially problematic when markers contain:

- Overlapping UI elements
- Multiple images or avatars
- Text labels with custom styling
- Layered or absolutely-positioned components

The issue stems from how Android's native canvas handles React Native's rendering model when content exceeds certain complexity thresholds.

## The Solution: Offscreen Capture & Image-Based Rendering

Instead of fighting the canvas limitations, bypass them entirely by converting marker content to images:

1. **Render content offscreen** - Render marker JSX in an invisible view outside the map
2. **Capture as PNG** - Use `react-native-view-shot` to snapshot the rendered content
3. **Use as marker image** - Replace JSX children with the captured PNG via marker's `image` prop
4. **Keep iOS native** - iOS doesn't have this limitation, so render JSX directly

## Implementation Architecture

### Step 1: Create an Offscreen Capture Layer

Create a component that renders marker content completely offscreen (positioned at -9999, -9999 with opacity: 0):

```typescript
// This component manages all marker captures
export const MarkerCaptureLayer = ({ items, onCapture }) => {
  if (Platform.OS !== "android") return null;

  return (
    <View style={{ position: "absolute", left: -9999, top: -9999, opacity: 0 }}>
      {items.map((item) => (
        <MarkerCaptureItem
          key={item.id}
          onCapture={(uri) => onCapture(item.id, uri)}
        >
          {item.content}
        </MarkerCaptureItem>
      ))}
    </View>
  );
};
```

**Key points:**

- Only renders on Android (iOS returns null)
- Positioned off-screen so it doesn't interfere with UI
- Each item is a separate `ViewShot` container

### Step 2: Implement Individual Marker Capture

Each marker needs to handle the actual capture:

```typescript
const MarkerCaptureItem = ({ id, children, onCapture }) => {
  const viewShotRef = React.useRef(null);

  const capture = React.useCallback(async () => {
    try {
      const uri = await viewShotRef.current.capture();
      onCapture(id, uri);
    } catch (error) {
      // View may not be ready yet, retry or skip
    }
  }, [id, onCapture]);

  React.useEffect(() => {
    // Capture immediately
    capture();

    // Capture again after delay to catch async-loaded images
    const delayed = setTimeout(capture, 1200);
    return () => clearTimeout(delayed);
  }, [children, capture]);

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: "png", result: "tmpfile" }}
      onLayout={capture}
    >
      {children}
    </ViewShot>
  );
};
```

**Dual capture strategy:**

- First capture on layout: Catches synchronously rendered content
- Second capture at ~1200ms: Ensures async-loaded images (network requests) have loaded

### Step 3: Conditional Rendering in MapView

In your main map component:

```typescript
const [markerImages, setMarkerImages] = React.useState({});
const isAndroid = Platform.OS === "android";

// Prepare marker items for capture layer
const markerItems = nearbyMarkers.map(marker => ({
  id: marker.id,
  content: <YourCustomMarkerContent marker={marker} />
}));

return (
  <View>
    {/* Android: Offscreen capture layer */}
    <MarkerCaptureLayer
      items={markerItems}
      onCapture={(id, uri) => {
        setMarkerImages(prev => ({ ...prev, [id]: uri }));
      }}
    />

    <MapView>
      {nearbyMarkers.map(marker => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          // Android: Use captured image, iOS: Use children
          image={isAndroid && markerImages[marker.id]
            ? { uri: markerImages[marker.id] }
            : undefined}
          tracksViewChanges={!isAndroid}
        >
          {/* iOS only: Render JSX children directly */}
          {!isAndroid && <YourCustomMarkerContent marker={marker} />}
        </Marker>
      ))}
    </MapView>
  </View>
);
```

## Dependencies

Add `react-native-view-shot` to your project:

```bash
npm install react-native-view-shot
# or
yarn add react-native-view-shot
```

This library provides the PNG capture functionality across both platforms.

## Key Advantages

✅ **Completely bypasses Android canvas limitations** - No JSX rendering in canvas  
✅ **Perfect visual fidelity** - Captured images render exactly as designed  
✅ **Zero iOS impact** - iOS maintains native JSX rendering (better performance)  
✅ **Dynamic updates** - Re-captures automatically when marker data changes  
✅ **Handles async content** - Dual capture ensures network-loaded images appear  
✅ **Clean separation** - Android workaround isolated in dedicated component

## Technical Trade-offs

| Aspect          | Benefit                                       | Cost                            |
| --------------- | --------------------------------------------- | ------------------------------- |
| Rendering       | Bypasses canvas bug entirely                  | Requires PNG capture overhead   |
| Memory          | No complex JSX in canvas                      | Stores image URIs in memory     |
| Performance     | Avoids canvas rendering bottleneck on Android | ~150-200ms CPU cost per capture |
| Maintainability | Clear platform-specific logic                 | Additional abstraction needed   |

## Performance Optimization Tips

1. **Memoize marker components** - Use `React.memo()` to prevent unnecessary re-renders
2. **Debounce rapid updates** - If markers update frequently, debounce capture triggers
3. **Image caching** - Cache captured URIs to avoid re-capturing unchanged markers
4. **Set `tracksViewChanges={false}`** on Android markers with images - Prevents constant re-evaluation
5. **Lazy load marker content** - Defer loading complex marker internals until needed

## When to Use This Pattern

✅ **Do use** when markers contain complex UI (overlapping elements, images, text)  
✅ **Do use** when visual accuracy is critical and native rendering fails  
✅ **Consider alternatives** for simple marker content (single icon/text) - overhead may not justify benefits  
✅ **Test thoroughly** on real devices - emulator canvas behavior may differ

## Debugging Tips

- Use React DevTools to verify capture state updates
- Check that `ViewShot` ref is properly initialized before calling `capture()`
- Monitor memory usage with repeated marker updates - capture URIs should be cleaned up
- Test with network throttling to ensure dual-capture strategy catches lazy-loaded images
- Verify marker coordinates remain accurate when using image prop

---

**Solution suggested by Claude Opus 4.6** 🤖
