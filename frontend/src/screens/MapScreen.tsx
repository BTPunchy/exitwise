// import React from 'react';
// import { View, Text } from 'react-native';
// // import Mapbox from '@rnmapbox/maps';
// import { INITIAL_REGION } from '../constants/stations';

// export const MapScreen = () => {
//   return (
//     <View className="flex-1">
//       <Mapbox.MapView style={{ flex: 1 }}>
//         <Mapbox.Camera
//           zoomLevel={14}
//           centerCoordinate={[INITIAL_REGION.longitude, INITIAL_REGION.latitude]}
//         />
//       </Mapbox.MapView>
//       {/* Overlay controls */}
//       <View className="absolute top-12 left-4 right-4 bg-white/90 p-3 rounded-lg shadow flex-row items-center border border-sky-100">
//          <Text className="text-[#0EA5E9] font-bold">ExitWise Location Engine</Text>
//       </View>
//     </View>
//   );
// };
import React from 'react';
import { View, Text } from 'react-native';
// import Mapbox from '@rnmapbox/maps';
import { INITIAL_REGION } from '../constants/stations';

export const MapScreen = () => {
  return (
    <View className="flex-1">
      <Text>Map placeholder</Text>
    </View>
  );
};
