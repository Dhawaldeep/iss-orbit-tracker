import { useEffect, useRef, useState } from 'react';

import { Viewer } from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css';

// import useGoogleEarth from './hooks/useGoogleEarth';
import ISSTrajectory from './ISSTrajectory';

function App() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Viewer>();

  // const googleEarthTileset = useGoogleEarth(viewer);

  useEffect(() => {
    if (viewerRef.current && !viewer) {
      setViewer(new Viewer(viewerRef.current, {
        baseLayerPicker: false,
        sceneModePicker: false,
      }));
    }

    if (viewer) {
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.showWaterEffect = true;
    }

    if (viewer && viewerRef.current && viewerRef.current.children.length > 1) {
      const firstChild = viewerRef.current?.firstChild;
      firstChild?.remove();
    }

    return () => viewer?.destroy();
  }, [viewerRef, viewer]);

  return <>
    <div className='viewer' ref={viewerRef}></div>

    {
      viewer &&
      <ISSTrajectory viewer={viewer} />
    }
  </>
}

export default App
