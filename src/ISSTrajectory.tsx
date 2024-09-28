import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Checkbox, Heading, Stack } from '@chakra-ui/react';
import { PlusSquareIcon } from '@chakra-ui/icons';
import { Cartesian3, Entity, IonResource, JulianDate, SampledPositionProperty, TimeInterval, TimeIntervalCollection, Viewer } from 'cesium';

import { issTrajectory } from './assets/iss_trajectory';

export default function ISSTrajectory({ viewer }: { viewer: Viewer }) {
  const [issEntity, setIssEntity] = useState<Entity>();

  const load3DModel = useCallback(async (viewer: Viewer, positionProperty: SampledPositionProperty, { start, stop }: { start: JulianDate; stop: JulianDate; }) => {
    const resource = await IonResource.fromAssetId(2729062);
    const ISSEntity = viewer.entities.add({
      availability: new TimeIntervalCollection([new TimeInterval({ start: start, stop: stop })]),
      position: positionProperty,
      model: { uri: resource },
    });

    setIssEntity(ISSEntity);
  }, []);

  useEffect(() => {
    const timeStepInSeconds = 4 * 60;
    const totalSeconds = timeStepInSeconds * (issTrajectory.features.length - 1);
    const start = JulianDate.fromIso8601(issTrajectory.features[0].properties.timestamp);
    const stop = JulianDate.addSeconds(start, totalSeconds, new JulianDate());
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.timeline.zoomTo(start, stop);
    viewer.clock.multiplier = 30;
    // Start playing the scene.
    viewer.clock.shouldAnimate = true;

    const positionProperty = new SampledPositionProperty();
    const positions: Cartesian3[] = [];

    // const entities = 
    issTrajectory.features.forEach((feat, i) => {
      const time = JulianDate.addSeconds(start, i * timeStepInSeconds, new JulianDate());

      const position = Cartesian3.fromDegrees(feat.geometry.coordinates[0], feat.geometry.coordinates[1], feat.geometry.coordinates[2]);

      positionProperty.addSample(time, position);

      positions.push(position);

      // return viewer.entities.add({
      //   description: `Location: (${feat.geometry.coordinates[0]}, ${feat.geometry.coordinates[1]}, ${feat.geometry.coordinates[2]})`,
      //   position,
      //   point: { pixelSize: 2, color: Color.RED }
      // })
    });

    // viewer.entities.add({
    //   polyline: {
    //     positions,
    //     material: new ColorMaterialProperty(Color.RED),
    //   }
    // });

    load3DModel(viewer, positionProperty, { start, stop });

    // console.log(entities);
  }, [viewer, load3DModel]);

  useEffect(() => {
    console.log(issEntity);
  }, [issEntity]);

  return <Box mt={"5px"}>
    <Heading size="md">International Space Station</Heading>
    <Stack>
      <Checkbox icon={<PlusSquareIcon />} colorScheme='orange' onChange={(ev) => {
        if (ev.target.checked) {
          viewer.trackedEntity = issEntity;
        } else {
          viewer.trackedEntity = undefined;
        }
      }}>Track</Checkbox>
      <Button size='sm' bg='black' color='white' _hover={{ bg: 'gray.700' }} onClick={() => {
        if (issEntity) {
          viewer.trackedEntity = undefined;
          viewer.trackedEntity = issEntity;
        };
      }}>
        Focus
      </Button>
    </Stack>
  </Box>
}