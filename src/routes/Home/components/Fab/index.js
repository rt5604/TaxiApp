import React from 'react';
import {Text} from 'react-native';
import {View, Button} from 'native-base';

import styles from './FabStyles.js';

export const Fab = ({onPressAction}) => {
  console.log('Fab: onPressAction = ', onPressAction);
  return (
    <Button style={styles.fabContainer} onPress={onPressAction}>
      <Text style={styles.btnText}> Book </Text>
      { console.log('Fab: after Text') }
    </Button>
  );
};

export default Fab;
