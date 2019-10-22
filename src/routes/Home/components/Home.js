import React from 'react';
import {View, Text} from 'react-native';
import {Actions} from 'react-native-router-flux';

import {Container} from 'native-base';

import MapContainer from './MapContainer';
import HeaderComponent from '../../../components/HeaderComponent';
import FooterComponent from '../../../components/FooterComponent';
import Fare from './Fare';
import Fab from './Fab';
import FindDriver from './FindDriver';
const taxiLogo = require('../../../assets/img/taxi_logo_white.png');
const carMarker = require('../../../assets/img/carMarker.png');
class Home extends React.Component {
  componentDidMount() {
    var rx = this;
    console.log('home:componentDidMount: call getCurrentLocaion');
    this.props.getCurrentLocation();
    setTimeout(function() {
      rx.props.getNearByDrivers();
    }, 1000);
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.booking.status === 'confirmed') {
      Actions.trackDriver({type: 'reset'});
    }
    this.props.getCurrentLocation();
  }

  // 37.5407083,126.9461733 - 서울가든호텔웨딩홀
  render() {
    const region = {
      latitude: 37.5407083,
      longitude: 126.9461733,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    const {status} = this.props.booking;
    console.log('Home: region=', region, ',status=', status);
    return (
      <Container>
        {(status !== 'pending' && (
          <View style={{flex: 1}}>
            <HeaderComponent logo={taxiLogo} />
            {this.props.region.latitude && (
              <MapContainer
                region={this.props.region}
                getInputData={this.props.getInputData}
                toggleSearchResultModal={this.props.toggleSearchResultModal}
                getAddressPredictions={this.props.getAddressPredictions}
                resultTypes={this.props.resultTypes}
                predictions={this.props.predictions}
                getSelectedAddress={this.props.getSelectedAddress}
                selectedAddress={this.props.selectedAddress}
                carMarker={carMarker}
                nearByDrivers={this.props.nearByDrivers}
              />
            )}

            <Fab onPressAction={() => this.props.bookCar()} />
            {this.props.fare && <Fare fare={this.props.fare} />}
            <FooterComponent />
          </View>
        )) || <FindDriver selectedAddress={this.props.selectedAddress} />}
      </Container>
    );
  }
}

export default Home;
