import { useEffect, useRef, useState } from 'react';

import { SkyAtmosphere, Viewer } from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css';

import useGoogleEarth from './hooks/useGoogleEarth';

function App() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Viewer>();

  const googleEarthTileset = useGoogleEarth(viewer)

  useEffect(() => {
    if (viewerRef.current && !viewer) {
      setViewer(new Viewer(viewerRef.current, {
        globe: false,
        skyAtmosphere: new SkyAtmosphere(),
        baseLayerPicker: false,
        sceneModePicker: false,
      }));
    }

    if (viewer && viewerRef.current && viewerRef.current.children.length > 1) {
      const firstChild = viewerRef.current?.firstChild;
      firstChild?.remove();
    }

    return () => viewer?.destroy();
  }, [viewerRef, viewer]);

  useEffect(() => {
  }, [googleEarthTileset]);

  return <div className='viewer' ref={viewerRef}></div>
}

export default App
