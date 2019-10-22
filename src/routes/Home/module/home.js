// HomeReducer
import update from 'react-addons-update';
import constants from './actionConstants';
import {Dimensions} from 'react-native';
import RNGooglePlaces from 'react-native-google-places';
import Geolocation from '@react-native-community/geolocation';
import request from '../../../util/request';

import calculateFare from '../../../util/fareCalculator.js';

//--------------------
//Constants
//--------------------
const {
  GET_CURRENT_LOCATION,
  GET_INPUT,
  TOGGLE_SEARCH_RESULT,
  GET_ADDRESS_PREDICTIONS,
  GET_SELECTED_ADDRESS,
  GET_DISTANCE_MATRIX,
  GET_FARE,
  BOOK_CAR,
  GET_NEARBY_DRIVERS,
} = constants;

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = ASPECT_RATIO * LATITUDE_DELTA;

//--------------------
//Actions
//--------------------
export function getCurrentLocation() {
  // console.log('home: getCurrentLocation');
  return dispatch => {
    Geolocation.getCurrentPosition(
      position => {
		// console.log('home: Geolocation.getCurrentPosition: position=', position);
		//position.altitude = 37.5407083;
		//position.longitude = 126.9461733;
        dispatch({
          type: GET_CURRENT_LOCATION,
          payload: position,
        });
      },
      error => console.log(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };
}

//GET USER INPUT

export function getInputData(payload) {
  return {
    type: GET_INPUT,
    payload,
  };
}

//toggle search result modal
export function toggleSearchResultModal(payload) {
  console.log('HomeReducer: toggleSearchResultModal = ', toggleSearchResultModal);
  return {
    type: TOGGLE_SEARCH_RESULT,
    payload,
  };
}

//GET ADRESSES FROM GOOGLE PLACE

export function getAddressPredictions() {
  console.log('HomeReducer: getAddressPredictions:');
  return (dispatch, store) => {
    let userInput = store().home.resultTypes.pickUp
      ? store().home.inputData.pickUp
      : store().home.inputData.dropOff;
    console.log('HomeReducer: getAddressPredictions: userInput = ', userInput);
    RNGooglePlaces.getAutocompletePredictions(userInput, {
      country: 'KR',
    })
      .then(results =>
        dispatch({
          type: GET_ADDRESS_PREDICTIONS,
          payload: results,
        }),
      )
      .catch(error => console.log('getAddressPredictions: error=', error.message));
  };
}

//get selected address

export function getSelectedAddress(payload) {
  const dummyNumbers = {
    baseFare: 0.4,
    timeRate: 0.14,
    distanceRate: 0.97,
    surge: 1,
  };
  return (dispatch, store) => {
    console.log('HomeReducer: getSelectedAddress: payload = ', payload);
    RNGooglePlaces.lookUpPlaceByID(payload)
      .then(results => {
        dispatch({
          type: GET_SELECTED_ADDRESS,
          payload: results,
        });
      })
      .then(() => {
        //Get the distance and time
        if (
          store().home.selectedAddress.selectedPickUp &&
          store().home.selectedAddress.selectedDropOff
        ) {
          request
            .get('https://maps.googleapis.com/maps/api/distancematrix/json')
            .query({
              origins:
                store().home.selectedAddress.selectedPickUp.latitude +
                ',' +
                store().home.selectedAddress.selectedPickUp.longitude,
              destinations:
                store().home.selectedAddress.selectedDropOff.latitude +
                ',' +
                store().home.selectedAddress.selectedDropOff.longitude,
              mode: 'driving',
              key: 'AIzaSyBM5PoSvQr_jbDGtHk8qjc22NVMYg5wH9Q',
            })
            .finish((error, res) => {
              dispatch({
                type: GET_DISTANCE_MATRIX,
                payload: res.body,
              });
            });
        }
        console.log('HomeReducer: getSelectedAddress: call setTimeout');
        setTimeout(function() {
          let distanceMatrix = store().home.distanceMatrix;
          console.log('HomeReducer: distanceMatrix=', distanceMatrix);
          if (
            store().home.selectedAddress.selectedPickUp &&
            store().home.selectedAddress.selectedDropOff &&
            distanceMatrix.destination_addresses !== '' &&
            distanceMatrix.rows[0].elements[0].status !== 'NOT_FOUND'
          ) {
            console.log('HomeReducer: getSelectedAddress: length=',distanceMatrix.rows[0].elements.length);
            console.log('HomeReducer: getSelectedAddress: distanceMatrix=',distanceMatrix);
            const fare = calculateFare(
              dummyNumbers.baseFare,
              dummyNumbers.timeRate,
              store().home.distanceMatrix.rows[0].elements[0].duration.value,
              dummyNumbers.distanceRate,
              store().home.distanceMatrix.rows[0].elements[0].distance.value,
              dummyNumbers.surge,
            );
            console.log('HomeReducer: getSelectedAddress: fare=',fare);
            dispatch({
              type: GET_FARE,
              payload: fare,
            });
          }
        }, 2000);
      })
      .catch(error => console.log(error.message));
  };
}

//BOOK CAR

export function bookCar() {
  return (dispatch, store) => {
    const nearByDrivers = store().home.nearByDrivers;
    if (!nearByDrivers) {
      console.log('nearByDrivers is not defined yet.');
      return null;
    }
    console.log('HomeReducer:bookCar:nearByDrivers=', nearByDrivers);
    const nearByDriver =
      nearByDrivers[Math.floor(Math.random() * nearByDrivers.length)];

    const payload = {
      data: {
        userName: 'eman',
        pickUp: {
          address: store().home.selectedAddress.selectedPickUp.address,
          name: store().home.selectedAddress.selectedPickUp.name,
          latitude: store().home.selectedAddress.selectedPickUp.latitude,
          longitude: store().home.selectedAddress.selectedPickUp.latitude,
        },
        dropOff: {
          address: store().home.selectedAddress.selectedDropOff.address,
          name: store().home.selectedAddress.selectedDropOff.name,
          latitude: store().home.selectedAddress.selectedDropOff.latitude,
          longitude: store().home.selectedAddress.selectedDropOff.latitude,
        },
        fare: store().home.fare,
        status: 'pending',
      },
      nearByDriver: {
        socketId: nearByDriver.socketId,
        driverId: nearByDriver.driverId,
        latitude: nearByDriver.coordinate.coordinates[1],
        longitude: nearByDriver.coordinate.coordinates[0],
      },
    };

    request
      .post('http://localhost:3000/api/bookings')
      .send(payload)
      .finish((error, res) => {
        dispatch({
          type: BOOK_CAR,
          payload: res.body,
        });
      });
  };
}

//get nearby drivers

export function getNearByDrivers() {
  console.log('HomeReducer: getNearByDrivers()');
  return (dispatch, store) => {
    request
      .get('http://localhost:3000/api/driverLocation')
      .query({
        latitude: 37.5407083,
        longitude: 126.9461733,
      })
      .finish((error, res) => {
        console.log('getNearByDrivers: error = ', error, 'res = ', res);
        if (res) {
          dispatch({
            type: GET_NEARBY_DRIVERS,
            payload: res.body,
          });
        }
      });
  };
}
//--------------------
//Action Handlers
//--------------------
function handleGetCurrentLocation(state, action) {
  //console.log('home: handleGetCurrentLocation: lat=',action.payload.coords.latitude,',long=',action.payload.coords.longitude);
  return update(state, {
    region: {
      latitude: {
        $set: action.payload.coords.latitude,
      },
      longitude: {
        $set: action.payload.coords.longitude,
      },
      latitudeDelta: {
        $set: LATITUDE_DELTA,
      },
      longitudeDelta: {
        $set: LONGITUDE_DELTA,
      },
    },
  });
}

function handleGetInputDate(state, action) {
  const {key, value} = action.payload;
  return update(state, {
    inputData: {
      [key]: {
        $set: value,
      },
    },
  });
}

function handleToggleSearchResult(state, action) {
  console.log('HomeReducer: handleToggleSearchResult: action=', action);
  if (action.payload === 'pickUp') {
	console.log('HomeReducer: handleToggleSearchResult: pickUp');
    return update(state, {
      resultTypes: {
        pickUp: {
          $set: true,
        },
        dropOff: {
          $set: false,
        },
      },
      predictions: {
        $set: {},
      },
    });
  }
  if (action.payload === 'dropOff') {
    return update(state, {
      resultTypes: {
        pickUp: {
          $set: false,
        },
        dropOff: {
          $set: true,
        },
      },
      predictions: {
        $set: {},
      },
    });
  }
}

function handleGetAddressPredictions(state, action) {
  return update(state, {
    predictions: {
      $set: action.payload,
    },
  });
}

function handleGetSelectedAddress(state, action) {
  let selectedTitle = state.resultTypes.pickUp
    ? 'selectedPickUp'
    : 'selectedDropOff';
  return update(state, {
    selectedAddress: {
      [selectedTitle]: {
        $set: action.payload,
      },
    },
    resultTypes: {
      pickUp: {
        $set: false,
      },
      dropOff: {
        $set: false,
      },
    },
  });
}

function handleGetDitanceMatrix(state, action) {
  return update(state, {
    distanceMatrix: {
      $set: action.payload,
    },
  });
}

function handleGetFare(state, action) {
  console.log('HomeReducer: handleGetFare: action=', action);
  return update(state, {
    fare: {
      $set: action.payload,
    },
  });
}

//handle book car

function handleBookCar(state, action) {
  console.log('HomeReducer: handleBookCar: action=', action);
  return update(state, {
    booking: {
      $set: action.payload,
    },
  });
}

//handle get nearby drivers
function handleGetNearbyDrivers(state, action) {
  console.log('HomeReducer: handleGetNearbyDrivers: action=', action);
  return update(state, {
    nearByDrivers: {
      $set: action.payload,
    },
  });
}

function handleBookingConfirmed(state, action) {
  console.log('HomeReducer: handleBookingConfirmed: action=', action);
  return update(state, {
    booking: {
      $set: action.payload,
    },
  });
}

const ACTION_HANDLERS = {
  GET_CURRENT_LOCATION: handleGetCurrentLocation,
  GET_INPUT: handleGetInputDate,
  TOGGLE_SEARCH_RESULT: handleToggleSearchResult,
  GET_ADDRESS_PREDICTIONS: handleGetAddressPredictions,
  GET_SELECTED_ADDRESS: handleGetSelectedAddress,
  GET_DISTANCE_MATRIX: handleGetDitanceMatrix,
  GET_FARE: handleGetFare,
  BOOK_CAR: handleBookCar,
  GET_NEARBY_DRIVERS: handleGetNearbyDrivers,
  BOOKING_CONFIRMED: handleBookingConfirmed,
};
const initialState = {
  region: {},
  inputData: {},
  resultTypes: {},
  selectedAddress: {},
};

export function HomeReducer(state = initialState, action) {
  // console.log('HomeReducer: action = ', action);
  const handler = ACTION_HANDLERS[action.type];
  console.log('HomeReducer: handler = ', handler);

  return handler ? handler(state, action) : state;
}
