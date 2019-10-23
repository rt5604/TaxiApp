/* eslint-disable prettier/prettier */
import React from 'react';
import {View} from 'native-base';
import MapView from 'react-native-maps';

import SearchBox from '../SearchBox';
import SearchResults from '../SearchResults';

import styles from './MapContainerStyles.js';

export const MapContainer = ({
  region,
  getInputData,
  toggleSearchResultModal,
  getAddressPredictions,
  resultTypes,
  predictions,
  getSelectedAddress,
  selectedAddress,
  carMarker,
  nearByDrivers,
}) => {
  const {selectedPickUp, selectedDropOff} = selectedAddress || {};

  //console.log('components/MapContainer:  selectedAddress = ', selectedAddress);
  //console.log('components/MapContainer:  selectedPickUp = ', selectedPickUp);
  //console.log('components/MapContainer:  selectedDropOff = ', selectedDropOff);
  console.log('components/MapContainer:  nearByDrivers = ', nearByDrivers);

  return (
    <View style={styles.container}>
      <MapView
        provider={MapView.PROVIDER_GOOGLE}
        style={styles.map}
        region={region}>
        {selectedPickUp && selectedPickUp.location.latitude && selectedPickUp.location.longitude && (
          <MapView.Marker
            coordinate={{
              latitude: selectedPickUp.location.latitude,
              longitude: selectedPickUp.location.longitude,
            }}
            pinColor="green"
          />
        )}
        {selectedDropOff && selectedDropOff.location.latitude && selectedDropOff.location.longitude && (
          <MapView.Marker
            coordinate={{
              latitude: selectedDropOff.location.latitude,
              longitude: selectedDropOff.location.longitude,
            }}
            pinColor="blue"
          />
        )}

        {nearByDrivers &&
          JSON.stringify(nearByDrivers) !== '[]' &&
          nearByDrivers.map((marker, index) => (
            <MapView.Marker
              key={index}
              coordinate={{
                latitude: marker.coordinate.coordinates[1],
                longitude: marker.coordinate.coordinates[0],
              }}
              image={carMarker}
            />
          ))}
      </MapView>
      {console.log('components/MapContainer:  End of MapView')}
      <SearchBox
        getInputData={getInputData}
        toggleSearchResultModal={toggleSearchResultModal}
        getAddressPredictions={getAddressPredictions}
        selectedAddress={selectedAddress}
      />
      {console.log('components/MapContainer:  End of SearchBox')}
      {(resultTypes.pickUp || resultTypes.dropOff) && (
        <SearchResults
          predictions={predictions}
          getSelectedAddress={getSelectedAddress}
        />
      )}
      {console.log('components/MapContainer:  End of SearchResults')}
    </View>
  );
};

export default MapContainer;
