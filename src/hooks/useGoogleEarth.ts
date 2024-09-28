import { Cesium3DTileset, Viewer } from 'cesium';
import { useCallback, useEffect, useState } from 'react';

export default function useGoogleEarth(viewer?: Viewer) {
  const [added, setAdded] = useState(false);
  const [googleEarth3DTiles, setGoogleEarth3DTiles] = useState<Cesium3DTileset>();

  const addGoogleEarthGlobe = useCallback(async (viewer: Viewer) => {
    const googleEarth3DTiles = await Cesium3DTileset.fromIonAssetId(2275207);
    viewer.scene.primitives.add(googleEarth3DTiles);
    setGoogleEarth3DTiles(googleEarth3DTiles);
  }, []);

  useEffect(() => {
    if (viewer) {
      if (!added) {
        addGoogleEarthGlobe(viewer)
        setAdded(true);
      }
    }
  }, [viewer, addGoogleEarthGlobe, added]);

  return googleEarth3DTiles;
}