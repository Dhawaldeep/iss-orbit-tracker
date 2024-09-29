import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Heading, Stack } from '@chakra-ui/react';
import { Cartesian3, Color, DistanceDisplayCondition, Entity, IonResource, JulianDate, SampledPositionProperty, TimeInterval, TimeIntervalCollection, Viewer } from 'cesium';

// import { issTrajectory } from './assets/iss_trajectory';
import useApiPolling from './hooks/useAPIPolling';

export default function ISSTrajectory({ viewer }: { viewer: Viewer }) {
  const [issEntity, setIssEntity] = useState<Entity>();
  const [track, setTrack] = useState(false);
  const [positionProperty] = useState(new SampledPositionProperty());

  const { data, loading, error } = useApiPolling('https://api.wheretheiss.at/v1/satellites/25544', 5000);

  const load3DModel = useCallback(async (viewer: Viewer, positionProperty: SampledPositionProperty,
    // { start, stop }: { start: JulianDate; stop: JulianDate; }
  ) => {
    const resource = await IonResource.fromAssetId(2729062);
    const ISSEntity = viewer.entities.add({
      availability: new TimeIntervalCollection(
        [new TimeInterval({ start: JulianDate.now(), stop: JulianDate.addDays(JulianDate.now(), 1, new JulianDate()) })]
      ),
      position: positionProperty,
      point: { pixelSize: 5, color: Color.RED, distanceDisplayCondition: new DistanceDisplayCondition(100000), },
      model: { uri: resource },
    });

    setIssEntity(ISSEntity);
  }, []);

  useEffect(() => {
    load3DModel(viewer, positionProperty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer]);

  useEffect(() => {
    if (error || !data) return;
    data.forEach(locationData => {
      const date = new Date(locationData.timestamp * 1000);
      const time = JulianDate.fromDate(date);
      const position = Cartesian3.fromDegrees(locationData.longitude, locationData.latitude, locationData.altitude * 1000);
      positionProperty.addSample(time, position);
    });
    viewer.clock.shouldAnimate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error, loading, positionProperty]);

  useEffect(() => {
    if (!issEntity) return;
    if (track) {
      viewer.flyTo(issEntity).then(() => {
        viewer.trackedEntity = issEntity;
      })
    } else {
      viewer.trackedEntity = undefined;
      viewer.camera.flyHome();
    }
  }, [issEntity, track, viewer]);

  return <Box position={'absolute'} top='60px' right='5px' boxShadow='xs' p='6' rounded='md' bg='white' minWidth='300px'>
    <Heading size="md" mb='10px'>International Space Station</Heading>
    <Stack>
      <Button size='sm' isDisabled={!issEntity} bg={track ? 'red.500' : 'black'} color={'white'} _hover={{ bg: track ? 'red.400' : 'gray.700' }} onClick={() => {
        if (issEntity) {
          setTrack(val => !val);
        };
      }}>
        {track ? 'Remove Focus' : 'Focus'}
      </Button>
    </Stack>
  </Box>
}